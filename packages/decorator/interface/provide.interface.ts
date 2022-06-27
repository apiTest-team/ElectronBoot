import { ProvideIdentifier } from "../types/provide-identifier.type";

export type ProvideOption<T=unknown> =
  |Omit<Partial<ProvideMetadata<T>>, "type"|"factory">
  |Omit<Partial<ProvideMetadata<T>>, "type"|"factory">

/**
 * 服务提供者的元数据定义
 */
interface ProvideMetadata<Type = unknown> {
  /**
   * 服务的唯一标识符
   */
  id: ProvideIdentifier
  type: Type
}