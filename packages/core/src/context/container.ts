import {
  IAutowiredContainer,
  IFileDetector,
  IIdentifierRelationShip,
  IObjectDefinition,
  IObjectDefinitionRegistry,
  ObjectBeforeBindOptions,
  ObjectBeforeCreatedOptions,
  ObjectBeforeDestroyOptions,
  ObjectContext, ObjectCreatedOptions, ObjectInitOptions,
  ObjectLifeCycleEvent
} from "../interface/container.interface";
import { IModuleStore } from "../interface/store.interface";
import {ResolverFactory} from "../factory/resolver.factory";
import * as util from "util";
import EventEmitter from "events";
import { FUNCTION_INJECT_KEY, TEMP_CTX_KEY } from "../constant/context.constant";
import { ObjectIdentifier } from "../types/decorator.types";
import { ObjectDefinitionRegistry } from "./definitionRegistry";
import { extend } from "../utils/extend.utils";
import { DefinitionNotFoundException } from "../exception/core";
import { ScopeEnum } from "../interface/decorator.interface";
import {
  getClassExtendedMetadata,
  getComponentName,
  getComponentUUID, getObjectDefinition,
  getPropertyAutowired
} from "../decorator/default.manager";
import { Types } from "../utils/types.utils";
import { randomUUID } from "../utils/decorator.utils";
import { ObjectDefinition } from "../definitions/object.definition";
import { FunctionDefinition } from "../definitions/function.definition";
import { ManagedReference } from "../resolver/ref.resolver";
import { INJECT_CUSTOM_PROPERTY } from "../constant/decorator.constant";

const debug = util.debuglog("autowired:debug")
const debugBind = util.debuglog("autowired:bind")
/**
 * 自动注入容器
 */
export class AutowiredContainer implements IAutowiredContainer,IModuleStore{
  private _namespaceSet:Set<string> = null
  private _resolverFactory:ResolverFactory = null
  private _registry:IObjectDefinitionRegistry = null
  private _identifierMapping = null
  private _objectCreateEventTarget:EventEmitter
  private moduleMap = null
  public parent:IAutowiredContainer = null
  protected ctx = {}
  private fileDetector:IFileDetector
  private attrMap:Map<string,any> = new Map()
  private isLoad = false
  constructor(parent?:IAutowiredContainer) {
    this.parent = parent
    this.init()
  }

  /**
   * 转换到当前Map
   * @param moduleMap
   */
  transformModule(moduleMap: Map<ObjectIdentifier, Set<any>>) {
    this.moduleMap = new Map(moduleMap);
  }

