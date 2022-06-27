import { ModuleStoreInterface } from "../interface/module.interface";

/**
 * 装饰管理器
 */
export class DecoratorManager extends Map implements ModuleStoreInterface{
  // 存储容器
  containr:ModuleStoreInterface
  // 默认的管理器
  public static defaultManager:DecoratorManager = new  DecoratorManager()

  bindContainer(container:ModuleStoreInterface){
    this.containr = container
    this.containr.transformModule(this)
  }

  listModule(key: string | symbol) {
    if (this.containr){

    }
  }

  saveModule(key: string | symbol,module:any) {
    if (this.containr){
      return this.containr.saveModule(key,module)
    }
    if (this.has(key)){
      this.set(key,new Set())
    }
    this.get(key).add(module)
  }

  resetModule(key: string | symbol) {

  }

  bindContainer(container:ModuleStoreInterface){
    this.containr = container
    this.containr.transformModule(this)
  }
}