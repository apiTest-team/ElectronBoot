import {GroupModeType, ModuleStoreInterface} from "../interface";
import { INJECT_CLASS_KEY_PREFIX, INJECT_CLASS_METHOD_KEY_PREFIX, INJECT_METHOD_KEY_PREFIX } from "../constant";
import { ObjectIdentifier } from "../interface";
/**
 * 装饰管理器
 */
export class DecoratorManager extends Map implements ModuleStoreInterface{
  // 类元素存储的key
  injectClassKeyPrefix = INJECT_CLASS_KEY_PREFIX
  // 类方法的元数据存储key
  injectClassMethodKeyPrefix = INJECT_CLASS_METHOD_KEY_PREFIX
  // 方法的元数据存储key
  injectMethodKeyPrefix = INJECT_METHOD_KEY_PREFIX
  // 存储容器
  container:ModuleStoreInterface
  // 默认的管理器
  public static defaultManager:DecoratorManager = new  DecoratorManager()

  /**
   * 获取所有的模块
   * @param key
   */
  listModule(key: string | symbol) {
    if (this.container){

    }
  }

  /**
   * 保存模块
   * @param key
   * @param module
   */
  saveModule(key: string | symbol,module:any) {
    if (this.container){
      return this.container.saveModule(key,module)
    }
    if (this.has(key)){
      this.set(key,new Set())
    }
    this.get(key).add(module)
  }

  /**
   * 重置模块
   * @param key
   */
  resetModule(key: string | symbol) {
    this.set(key,new Set())
  }

  /**
   * 绑定容器
   * @param container
   */
  bindContainer(container:ModuleStoreInterface){
    this.container = container
    this.container.transformModule(this)
  }

  /**
   * 获取元数据
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata<T>(decoratorNameKey:ObjectIdentifier,target:T,propertyName?:ObjectIdentifier){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      return DecoratorManager.getMetadata(this.injectMethodKeyPrefix,target,dataKey)
    }else{
      const dataKey = `${DecoratorManager.getDecoratorClassKey(
        decoratorNameKey
      )}`
      return DecoratorManager.getMetadata(this.injectClassKeyPrefix,target,dataKey)
    }
  }

  /**
   * 保存元数据
   * @param decoratorNameKey 修饰key
   * @param data 数据信息
   * @param target 目标类
   * @param propertyName 属性名称
   */
  saveMetadata<T>(decoratorNameKey:ObjectIdentifier,data:any,target:T,propertyName?:ObjectIdentifier){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      DecoratorManager.saveMetadata(this.injectMethodKeyPrefix,target,dataKey,data)
    }else{
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey)
      DecoratorManager.saveMetadata(this.injectClassKeyPrefix,target,dataKey,data)
    }
  }

  /**
   * 保存元数据
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   * @param groupMode
   */
  saveClassAttachMetadata(decoratorNameKey:ObjectIdentifier,data:any,target:Object,propertyName?: string,groupBy?:string|symbol,groupMode?:GroupModeType){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      DecoratorManager.saveClassAttachMetadata(this.injectMethodKeyPrefix,target,dataKey,data,groupBy,groupMode)
    }else{
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.saveClassAttachMetadata(this.injectClassKeyPrefix,target,dataKey,data,groupBy,groupMode);
    }
  }

  // =============================== 静态方法================================
  /**
   * 保存元数据到target
   */
  static saveMetadata(metaKey:string,target:any,dataKey:string,data:any){
    // 过滤掉object.create(null)
    if (typeof target==="object" && target.constructor){
      target = target.constructor
    }
    let m:Map<string,any>
    // 如果在target上存在了metaKey的元数据
    if (Reflect.hasOwnMetadata(metaKey,target as Object)){
      m = Reflect.getMetadata(metaKey,target as Object)
    }else{
      m = new Map<string,any>
    }
    // 元数据
    m.set(dataKey,data)
    // 在target上定义元数据
    Reflect.defineMetadata(metaKey,m,target as Object)
  }

  /**
   * 从指定target取出指定元数据key和数据key的元数据信息
   * @param metaKey 元数据key
   * @param target 元数据存储类
   * @param dataKey 数据key
   */
  static getMetadata<T>(metaKey:string,target:T,dataKey:string){
    // 过滤掉工厂方法
    if (typeof target==="object" && target.constructor){
      target = target.constructor as any
    }
    let m:Map<string,any>
    if (Reflect.hasOwnMetadata(metaKey,target)){
      m = Reflect.getMetadata(metaKey,target)
    }else{
      m = new Map<string,any>()
    }
    if (!dataKey){
      return m
    }
    return m.get(dataKey)
  }

  /**
   * 保存class元数据信息
   * @param metaKey 元数据key
   * @param target 目标类
   * @param dataKey 数据key
   * @param data 数据
   * @param groupBy 分组
   * @param groupMode 分组模式
   */
  static saveClassAttachMetadata(metaKey: string,target: Object,dataKey: string,data: any,groupBy?: string|symbol,groupMode: GroupModeType = 'one') {
    // filter Object.create(null)
    if (typeof target === 'object' && target.constructor) {
      target = target.constructor;
    }

    let m: Map<string, any>;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
      m = Reflect.getMetadata(metaKey, target);
    } else {
      m = new Map<string, any>();
    }

    if (!m.has(dataKey)) {
      if (groupBy) {
        m.set(dataKey, {});
      } else {
        m.set(dataKey, []);
      }
    }
    if (groupBy) {
      if (groupMode === 'one') {
        m.get(dataKey)[groupBy] = data;
      } else {
        if (m.get(dataKey)[groupBy]) {
          m.get(dataKey)[groupBy].push(data);
        } else {
          m.get(dataKey)[groupBy] = [data];
        }
      }
    } else {
      m.get(dataKey).push(data);
    }
    Reflect.defineMetadata(metaKey, m, target);
  }
  /**
   * 获取类修饰存储key
   * @param decoratorNameKey 修饰名
   */
  static getDecoratorClassKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString() + "_CLASS"
  }

  /**
   * 元素的扩展属性key
   * @param decoratorNameKey
   */
  static getDecoratorClassExtendedKey(decoratorNameKey: ObjectIdentifier){
    return decoratorNameKey.toString() + '_EXT';
  }

  /**
   * 获取定义方法名
   * @param decoratorNameKey
   * @param methodKey
   */
  static getDecoratorMethod(decoratorNameKey:ObjectIdentifier,methodKey:ObjectIdentifier):string{
    return DecoratorManager.getDecoratorMethodKey(decoratorNameKey)+
      "-"+
      (methodKey as string)
  }

  /**
   * 组合key
   * @param decoratorNameKey
   */
  static getDecoratorMethodKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString() + '_METHOD'
  }
}