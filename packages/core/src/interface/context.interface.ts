/**
 * 上下文接口
 */
import { AirContainerInterface } from "./containerInterface";

/**
 * 上下文接口
 */
export interface ContextInterface {
  /**
   * ipc通信上下文
   */
  ipcContext:AirContainerInterface
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

export type AirContextInterface<RuntimeContext = unknown> = ContextInterface & RuntimeContext