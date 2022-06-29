/**
 * 创建工厂
 */
import { ContainerInterface } from "./container.interface";

export interface ObjectCreatorInterface {
  load(): any;
  doConstruct(clazz: any, args?: any, context?: ContainerInterface): any;
  doConstructAsync(
    clazz: any,
    args?: any,
    context?: ContainerInterface
  ): Promise<any>;
  doInit(obj: any): void;
  doInitAsync(obj: any): Promise<void>;
  doDestroy(obj: any): void;
  doDestroyAsync(obj: any): Promise<void>;
}