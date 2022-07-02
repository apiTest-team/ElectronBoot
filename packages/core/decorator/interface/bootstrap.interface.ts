import { AirContainerInterface } from "../../interface";
import { FileDetectorInterface } from "../../interface/fileDetector.interface";

/**
 * 类的定义
 */
export type Constructable<T> = new (...args: any[]) => T;
/**
 * 启动配置信息
 */
export interface BootstrapOptions {
  [customPropertyKey: string]: any;
  // 启动文件路径
  baseDir?:string
  // 应用地址路径
  appDir?:string
  // 应用上下文
  applicationContext?:AirContainerInterface
  // 加载文件前的模块
  preloadModules?:any[]
  // 不扫描的文件
  ignore?:string[]
  // 装饰器扫描器
  moduleDetector?: 'file' | FileDetectorInterface | false;
  // 配置模块
  configurationModule?: any | any[];
  // 静态导入的类
  imports?:any|any[]
  // 全局配置信息
  globalConfig?:| Array<{ [environmentName: string]: Record<string, any> }>
    | Record<string, any>;
}