  /**
   * 初始化方法
   * @protected
   */
  protected init(){
    this.bindObject(TEMP_CTX_KEY,this.ctx)
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  bindObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  /**
   * 获取对象创建事件
   */
  get objectCreateEventTarget() {
    if (!this._objectCreateEventTarget) {
      this._objectCreateEventTarget = new EventEmitter();
    }
    return this._objectCreateEventTarget;
  }

  /**
   * 设置对象定义注册表
   * @param registry
   */
  set registry(registry) {
    this._registry = registry;
  }

  /**
   * 获取对象定义注册表
   */
  get registry(): IObjectDefinitionRegistry {
    if (!this._registry) {
      this._registry = new ObjectDefinitionRegistry();
    }
    return this._registry;
  }

  /**
   * 获取定义
   */
  get identifierMapping(): IIdentifierRelationShip {
    if (!this._identifierMapping) {
      this._identifierMapping = this.registry.getIdentifierRelation();
    }
    return this._identifierMapping;
  }

  /**
   * 获取解析器
   * @constructor
   */
  get ResolverFactory() {
    if (!this._resolverFactory) {
      this._resolverFactory = new ResolverFactory(this);
    }
    return this._resolverFactory;
  }

  /**
   * 获取命名空间
   */
  get namespaceSet(): Set<string> {
    if (!this._namespaceSet) {
      this._namespaceSet = new Set();
    }
    return this._namespaceSet;
  }

  /**
   * 设置属性
   * @param key 属性名
   * @param value 属性值
   */
  public setAttr(key: string, value: any) {
    this.attrMap.set(key, value);
  }

  /**
   * 获取属性
   * @param key
   */
  public getAttr<T>(key: string): T {
    return this.attrMap.get(key);
  }

  /**
   * 判断是否已经定义
   * @param identifier
   */
  hasDefinition(identifier: ObjectIdentifier) {
    return this.registry.hasDefinition(identifier);
  }

  /**
   * 判断是否有命名空间
   * @param namespace
   */
  hasNamespace(namespace: string): boolean {
    return this.namespaceSet.has(namespace);
  }

  /**
   * 绑定类
   * @param target
   * @param options
   */
  bind<T>(target: T, options?: Partial<IObjectDefinition>): void;
  bind<T>(
    identifier: ObjectIdentifier,
    target: T,
    options?: Partial<IObjectDefinition>
  ): void;
  bind(identifier: any, target: any, options?: any): void {
    if (Types.isClass(identifier) || Types.isFunction(identifier)) {
      return this.bindModule(identifier, target);
    }

    if (this.registry.hasDefinition(identifier)) {
      // 如果 definition 存在就不再重复 bind
      return;
    }

    if (options?.bindHook) {
      options.bindHook(target, options);
    }

    let definition;
    if (Types.isClass(target)) {
      definition = new ObjectDefinition();
      definition.name = getComponentName(target);
    } else {
      definition = new FunctionDefinition();
      if (!Types.isAsyncFunction(target)) {
        definition.asynchronous = false;
      }
      definition.name = definition.id;
    }

    definition.path = target;
    definition.id = identifier;
    definition.srcPath = options?.srcPath || null;
    definition.namespace = options?.namespace || '';
    definition.scope = options?.scope || ScopeEnum.Temp;
    definition.createFrom = options?.createFrom;

    if (definition.srcPath) {
      debug(
        `[core]: bind id "${definition.name} (${definition.srcPath}) ${identifier}"`
      );
    } else {
      debug(`[core]: bind id "${definition.name}" ${identifier}`);
    }

    // inject properties
    const props = getPropertyAutowired(target);

    for (const p in props) {
      const propertyMeta = props[p];
      debugBind(`  inject properties => [${JSON.stringify(propertyMeta)}]`);
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      refManaged.name = propertyMeta.value ;
      refManaged.injectMode = propertyMeta['injectMode'];

      definition.properties.set(propertyMeta['targetKey'], refManaged);
    }

    // inject custom properties
    const customProps = getClassExtendedMetadata(
      INJECT_CUSTOM_PROPERTY,
      target
    );

    for (const p in customProps) {
      const propertyMeta = customProps[p] as {
        propertyName: string;
        key: string;
        metadata: any;
      };
      definition.handlerProps.push(propertyMeta);
    }

    // @async, @init, @destroy @scope
    const objDefOptions = getObjectDefinition(target) ?? {};

    if (objDefOptions.initMethod) {
      debugBind(`  register initMethod = ${objDefOptions.initMethod}`);
      definition.initMethod = objDefOptions.initMethod;
    }

    if (objDefOptions.destroyMethod) {
      debugBind(`  register destroyMethod = ${objDefOptions.destroyMethod}`);
      definition.destroyMethod = objDefOptions.destroyMethod;
    }

    if (objDefOptions.scope) {
      debugBind(`  register scope = ${objDefOptions.scope}`);
      definition.scope = objDefOptions.scope;
    }

    if (objDefOptions.allowDowngrade) {
      debugBind(`  register allowDowngrade = ${objDefOptions.allowDowngrade}`);
      definition.allowDowngrade = objDefOptions.allowDowngrade;
    }

    this.objectCreateEventTarget.emit(
      ObjectLifeCycleEvent.BEFORE_BIND,
      target,
      {
        context: this,
        definition,
        replaceCallback: newDefinition => {
          definition = newDefinition;
        },
      }
    );

    if (definition) {
      this.registry.registerDefinition(definition.id, definition);
    }
  }

  /**
   * 同步创建类
   * @param identifier
   * @param args
   * @param objectContext
   */
  get<T>(identifier: { new(...args): T }, args?: any[], objectContext?: ObjectContext): T;
  get<T>(identifier: ObjectIdentifier, args?: any[], objectContext?: ObjectContext): T;
  get(identifier: any, args?: any[], objectContext?: ObjectContext): any {
    args = args??[]
    objectContext = objectContext?? {originName:identifier}
    if (typeof identifier!=="string"){
      objectContext.originName = identifier.name
      identifier = this.getIdentifier(identifier)
    }
    if (this.registry.hasObject(identifier)){
      return this.registry.getObject(identifier)
    }
    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier, args);
    }
    if (!definition){
      throw new DefinitionNotFoundException(
        objectContext?.originName ?? identifier
      );
    }
    return this.getResolverFactory().create({ definition, args });
  }

  /**
   * 异步创建类
   * @param identifier
   * @param args
   * @param objectContext
   */
  getAsync<T>(identifier: { new(...args): T }, args?: any[], objectContext?: ObjectContext): Promise<T>;
  getAsync<T>(identifier: ObjectIdentifier, args?: any[], objectContext?: ObjectContext): Promise<T>;
  getAsync(identifier:any, args?: any[], objectContext?: ObjectContext): Promise<any> {
    args = args ?? [];
    objectContext = objectContext ?? { originName: identifier };
    if (typeof identifier !== 'string') {
      objectContext.originName = identifier.name;
      identifier = this.getIdentifier(identifier);
    }
    if (this.registry.hasObject(identifier)) {
      return this.registry.getObject(identifier);
    }

    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.getAsync(identifier, args);
    }

    if (!definition) {
      throw new DefinitionNotFoundException(
        (objectContext?.originName ?? identifier)
      );
    }

    return this.getResolverFactory().createAsync({ definition, args });
  }

  /**
   * 获取解释器
   * @protected
   */
  protected getResolverFactory(){
    if (!this._resolverFactory){
      this._resolverFactory = new ResolverFactory(this)
    }
    return this._resolverFactory
  }

  /**
   * 绑定模块
   * @param module
   * @param options
   * @protected
   */
  protected bindModule(module: any, options: Partial<IObjectDefinition>) {
    if (Types.isClass(module)) {
      const componentId = getComponentUUID(module);
      if (componentId) {
        this.identifierMapping.saveClassRelation(module, options?.namespace);
        this.bind(componentId, module, options);
      } else {
        // no provide or js class must be skip
      }
    } else {
      const info: {
        id: ObjectIdentifier;
        provider: (context?: IAutowiredContainer) => any;
        scope?: ScopeEnum;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Temp;
        }
        const uuid = randomUUID();
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
   * 加载模块
   * @param module
   */
  load(module?) {
    // 如果模块存在
    if (module) {
      // load configuration
      const configuration = new ContainerConfiguration(this);
      configuration.load(module);
      for (const ns of configuration.getNamespaceList()) {
        this.namespaceSet.add(ns);
        debug(`[core]: load configuration in namespace="${ns}" complete`);
      }

      const detectorOptionsMerged = {};
      for (const detectorOptions of configuration.getDetectorOptionsList()) {
        extend(true, detectorOptionsMerged, detectorOptions);
      }
      this.fileDetector?.setExtraDetectorOptions(detectorOptionsMerged);
      this.isLoad = true;
    }
  }

  /**
   * 绑定类
   * @param exports
   * @param options
   */
  bindClass(exports, options?: Partial<IObjectDefinition>) {
    if (Types.isClass(exports) || Types.isFunction(exports)) {
      this.bindModule(exports, options);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (Types.isClass(module) || Types.isFunction(module)) {
          this.bindModule(module, options);
        }
      }
    }
  }

  /**
   * 获取类标识
   * @param target
   * @protected
   */
  protected getIdentifier(target: any) {
    return getComponentUUID(target);
  }

  /**
   * 创建子容器
   */
  createChild(): IAutowiredContainer {
    return new AutowiredContainer(this);
  }

  /**
   * 判断是否有指定标识对象
   * @param identifier
   */
  hasObject(identifier: ObjectIdentifier): boolean {
    return this.registry.hasObject(identifier);
  }

  /**
   * 获取模块列表
   * @param key
   */
  listModule(key: ObjectIdentifier): any {
    return Array.from(this.moduleMap.get(key) || {});
  }

  /**
   * 绑定前回调
   * @param fn
   */
  onBeforeBind(fn: (Clazz: any, options: ObjectBeforeBindOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_BIND, fn);
  }

  onBeforeObjectCreated(fn: (Clazz: any, options: ObjectBeforeCreatedOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_CREATED, fn)
  }

  onBeforeObjectDestroy<T>(fn: (ins: T, options: ObjectBeforeDestroyOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_DESTROY, fn);
  }

  onObjectCreated<T>(fn: (ins: T, options: ObjectCreatedOptions<T>) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_CREATED, fn);
  }

  onObjectInit<T>(fn: (ins: T, options: ObjectInitOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.AFTER_INIT, fn);
  }

  /**
   * 加载定义
   * @protected
   */
  protected loadDefinitions() {
    if (!this.isLoad) {
      this.load();
    }
    // load project file
    this.fileDetector?.run(this);
  }

  ready() {
    this.loadDefinitions();
  }

  /**
   * 保存模块
   * @param key
   * @param module
   */
  saveModule(key: ObjectIdentifier, module: any) {
    if (!this.moduleMap.has(key)) {
      this.moduleMap.set(key, new Set());
    }
    this.moduleMap.get(key).add(module);
  }

  /**
   * 设置文件扫描器
   * @param fileDetector
   */
  setFileDetector(fileDetector: IFileDetector) {
    this.fileDetector = fileDetector;
  }

  /**
   * 销毁容器
   */
  async stop(): Promise<void> {
    await this.getResolverFactory().destroyCache();
    this.registry.clearAll();
  }
}