import { ObjectDefinitionRegistryInterface } from "./objectDefinitionRegistry.interface";
import { ObjectIdentifier } from "../decorator";



export type ObjectContext = {
  originName?: string;
};

/**
 * 对象
 */
export interface ObjectFactoryInterface {
  registry: ObjectDefinitionRegistryInterface;
  get<T>(
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  get<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): T;
  getAsync<T>(
    identifier: new (...args) => T,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
  getAsync<T>(
    identifier: ObjectIdentifier,
    args?: any[],
    objectContext?: ObjectContext
  ): Promise<T>;
}