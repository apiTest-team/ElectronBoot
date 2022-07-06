import {
  AutowiredContainerInterface,
  IdentifierRelationShipInterface,
  ObjectBeforeBindOptions,
  ObjectBeforeCreatedOptions,
  ObjectBeforeDestroyOptions,
  ObjectContext, ObjectCreatedOptions,
  ObjectDefinitionInterface,
  ObjectDefinitionRegistryInterface, ObjectInitOptions, ObjectLifeCycleEvent
} from "../interface";
import EventEmitter from "events";
import { ManagedReference, ManagedResolverFactory, REQUEST_CTX_KEY } from "./managedResolver";
import {FileDetectorInterface} from "../interface";
import { ObjectDefinitionRegistry } from "./definitionRegistry";
import { FUNCTION_INJECT_KEY } from "../common";
import { CoreDefinitionNotFoundError } from "../error";
import { ModuleStoreInterface, ObjectIdentifier, ScopeEnum } from "../decorator";
import { Types, Utils } from "../utils";
import {
  getClassExtendedMetadata, getClassMetadata,
  getComponentName,
  getComponentUUID, getObjectDefinition,
  getPropertyAutowired, listModule, saveComponentId, saveModule
} from "../decorator";
import util from "util";
import { ObjectDefinition } from "../definitions";
import { FunctionDefinition } from "../definitions";
import { CONFIGURATION_KEY, INJECT_CUSTOM_PROPERTY, MAIN_MODULE_KEY } from "../decorator";
import { FunctionalConfiguration } from "../functional";
import { ConfigService } from "../service";
import { ComponentInfoInterface, ConfigurationOptions } from "../decorator";
import { EnvironmentService } from "../service";
import { extend } from "../utils";
const debug = util.debuglog('autowired:debug');
const debugBind = util.debuglog('autowired:bind');

class ContainerConfiguration {
  private loadedMap = new WeakMap();
  private namespaceList = [];
  private detectorOptionsList = [];
  constructor(readonly container: AutowiredContainerInterface) {}

  load(module) {
    let namespace = MAIN_MODULE_KEY;
    // 可能导出多个
    const configurationExports = ContainerConfiguration.getConfigurationExport(module);
    if (!configurationExports.length) return;
    // 多个的情况，数据交给第一个保存
    for (let i = 0; i < configurationExports.length; i++) {
      const configurationExport = configurationExports[i];

      if (this.loadedMap.get(configurationExport)) {
        // 已经加载过就跳过循环
        continue;
      }

      let configurationOptions: ConfigurationOptions;
      if (configurationExport instanceof FunctionalConfiguration) {
        // 函数式写法
        configurationOptions = configurationExport.getConfigurationOptions();
      } else {
        // 普通类写法
        configurationOptions = getClassMetadata(
          CONFIGURATION_KEY,
          configurationExport
        );
      }

      // 已加载标记，防止死循环
      this.loadedMap.set(configurationExport, true);

      if (configurationOptions) {
        if (configurationOptions.namespace !== undefined) {
          namespace = configurationOptions.namespace;
          this.namespaceList.push(namespace);
        }
        if (configurationOptions.detectorOptions) {
          this.detectorOptionsList.push(configurationOptions.detectorOptions);
        }
        debug(`[core]: load configuration in namespace="${namespace}"`);
        this.addImports(configurationOptions.imports);
        this.addImportObjects(configurationOptions.importObjects);
        this.addImportConfigs(configurationOptions.importConfigs);
        this.bindConfigurationClass(configurationExport, namespace);
      }
    }

    // bind module
    this.container.bindClass(module, {
      namespace,
    });
  }

  addImportConfigs(
    importConfigs:
      | Array<{ [environmentName: string]: Record<string, any> }>
      | Record<string, any>
  ) {
    if (importConfigs) {
      if (Array.isArray(importConfigs)) {
        this.container.get(ConfigService).add(importConfigs);
      } else {
        this.container.get(ConfigService).addObject(importConfigs);
      }
    }
  }

