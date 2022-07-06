import { IStore } from "../interface/store.interface";
import { ObjectIdentifier } from "../types/decorator.types";
import { INJECT_METHOD_KEY_PREFIX } from "./decorator.constant";


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
      return DecoratorManager.getMetadata(this.injectClassKeyPrefix,target,dataKey)
    }
  }

  // =======================静态方法======================

  /**
   * 获取类修饰存储key
   * @param decoratorNameKey 修饰名
   */
  static getDecoratorClassKey(decoratorNameKey:ObjectIdentifier):string{
    return decoratorNameKey.toString() + "_CLASS"
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