import { ProvideIdentifier } from "../types/provide-identifier.type";
import { Constructable } from "../types/constructable.type";

export type ProvideOption<T=unknown> =
  |Omit<Partial<ProvideMetadata<T>>, "type"|"factory">
  |Omit<Partial<ProvideMetadata<T>>, "type"|"factory">

/**
 * 服务提供者的元数据定义
 */
export interface ProvideMetadata<Type = unknown> {
  /**
   * 服务的唯一标识符
   */
  id: ProvideIdentifier
  /**
   * 类定义，用于初始化给服务
   * 如果id没有设置，则将其用做服务id
   */
  type: Constructable<Type> | null
  /**
   * 用于初始化当前服务的工厂函数
   * 可以使常规函数
   * 或者是可以生成此函数的实例
   */
  factory:[Constructable<unknown>, string] | CallableFunction | undefined;
  /**
   * 目标类的实例
   */
  Value:unknown|Symbol
}