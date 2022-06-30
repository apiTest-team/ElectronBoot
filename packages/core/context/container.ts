import {
  ContainerInterface,
  IdentifierRelationShipInterface,
  ObjectBeforeBindOptions,
  ObjectBeforeCreatedOptions,
  ObjectBeforeDestroyOptions,
  ObjectContext, ObjectCreatedOptions,
  ObjectDefinitionInterface,
  ObjectDefinitionRegistryInterface, ObjectInitOptions
} from "../interface";
import { ModuleStoreInterface, ObjectIdentifier, ScopeEnum } from "@electron-boot/decorator";
import EventEmitter from "events";
import { ManagedResolverFactory, REQUEST_CTX_KEY } from "./managedResolverFactory";
import {FileDetectorInterface} from "../interface/fileDetector.interface";
import { ObjectDefinitionRegistry } from "./definitionRegistry";
import { Types,Utils } from "@electron-boot/decorator/utils";
import { getComponentId } from "@electron-boot/decorator/manager/default.manager";
import { FUNCTION_INJECT_KEY } from "../common/constant";
import { FrameworkDefinitionNotFoundError } from "../error/framework";

/**
 * 应用容器
 */
export class ElectronBootContainer implements ContainerInterface,ModuleStoreInterface{
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: ObjectDefinitionRegistryInterface = null;
  private _identifierMapping = null;
  private moduleMap = null;
  private _objectCreateEventTarget: EventEmitter;
  public parent: ContainerInterface = null;
  // 仅仅用于兼容requestContainer的ctx
  protected ctx = {};
  private fileDetector: FileDetectorInterface;
  private attrMap: Map<string, any> = new Map();
  private _namespaceSet: Set<string> = null;
  private isLoad = false;
  get registry(): ObjectDefinitionRegistryInterface {
    if (!this._registry) {
      this._registry = new ObjectDefinitionRegistry();
    }
    return this._registry;
  }
  get identifierMapping(): IdentifierRelationShipInterface {
    if (!this._identifierMapping) {
      this._identifierMapping = this.registry.getIdentifierRelation();
    }
    return this._identifierMapping;
  }
  get objectCreateEventTarget() {
    if (!this._objectCreateEventTarget) {
      this._objectCreateEventTarget = new EventEmitter();
    }
    return this._objectCreateEventTarget;
  }

  constructor(parent?: ContainerInterface) {
    this.parent = parent;
    this.init();
  }

  /**
   * 初始化
   * @protected
   */
  protected init() {
    // 防止直接从applicationContext.getAsync or get对象实例时依赖当前上下文信息出错
    // ctx is in requestContainer
    this.registerObject(REQUEST_CTX_KEY, this.ctx);
  }

  bind<T>(target: T, options?: Partial<ObjectDefinitionInterface>): void;
  bind<T>(identifier: ObjectIdentifier, target: T, options?: Partial<ObjectDefinitionInterface>): void;
  bind(identifier:any, target:any, options?: Partial<ObjectDefinitionInterface>): void {
    if (Types.isClass(identifier) || Types.isFunction(identifier)){
      return this.bindModule(identifier,target as Partial<ObjectDefinitionInterface>)
    }
    if (this.registry.hasDefinition(identifier as ObjectIdentifier)){
      return
    }
  }

  /**
   * 绑定类
   * @param exports 导入的类
   * @param options
   */
  bindClass(exports, options?: Partial<ObjectDefinitionInterface>) {
    if (Types.isClass(exports)||Types.isFunction(exports)){
      this.bindModule(exports,options)
    }else{
      for (const exportsKey in exports) {
        const module = exports[exportsKey]
        if (Types.isClass(module) || Types.isFunction(module)){
          this.bindModule(module,options)
        }
      }
    }
  }

  /**
   * 创建子容器
   */
  createChild(): ContainerInterface {
    return new ElectronBootContainer();
  }

