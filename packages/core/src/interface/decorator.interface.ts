/**
 * 定义组件的元数据结构
 */
import { ObjectIdentifier } from "../types/decorator.types";

/**
 * 组件的元数据定义
 */
export interface ComponentMetadata {
  /**
   * 类的唯一标志
   */
  id:ObjectIdentifier|undefined
  /**
   * 类唯一uuid
   */
  uuid:string
  /**
   * 原始类名
   */
  originName:string
  /**
   * 全转为小写后的名称
   */
  name:string
}