
import { ObjectDefinitionInterface } from "./objectDefinition.interface";
import { ManagedInstanceInterface } from "../context/decorator";

export interface ManagedResolverFactoryCreateOptionsInterface {
  definition: ObjectDefinitionInterface;
  args?: any;
  namespace?: string;
}

/**
 * 解析内部管理的属性、json、ref等实例的解析器
 * 同时创建这些对象的实际使用的对象
 */
export interface ManagedResolverInterface {
  type: string;
  resolve(managed: ManagedInstanceInterface,originName: string): any;
  resolveAsync(managed: ManagedInstanceInterface,originName: string): Promise<any>;
}