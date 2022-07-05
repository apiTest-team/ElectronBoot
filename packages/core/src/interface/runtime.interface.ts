import { AutowiredContextInterface } from "./context.interface";
import { BootstrapOptions } from "../decorator";
import { ApplicationInterface } from "./application.interface";
import { AutowiredContainerInterface } from "./containerInterface";

/**
 * 运行时配置参数
 */
export interface RuntimeConfigurationOptions {
  logger:any
}

export abstract class BaseRuntimeType {
  abstract name:string
}

/**
 * 定义运行时环境
 */
export class RuntimeType extends BaseRuntimeType{
  static Electron = new RuntimeType("@autowired/ecboot")
  constructor(public name:string) {
    super();
  }
}

/**
 * 运行时接口
 */
export interface RuntimeInterface<
  App extends ApplicationInterface<Ctx>,
  Ctx extends AutowiredContextInterface,
  Opts extends RuntimeConfigurationOptions
  >
{
  app:App
  configurationOptions:Opts
  configure(opts?:Opts)
  isEnable():boolean
  initialize(opts:Partial<BootstrapOptions>):Promise<void>
  run():Promise<void>
  stop():Promise<void>
  getApplication():App
  getApplicationContext():AutowiredContainerInterface
  getConfiguration(key?:string):any
  getRuntimeName():string
  getAppDir():string
  getBaseDir():string
  getCurrentEnvironment(): string;
}