export interface ModuleStoreInterface {
  /**
   * 获取模块
   * @param key
   */
  listModule(key:string|symbol)

  /**
   * 保存模块
   * @param key
   * @param module 模块内容
   */
  saveModule(key:string|symbol,module:any)

  /**
   * 重置模块内容
   * @param key
   */
  resetModule(key:string|symbol)

  /**
   *
   * @param moduleMap
   */
  transformModule?(moduleMap:Map<string|symbol,Set<any>>)
}