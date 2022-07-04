/**
 * 上下文接口
 */
import { AutowiredContainerInterface } from "./containerInterface";

/**
 * 上下文接口
 */
export interface ContextInterface {
  /**
   * ipc通信上下文
   */
  ipcContext:AutowiredContainerInterface
  /**
   * 开始时间
   */
  startTime:number

  /**
   * 设置属性值方法
   * @param key
   * @param value
   */
  setAttr(key:string,value:any)

  /**
   * 获取属性值
   * @param key
   */
  getAttr<T>(key:string):T
}

export type AutowiredContextInterface<RuntimeContext = unknown> = ContextInterface & RuntimeContext