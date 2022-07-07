/**
 * 定义组件的元数据结构
 */
import { ObjectIdentifier } from "../types/decorator.types";

/**
 * 组件的元数据定义
 */
export interface TargetClassMetadata {
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

/**
 * 注入实例的作用域
 */
export enum ScopeEnum {
  Singleton = 'Singleton',
  Temp = "temp",
  Prototype = 'Prototype',
}

/**
 * 标记属性数据
 */
export interface TagPropsMetadata {
  key: string | number | symbol;
  value: any;
  args?: any;
}

/**
 * 注入模式
 */
export enum InjectModeEnum {
  Identifier = 'Identifier',
  Class = 'Class',
  PropertyName = 'PropertyName',
}

/**
 * 对象定义参数
 */
export interface ObjectDefinitionOptions {
  isAsync?: boolean;
  initMethod?: string;
  destroyMethod?: string;
  scope?: ScopeEnum;
  constructorArgs?: any[];
  namespace?: string;
  srcPath?: string;
  allowDowngrade?: boolean;
}