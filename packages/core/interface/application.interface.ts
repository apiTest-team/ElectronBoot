import { AppContext } from "./context.interface";

/**
 * 定义运行时的应用程序接口
 */
export type ApplicationInterface<
  T extends AppContext = AppContext,
  RuntimeApplication = unknown
  > = BaseApplicationInterface<T> & RuntimeApplication


/**
 * 最基础的运行时应用程序接口
 */
export interface BaseApplicationInterface<Ctx extends AppContext>{
  /**
   * 项目路径
   */
  getBaseDir():string

  /**
   * 应用路径
   */
  getAppDir():string

  /**
   * 创建ipc请求上下文
   */
  createAnonymousContext():Ctx
}