

export interface ComponentInfoInterface {
  component: any;
  enabledEnvironment?: string[];
}
/**
 * 配置装饰器
 */
export interface ConfigurationOptions {
  /**
   * 要自动装载的类
   */
  imports?:Array<string | ComponentInfoInterface | { Configuration: any }>
  /**
   * 已经初始化好了的类或者值
   */
  importObjects?:Record<string, unknown>
  /**
   * 要导入的额外配置
   */
  importConfigs?:| Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
  /**
   * 命名空间
   */
  namespace?: string;
  /**
   * 扫描器配置
   */
  detectorOptions?:Record<string, any>
  /**
   * 冲突检查
   */
  conflictCheck?:Boolean
}