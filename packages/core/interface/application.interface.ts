import { AirContextInterface } from "./context.interface";
import { RuntimeType } from "./runtime.interface";
import { AirContainerInterface } from "./containerInterface";

/**
 * 定义运行时的应用程序接口
 */
export type ApplicationInterface<
  T extends AirContextInterface = AirContextInterface,
  RuntimeApplication = unknown
  > = BaseApplicationInterface<T> & RuntimeApplication

/**
 * 运行时基础应用接口
 */
export interface BaseApplicationInterface<Ctx extends AirContextInterface>{
  /**
   * 项目路径
   */
  getBaseDir():string

  /**
   * 应用路径
   */
  getAppDir():string

  /**
   * 获取运行环境
   */
  getEnv():string

  /**
   * 获取运行时类型
   */
  getRuntimeType():RuntimeType

  /**
   * 获取应用的上下文
   */
  getApplicationContext():AirContainerInterface

  /**
   * 获取配置，如果不传入key应该获取所有的
   * @param key
   */
  getConfig(key?:string):any

  /**
   * 添加配置数据到当前配置
   * @param object
   */
  addConfigObject(object:any)

  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any);

  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;

  /**
   * 创建ipc请求上下文
   */
  createAnonymousContext():Ctx
}