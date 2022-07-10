import {IAutowiredContainer} from "@autowired/core";

export interface BootstrapOptions {
    [customPropertyKey: string]: any;
    // 单例
    single?:boolean
    // js执行路径
    baseDir?:string
    // 要前置初始化的模块
    preloadModule?:any[]
    // 加载第三方模块
    imports?:any[]
    // 要导入的配置
    importConfigs?:any[]
    // 全局上下文
    applicationContext?:IAutowiredContainer
    // 配置信息
    globalConfig?:
      | Array<{ [environmentName: string]: Record<string, any> }>
      | Record<string, any>;
}