  addImports(imports: any[] = []) {
    // 处理 imports
    for (let importPackage of imports) {
      if (!importPackage) continue;
      if (typeof importPackage === 'string') {
        importPackage = require(importPackage);
      }
      if ('Configuration' in importPackage) {
        // component is object
        this.load(importPackage);
      } else if ('component' in importPackage) {
        if ((importPackage as ComponentInfoInterface)?.enabledEnvironment) {
          if (
            (importPackage as ComponentInfoInterface)?.enabledEnvironment?.includes(
              this.container
                .get(EnvironmentService)
                .getCurrentEnvironment()
            )
          ) {
            this.load((importPackage as ComponentInfoInterface).component);
          }
        } else {
          this.load((importPackage as ComponentInfoInterface).component);
        }
      } else {
        this.load(importPackage);
      }
    }
  }

  /**
   * 注册 importObjects
   * @param objs configuration 中的 importObjects
   */
  addImportObjects(objs: any) {
    if (objs) {
      const keys = Object.keys(objs);
      for (const key of keys) {
        if (typeof objs[key] !== undefined) {
          this.container.registerObject(key, objs[key]);
        }
      }
    }
  }

  bindConfigurationClass(clzz, namespace) {
    if (clzz instanceof FunctionalConfiguration) {
      // 函数式写法不需要绑定到容器
    } else {
      // 普通类写法
      saveComponentId(undefined, clzz);
      const id = getComponentUUID(clzz);
      this.container.bind(id, clzz, {
        namespace: namespace,
        scope: ScopeEnum.Singleton,
      });
    }

    // configuration 手动绑定去重
    const configurationMods = listModule(CONFIGURATION_KEY);
    const exists = configurationMods.find(mod => {
      return mod.target === clzz;
    });
    if (!exists) {
      saveModule(CONFIGURATION_KEY, {
        target: clzz,
        namespace: namespace,
      });
    }
  }

  private static getConfigurationExport(exports): any[] {
    const mods = [];
    if (
      Types.isClass(exports) ||
      Types.isFunction(exports) ||
      exports instanceof FunctionalConfiguration
    ) {
      mods.push(exports);
    } else {
      for (const m in exports) {
        const module = exports[m];
        if (
          Types.isClass(module) ||
          Types.isFunction(module) ||
          module instanceof FunctionalConfiguration
        ) {
          mods.push(module);
        }
      }
    }
    return mods;
  }

  public getNamespaceList() {
    return this.namespaceList;
  }

  public getDetectorOptionsList() {
    return this.detectorOptionsList;
  }
}
/**
 * 应用容器
 */
export class AutowiredContainer implements AutowiredContainerInterface,ModuleStoreInterface{
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: ObjectDefinitionRegistryInterface = null;
  private _identifierMapping = null;
  private moduleMap:Map<any,Set<any>> = null;
  private _objectCreateEventTarget: EventEmitter;
  public parent: AutowiredContainerInterface = null;
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

