import { ModuleStoreInterface } from "../interface/module.interface";

/**
 * 装饰管理器
 */
export class DecoratorManager extends Map implements ModuleStoreInterface{

  // 默认的管理器
  public static defaultManager:DecoratorManager = new  DecoratorManager()

  listModule(key: string | symbol) {
  }

  saveModule(key: string | symbol) {
  }


}