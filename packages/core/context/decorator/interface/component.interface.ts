export type ObjectIdentifier = string|symbol

/**
 * 定义组件的元数据结构
 */
export interface ComponentMetadata {
  /**
   * 类的唯一标志
   */
  id:ObjectIdentifier
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