  constructor(parent?: AutowiredContainerInterface) {
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
    if (this.registry.hasDefinition(identifier)){
      return
    }
    if (options?.bindHook) {
      options.bindHook(target, options as ObjectDefinitionInterface);
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
    definition.scope = options?.scope || ScopeEnum.Request;
    definition.createFrom = options?.createFrom;

    if (definition.srcPath) {
      debug(
        `[core]: bind id "${definition.name} (${definition.srcPath}) ${identifier as string}"`
      );
    } else {
      debug(`[core]: bind id "${definition.name}" ${identifier as string}`);
    }

    // inject properties
    const props = getPropertyAutowired(target);

    for (const p in props) {
      const propertyMeta = props[p];
      debugBind(`  inject properties => [${JSON.stringify(propertyMeta)}]`);
      const refManaged = new ManagedReference();
      refManaged.args = propertyMeta.args;
      refManaged.name = propertyMeta.value ;
      refManaged.autowiredMode = propertyMeta['injectMode'];

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
  createChild(): AutowiredContainerInterface {
    return new AutowiredContainer();
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
    if (this.registry.hasObject(identifier)){
      return this.registry.getObject(identifier)
    }
    const definition = this.registry.getDefinition(identifier);
    if (!definition && this.parent) {
      return this.parent.get(identifier, args);
    }
    if (!definition){
      throw new CoreDefinitionNotFoundError(
        objectContext?.originName ?? identifier
      );
    }
    return this.getManagedResolverFactory().create({ definition, args });
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
      throw new CoreDefinitionNotFoundError(
        (objectContext?.originName ?? identifier) as ObjectIdentifier
      );
    }

    return this.getManagedResolverFactory().createAsync({ definition, args });
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
   * 判断是否存在指定id的对象
   * @param identifier
   */
  hasObject(identifier: ObjectIdentifier) {
    return this.registry.hasObject(identifier);
  }

  /**
   * 获取模块
   * @param key
   */
  listModule(key: ObjectIdentifier) {
    return Array.from(this.moduleMap.get(key)||[]);
  }

  /**
   * 加载模块
   * @param module
   */
  load(module?: any) {
    if (module){
      const configuration = new ContainerConfiguration(this)
      configuration.load(module)
      for (const ns of configuration.getNamespaceList()) {
        this.namespaceSet.add(ns)
        debug(`[core]:load  configuration in namespace="${ns}" complete`)
      }

      const detectorOptionsMerged = {}
      for (const detectorOption of configuration.getDetectorOptionsList()) {
        extend(true,detectorOptionsMerged,detectorOption)
      }
      this.fileDetector?.setExtraDetectorOptions(detectorOptionsMerged)
      this.isLoad = true
    }
  }

  onBeforeBind(fn: (clazz: any, options: ObjectBeforeBindOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_BIND, fn);
  }

  onBeforeObjectCreated(fn: (clazz: any, options: ObjectBeforeCreatedOptions) => void) {
    this.objectCreateEventTarget.on(ObjectLifeCycleEvent.BEFORE_CREATED, fn);
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

  ready() {
    this.loadDefinitions();
  }

  /**
   * proxy registry.registerObject
   * @param {ObjectIdentifier} identifier
   * @param target
   */
  registerObject(identifier: ObjectIdentifier, target: any) {
    this.registry.registerObject(identifier, target);
  }

  /**
   * 保存模块
   * @param key
   * @param module
   */
  saveModule(key: string | symbol, module: any) {
    if (!this.moduleMap.has(key)) {
      this.moduleMap.set(key, new Set());
    }
    this.moduleMap.get(key).add(module);
  }

  /**
   * 设置文件检测器
   * @param fileDetector
   */
  setFileDetector(fileDetector: FileDetectorInterface) {
    this.fileDetector = fileDetector;
  }

  /**
   * 停止回调
   */
  async stop(): Promise<void> {
    await this.getManagedResolverFactory().destroyCache();
    this.registry.clearAll();
  }

  /**
   * 转换模块
   * @param moduleMap
   */
  transformModule(moduleMap: Map<ObjectIdentifier, Set<any>>) {
    this.moduleMap = new Map(moduleMap);
  }

  /**
   * 加载所有的对象定义
   * @protected
   */
  protected loadDefinitions() {
    if (!this.isLoad) {
      this.load();
    }
    // load project file
    this.fileDetector?.run(this);
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
        provider: (context?: AutowiredContainerInterface) => any;
        scope?: ScopeEnum;
      } = module[FUNCTION_INJECT_KEY];
      if (info && info.id) {
        if (!info.scope) {
          info.scope = ScopeEnum.Request;
        }
        const uuid = Utils.randomUUID();
        this.identifierMapping.saveFunctionRelation(info.id, uuid);
        this.bind(uuid as ObjectIdentifier, module, {
          scope: info.scope,
          namespace: options.namespace,
          srcPath: options.srcPath,
          createFrom: options.createFrom,
        });
      }
    }
  }

  /**
   * 获取命令空间Set
   */
  get namespaceSet(): Set<string> {
    if (!this._namespaceSet) {
      this._namespaceSet = new Set();
    }
    return this._namespaceSet;
  }
  /**
   * 获取组件唯一标识
   * @param target
   * @protected
   */
  protected getIdentifier(target: any) {
    return getComponentUUID(target);
  }
}