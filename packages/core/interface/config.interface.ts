/**
 * 配置服务接口
 */
export interface ConfigServiceInterface{
  add(configFilePaths: any[]);
  addObject(obj: object, reverse?: boolean);
  load();
  getConfiguration(configKey?: string);
  clearAllConfig();
}

/**
 * 配置合并信息
 */
export interface ConfigMergeInfo {
  value: any;
  env: string;
  extraPath?: string;
}