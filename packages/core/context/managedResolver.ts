import EventEmitter from "events";
import { AirContainerInterface, ObjectDefinitionInterface, ObjectLifeCycleEvent, Value } from "../interface";
import {
  ManagedResolverFactoryCreateOptionsInterface,
  ManagedResolverInterface
} from "../interface/managedResolver.interface";
import {KEYS} from "../common/constant";
import * as util from "util"
import {
  CoreCommonError,
  CoreDefinitionNotFoundError,
  CoreMissingImportComponentError,
  CoreResolverMissingError,
  CoreSingletonInjectRequestError
} from "../error/core";
import { AutowiredModeEnum, ManagedInstanceInterface, ObjectIdentifier } from "../decorator";



export const REQUEST_CTX_KEY = 'ctx';
export const REQUEST_OBJ_CTX_KEY = '_req_ctx';

const debug = util.debuglog("framework:managedResolver")
const debugLog = util.debuglog("framework")

export class ManagedReference implements ManagedInstanceInterface {
  type = KEYS.REF_ELEMENT;
  name: string;
  autowiredMode: AutowiredModeEnum;
  args?: any;
}

/**
 * 解析器存储
 */
export interface Resolvers {
  [key:string|number|symbol]:ManagedResolverInterface
}
/**
 * 解析ref
 */
class RefResolver{
  constructor(readonly factory: ManagedResolverFactory) {}
  get type(): string {
    return KEYS.REF_ELEMENT;
  }

  resolve(managed: ManagedInstanceInterface, originName: string): any {
    const mr = managed as ManagedReference;
    if (
      mr.autowiredMode === AutowiredModeEnum.Class &&
      !(this.factory.context.parent ?? this.factory.context).hasDefinition(
        mr.name
      )
    ) {
      throw new CoreMissingImportComponentError(originName);
    }
    return this.factory.context.get(mr.name, mr.args as any[], {
      originName,
    });
  }

  async resolveAsync(
    managed: ManagedInstanceInterface,
    originName: string
  ): Promise<any> {
    const mr = managed as ManagedReference;
    if (
      mr.autowiredMode === AutowiredModeEnum.Class &&
      !(this.factory.context.parent ?? this.factory.context).hasDefinition(
        mr.name
      )
    ) {
        throw new CoreMissingImportComponentError(originName);
    }
    return this.factory.context.getAsync(mr.name, mr.args as any[], {
      originName,
    });
  }
}
/**
 * 解析工厂
 */
export class ManagedResolverFactory {
  private resolvers:Resolvers = {};
  private creating = new Map<string, boolean>();
  singletonCache = new Map<ObjectIdentifier, any>();
  context: AirContainerInterface;

  constructor(context: AirContainerInterface) {
    this.context = context;
    // 初始化解析器
    this.resolvers = {
      ref: new RefResolver(this),
    };
  }

  /**
   * 注册解析器
   * @param resolver
   */
  registerResolver(resolver: ManagedResolverInterface) {
    this.resolvers[resolver.type] = resolver;
  }

