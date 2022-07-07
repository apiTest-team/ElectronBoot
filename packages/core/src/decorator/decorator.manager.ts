import "reflect-metadata"
import { IStore } from "../interface/store.interface";
import { GroupModeType, ObjectIdentifier } from "../types/decorator.types";
import {INJECT_CLASS_KEY_PREFIX, INJECT_CLASS_METHOD_KEY_PREFIX, INJECT_METHOD_KEY_PREFIX} from "./decorator.constant";


/**
 * 装饰管理器
 */
export class DecoratorManager extends Map implements IStore{
  /**
   * 存储容器
   */
  container:IStore|null=null
  /**
   * 全局的装饰管理器实例
   */
  public static default = new DecoratorManager()

  /**
   * 获取存储模块
   * @param key
   */
  listModule(key: ObjectIdentifier): any {
    if (this.container) {
      return this.container.listModule(key);
    }
    return Array.from(this.get(key) as ArrayLike<any> || []);
  }

  /**
   * 保存模块
   * @param key 存储key
   * @param module 存储模块
   */
  saveModule(key: ObjectIdentifier, module: any) {
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
  bindContainer(container?:IStore){
    this.container = container
    this.container?.transformModule(this)
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
      DecoratorManager.saveMetadata(INJECT_METHOD_KEY_PREFIX,target,dataKey,data)
    }else{
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey)
      DecoratorManager.saveMetadata(INJECT_METHOD_KEY_PREFIX,target,dataKey,data)
    }
  }

  /**
   * 获取元数据
   * @param decoratorNameKey
   * @param target
   * @param propertyName
   */
  getMetadata<T>(decoratorNameKey:ObjectIdentifier,target:T,propertyName?:any){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      return DecoratorManager.getMetadata(INJECT_METHOD_KEY_PREFIX,target,dataKey)
    }else{
      const dataKey = `${DecoratorManager.getDecoratorClassKey(
        decoratorNameKey
      )}`
      return DecoratorManager.getMetadata(INJECT_METHOD_KEY_PREFIX,target,dataKey)
    }
  }

  /**
   * 附加特性属数据到类
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   * @param groupMode
   */
  attachMetadata(
      decoratorNameKey: ObjectIdentifier,
      data,
      target,
      propertyName?: string,
      groupBy?: string,
      groupMode?: GroupModeType
  ) {
    if (propertyName) {
      const dataKey = DecoratorManager.getDecoratorMethod(
          decoratorNameKey,
          propertyName
      );
      DecoratorManager.attachMetadata(
          INJECT_METHOD_KEY_PREFIX,
          target,
          dataKey,
          data,
          groupBy,
          groupMode
      );
    } else {
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.attachMetadata(
          INJECT_CLASS_KEY_PREFIX,
          target,
          dataKey,
          data,
          groupBy,
          groupMode
      );
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
  attachMetadataToClass(decoratorNameKey:ObjectIdentifier,data:any,target:Object,propertyName?: string,groupBy?:string|symbol,groupMode?:GroupModeType){
    if (propertyName){
      const dataKey = DecoratorManager.getDecoratorMethod(decoratorNameKey,propertyName)
      DecoratorManager.attachMetadataToClass(INJECT_METHOD_KEY_PREFIX,target,dataKey,data,groupBy,groupMode)
    }else{
      const dataKey = DecoratorManager.getDecoratorClassKey(decoratorNameKey);
      DecoratorManager.attachMetadataToClass(INJECT_METHOD_KEY_PREFIX,target,dataKey,data,groupBy,groupMode);
    }
  }

  /**
   * attach property data to class
   * @param decoratorNameKey
   * @param data
   * @param target
   * @param propertyName
   * @param groupBy
   */
  attachPropertyDataToClass(
      decoratorNameKey: ObjectIdentifier,
      data,
      target,
      propertyName,
      groupBy?: string
  ) {
    const dataKey = DecoratorManager.getDecoratorClassMethodKey(
        decoratorNameKey,
        propertyName
    );
    DecoratorManager.attachMetadata(
        INJECT_CLASS_METHOD_KEY_PREFIX,
        target,
        dataKey,
        data,
        groupBy
    );
  }



  // =======================静态方法======================


  /**
   * 保存元数据到target
   * @param metaKey 元数据存储键
   * @param target 存储目标
   * @param dataKey 数据键
   * @param data 存储数据
   */
  public static saveMetadata(metaKey:string,target:any,dataKey:string,data:any){
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
  public static getMetadata<T>(metaKey:string,target:T,dataKey:string){
    // 过滤掉工厂方法
    if (typeof target==="object" && target?.constructor){
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
   * 将元数据附加到类
   * @param metaKey 元数据key
   * @param target 目标类
   * @param dataKey 数据key
   * @param data 数据
   * @param groupBy 分组
   * @param groupMode 分组模式
   */
  static attachMetadataToClass(metaKey: string,target: Object,dataKey: string,data: any,groupBy?: string|symbol,groupMode: GroupModeType = 'one') {
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
   *
   * @param metaKey
   * @param target
   * @param dataKey
   * @param data
   * @param groupBy
   * @param groupMode
   */
  public static attachMetadata(
      metaKey: string,
      target: any,
      dataKey: string,
      data: any,
      groupBy?: string,
      groupMode: GroupModeType = 'one'
  ) {
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

  // ================================获取key相关==================================

  /**
   * 获取类修饰存储key
   * @param decoratorNameKey 修饰名
   */
  public static getDecoratorClassKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString() + "_CLASS"
  }

  /**
   * 获取类方法存储键
   * @param decoratorNameKey
   * @param methodKey
   */
  public static getDecoratorClassMethodKey(
      decoratorNameKey: ObjectIdentifier,
      methodKey: ObjectIdentifier
  ) {
    return (
        DecoratorManager.getDecoratorClassMethodPrefix(decoratorNameKey) +
        ':' +
        methodKey.toString()
    );
  }

  /**
   * 类的方法装饰器前缀
   * @param decoratorNameKey
   */
  public static getDecoratorClassMethodPrefix(decoratorNameKey: ObjectIdentifier) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  /**
   * 获取方法装饰器存储键
   * @param decoratorNameKey 装饰器名
   */
  public static getDecoratorMethodKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString()+"_METHOD"
  }

  /**
   * 获取方法定义
   * @param decoratorNameKey 装饰器名称键
   * @param methodKey 方法键
   */
  public static getDecoratorMethod(decoratorNameKey:ObjectIdentifier,methodKey:ObjectIdentifier):string{
    return DecoratorManager.getDecoratorMethodKey(decoratorNameKey)+
      "-"+
      (methodKey.toString())
  }
}