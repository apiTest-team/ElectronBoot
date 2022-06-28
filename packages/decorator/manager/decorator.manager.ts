import { ModuleStoreInterface } from "../interface/module.interface";
import { INJECT_CLASS_KEY_PREFIX, INJECT_CLASS_METHOD_KEY_PREFIX, INJECT_METHOD_KEY_PREFIX } from "../constant";

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
  containr:ModuleStoreInterface
  // 默认的管理器
  public static defaultManager:DecoratorManager = new  DecoratorManager()

  /**
   * 获取所有的模块
   * @param key
   */
  listModule(key: string | symbol) {
    if (this.containr){

    }
  }

  /**
   * 保存模块
   * @param key
   * @param module
   */
  saveModule(key: string | symbol,module:any) {
    if (this.containr){
      return this.containr.saveModule(key,module)
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
    this.containr = container
    this.containr.transformModule(this)
  }
}