  get<T>(identifier: { new(...args): T }, args?: any[], objectContext?: ObjectContext): T;
  get<T>(identifier: ObjectIdentifier, args?: any[], objectContext?: ObjectContext): T;
  get(identifier: any, args?: any[], objectContext?: ObjectContext): any {
    args = args??[]
    objectContext = objectContext?? {originName:identifier}
    if (typeof identifier!=="string"){
      objectContext.originName = identifier.name
      identifier = this.getIdentifier(identifier)
    }
    if (this.registry.hasObject(identifier as ObjectIdentifier)){
      return this.registry.getObject(identifier as ObjectIdentifier)
    }
    const definition = this.registry.getDefinition(identifier as ObjectIdentifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier as ObjectIdentifier, args);
    }

  }

  getAsync<T>(identifier: { new(...args): T }, args?: any[], objectContext?: ObjectContext): Promise<T>;
  getAsync<T>(identifier: ObjectIdentifier, args?: any[], objectContext?: ObjectContext): Promise<T>;
  getAsync(identifier:any, args?: any[], objectContext?: ObjectContext): Promise<any> {
    args = args ?? [];
    objectContext = objectContext ?? { originName: identifier };
    if (typeof identifier !== 'string') {
      objectContext.originName = identifier.name;
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier as ObjectIdentifier)) {
      return this.registry.getObject(identifier as ObjectIdentifier);
    }

    const definition = this.registry.getDefinition(identifier as ObjectIdentifier);
    if (!definition && this.parent) {
      return this.parent.getAsync(identifier as ObjectIdentifier, args);
    }

    if (!definition) {
      throw new FrameworkDefinitionNotFoundError(
        (objectContext?.originName ?? identifier) as ObjectIdentifier
      );
    }

    return this.getManagedResolverFactory().createAsync({ definition, args });
  }

  getAttr<T>(key: string): T {
    return undefined;
  }

  hasDefinition(identifier: ObjectIdentifier) {
  }

  hasNamespace(namespace: string): boolean {
    return false;
  }

  hasObject(identifier: ObjectIdentifier) {
  }

  listModule(key: string | symbol) {
  }

  load(module?: any) {
  }

  onBeforeBind(fn: (clazz: any, options: ObjectBeforeBindOptions) => void) {
  }

  onBeforeObjectCreated(fn: (clazz: any, options: ObjectBeforeCreatedOptions) => void) {
  }

  onBeforeObjectDestroy<T>(fn: (ins: T, options: ObjectBeforeDestroyOptions) => void) {
  }

  onObjectCreated<T>(fn: (ins: T, options: ObjectCreatedOptions<T>) => void) {
  }

  onObjectInit<T>(fn: (ins: T, options: ObjectInitOptions) => void) {
  }

  ready() {
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  resetModule(key: string | symbol) {
  }

  saveModule(key: string | symbol, module: any) {
  }

  setAttr(key: string, value: any) {
  }

  setFileDetector(fileDetector: FileDetectorInterface) {
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }

  transformModule(moduleMap: Map<string | symbol, Set<any>>) {
  }

  /**
   * 获取解释器工厂
   * @protected
   */
  protected getManagedResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ManagedResolverFactory(this);
    }
    return this._resolverFactory;
  }

  /**
   * 绑定模块
   * @param module
   * @param options
   * @protected
   */
  protected bindModule(module: any, options: Partial<ObjectDefinitionInterface>) {
    if (Types.isClass(module)) {
      const componentId = getComponentId(module);
      if (componentId) {
        this.identifierMapping.saveClassRelation(module, options?.namespace);
        this.bind(componentId, module, options);
      } else {
        // no provide or js class must be skip
      }
    } else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: ContainerInterface) => any;
        scope?: ScopeEnum;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        const uuid = Utils.randomUUID();
        this.identifierMapping.saveFunctionRelation(info.id, uuid);
        this.bind(uuid, module, {
          scope: info.scope,
          namespace: options.namespace,
          srcPath: options.srcPath,
          createFrom: options.createFrom,
        });
      }
    }
  }

  /**
   * 获取组件唯一标识
   * @param target
   * @protected
   */
  protected getIdentifier(target: any) {
    return getComponentId(target);
  }
}