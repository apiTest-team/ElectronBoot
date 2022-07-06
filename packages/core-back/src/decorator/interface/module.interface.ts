import {ObjectIdentifier} from "./component.interface";

export interface ModuleStoreInterface {
  /**
   * 获取模块
   * @param key
   */
  listModule(key:ObjectIdentifier):any

  /**
   * 保存模块
   * @param key
   * @param module 模块内容
   */
  saveModule(key:ObjectIdentifier,module:any):void

  /**
   *
   * @param moduleMap
   */
  transformModule?(moduleMap:Map<ObjectIdentifier,Set<any>>):void
}