export interface ModuleStoreInterface {
  /**
   * 获取模块
   * @param key
   */
  listModule(key:string|symbol)

  /**
   * 保存模块
   * @param key
   */
  saveModule(key:string|symbol)

  /**
   *
   * @param moduleMap
   */
  transformModule?(moduleMap:Map<string|symbol,Set<any>>)
}