  resolveManaged(managed: ManagedInstanceInterface, originPropertyName: string): any {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new CoreResolverMissingError(managed.type);
    }
    return resolver.resolve(managed, originPropertyName);
  }

  /**
   * 异步解析
   * @param managed 解析器
   * @param originPropertyName 原始属性名
   */
  async resolveManagedAsync(
    managed: ManagedInstanceInterface,
    originPropertyName: string
  ): Promise<any> {
    const resolver = this.resolvers[managed.type];
    if (!resolver || resolver.type !== managed.type) {
      throw new CoreResolverMissingError(managed.type);
    }
    return resolver.resolveAsync(managed, originPropertyName);
  }

  /**
   * 同步创建对象
   * @param opt
   */
  create(opt: ManagedResolverFactoryCreateOptionsInterface): any {
    const { definition, args } = opt;
    if (
      definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)
    ) {
      return this.singletonCache.get(definition.id);
    }
    // 如果非 null 表示已经创建 proxy
    let inst = this.createProxyReference(definition);
    if (inst) {
      return inst;
    }

    this.compareAndSetCreateStatus(definition);
    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        this.context.get(dep, args as any[]);
      }
    }

    const clazz = definition.creator.load();

    let constructorArgs = [];
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
    }

    this.getObjectEventTarget().emit(
      ObjectLifeCycleEvent.BEFORE_CREATED,
      clazz,
      {
        constructorArgs,
        definition,
        context: this.context,
      }
    );

    inst = definition.creator.doConstruct(clazz, constructorArgs, this.context);

    // binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.propertyKeys() as string[];
      for (const key of keys) {
        this.checkSingletonInvokeRequest(definition, key);
        try {
          const managed = definition.properties.get(key)
          inst[key] = this.resolveManaged(managed, key);
        } catch (error) {
          if (CoreDefinitionNotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, true);
          throw error;
        }
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: this.context,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    // after properties set then do init
    definition.creator.doInit(inst);

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_INIT, inst, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      this.context.registerObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  /**
   * 异步创建对象
   * @param opt
   */
  async createAsync(opt: ManagedResolverFactoryCreateOptionsInterface): Promise<any> {
    const { definition, args } = opt;
    if (
      definition.isSingletonScope() &&
      this.singletonCache.has(definition.id)
    ) {
      debug(
        `id = ${definition.id}(${definition.name}) get from singleton cache.`
      );
      return this.singletonCache.get(definition.id);
    }

    // 如果非 null 表示已经创建 proxy
    let inst = this.createProxyReference(definition);
    if (inst) {
      debug(`id = ${definition.id}(${definition.name}) from proxy reference.`);
      return inst;
    }

    this.compareAndSetCreateStatus(definition);
    // 预先初始化依赖
    if (definition.hasDependsOn()) {
      for (const dep of definition.dependsOn) {
        debug('id = %s init depend %s.', definition.id, dep);
        await this.context.getAsync(dep, args as any[]);
      }
    }

    debugLog(`[core]: Create id = "${definition.name}" ${definition.id}.`);

    const Clazz = definition.creator.load();
    let constructorArgs = [];
    if (args && Array.isArray(args) && args.length > 0) {
      constructorArgs = args;
    }

    this.getObjectEventTarget().emit(
      ObjectLifeCycleEvent.BEFORE_CREATED,
      Clazz,
      {
        constructorArgs,
        context: this.context,
      }
    );

    inst = await definition.creator.doConstructAsync(
      Clazz,
      constructorArgs,
      this.context
    );
    if (!inst) {
      this.removeCreateStatus(definition, false);
      throw new CoreCommonError(
        `${definition.id} construct return undefined`
      );
    }

    // binding ctx object
    if (
      definition.isRequestScope() &&
      definition.constructor.name === 'ObjectDefinition'
    ) {
      debug('id = %s inject ctx', definition.id);
      Object.defineProperty(inst, REQUEST_OBJ_CTX_KEY, {
        value: this.context.get(REQUEST_CTX_KEY),
        writable: false,
        enumerable: false,
      });
    }

    if (definition.properties) {
      const keys = definition.properties.propertyKeys() as string[];
      for (const key of keys) {
        this.checkSingletonInvokeRequest(definition, key);
        try {
          inst[key] = await this.resolveManagedAsync(
            definition.properties.get(key) as ManagedResolverInterface,
            key
          );
        } catch (error) {
          if (CoreDefinitionNotFoundError.isClosePrototypeOf(error)) {
            const className = definition.path.name;
            error.updateErrorMsg(className);
          }
          this.removeCreateStatus(definition, false);
          throw error;
        }
      }
    }

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_CREATED, inst, {
      context: this.context,
      definition,
      replaceCallback: ins => {
        inst = ins;
      },
    });

    // after properties set then do init
    await definition.creator.doInitAsync(inst);

    this.getObjectEventTarget().emit(ObjectLifeCycleEvent.AFTER_INIT, inst, {
      context: this.context,
      definition,
    });

    if (definition.isSingletonScope() && definition.id) {
      debug(`id = ${definition.id}(${definition.name}) set to singleton cache`);
      this.singletonCache.set(definition.id, inst);
    }

    // for request scope
    if (definition.isRequestScope() && definition.id) {
      debug(`id = ${definition.id}(${definition.name}) set to register object`);
      this.context.registerObject(definition.id, inst);
    }
    this.removeCreateStatus(definition, true);

    return inst;
  }

  async destroyCache(): Promise<void> {
    for (const key of this.singletonCache.keys()) {
      const definition = this.context.registry.getDefinition(key);
      if (definition.creator) {
        const inst = this.singletonCache.get(key);
        this.getObjectEventTarget().emit(
          ObjectLifeCycleEvent.BEFORE_DESTROY,
          inst,
          {
            context: this.context,
            definition,
          }
        );
        await definition.creator.doDestroyAsync(inst);
      }
    }
    this.singletonCache.clear();
    this.creating.clear();
  }

  /**
   * 触发单例初始化结束事件
   * @param definition 单例定义
   * @param success 成功 or 失败
   */
  private removeCreateStatus(
    definition: ObjectDefinitionInterface,
    success: boolean
  ): boolean {
    // 如果map中存在表示需要设置状态
    if (this.creating.has(definition.id)) {
      this.creating.set(definition.id, false);
    }
    return true;
  }

  public isCreating(definition: ObjectDefinitionInterface) {
    return this.creating.has(definition.id) && this.creating.get(definition.id);
  }

  private compareAndSetCreateStatus(definition: ObjectDefinitionInterface) {
    if (
      !this.creating.has(definition.id) ||
      !this.creating.get(definition.id)
    ) {
      this.creating.set(definition.id, true);
    }
  }
  /**
   * 创建对象定义的代理访问逻辑
   * @param definition 对象定义
   */
  private createProxyReference(definition: ObjectDefinitionInterface): any {
    if (this.isCreating(definition)) {
      debug('create proxy for %s.', definition.id);
      // 非循环依赖的允许重新创建对象
      if (!this.depthFirstSearch(definition.id, definition)) {
        debug('id = %s after dfs return null', definition.id);
        return null;
      }
      // 创建代理对象
      return new Proxy(
        { __is_proxy__: true, __target_id__: definition.id },
        {
          get: (obj, prop) => {
            let target;
            if (definition.isRequestScope()) {
              target = this.context.registry.getObject(definition.id);
            } else if (definition.isSingletonScope()) {
              target = this.singletonCache.get(definition.id);
            } else {
              target = this.context.get(definition.id);
            }

            if (target) {
              if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
              }
              return target[prop];
            }

            return undefined;
          },
        }
      );
    }
    return null;
  }
  /**
   * 遍历依赖树判断是否循环依赖
   * @param identifier 目标id
   * @param definition 定义描述
   * @param depth
   */
  public depthFirstSearch(
    identifier: string,
    definition: ObjectDefinitionInterface,
    depth?: string[]
  ): boolean {
    if (definition) {
      debug('dfs for %s == %s start.', identifier, definition.id);
      if (definition.properties) {
        const keys = definition.properties.propertyKeys() as string[];
        if (keys.indexOf(identifier) > -1) {
          debug('dfs exist in properties %s == %s.', identifier, definition.id);
          return true;
        }
        for (const key of keys) {
          if (!Array.isArray(depth)) {
            depth = [identifier];
          }
          let iden = key;
          const ref: ManagedReference = definition.properties.get(key);
          if (ref && ref.name) {
            iden =
              this.context.identifierMapping.getRelation(ref.name) ?? ref.name;
          }
          if (iden === identifier) {
            debug(
              'dfs exist in properties key %s == %s.',
              identifier,
              definition.id
            );
            return true;
          }
          if (depth.indexOf(iden) > -1) {
            debug(
              'dfs depth circular %s == %s, %s, %j.',
              identifier,
              definition.id,
              iden,
              depth
            );
            continue;
          } else {
            depth.push(iden);
            debug('dfs depth push %s == %s, %j.', identifier, iden, depth);
          }
          let subDefinition = this.context.registry.getDefinition(iden);
          if (!subDefinition && this.context.parent) {
            subDefinition = this.context.parent.registry.getDefinition(iden);
          }
          if (this.depthFirstSearch(identifier, subDefinition, depth)) {
            debug(
              'dfs exist in sub tree %s == %s subId = %s.',
              identifier,
              definition.id,
              subDefinition.id
            );
            return true;
          }
        }
      }
      debug('dfs for %s == %s end.', identifier, definition.id);
    }
    return false;
  }

  private getObjectEventTarget(): EventEmitter {
    if (this.context.parent) {
      return this.context.parent.objectCreateEventTarget;
    }
    return this.context.objectCreateEventTarget;
  }

  private checkSingletonInvokeRequest(definition:ObjectDefinitionInterface, key:string) {
    if (definition.isSingletonScope()) {
      const managedRef = definition.properties.get(key) as Value;
      if (this.context.hasDefinition(managedRef?.name as ObjectIdentifier)) {
        const propertyDefinition = this.context.registry.getDefinition(
          managedRef.name as ObjectIdentifier
        );
        if (
          propertyDefinition.isRequestScope() &&
          !propertyDefinition.allowDowngrade
        ) {
          throw new CoreSingletonInjectRequestError(
            definition.path.name,
            propertyDefinition.path.name
          );
        }
      }
    }
    return true;
  }
}
