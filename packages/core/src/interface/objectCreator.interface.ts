/**
 * 创建工厂
 */
import { AutowiredContainerInterface } from "./containerInterface";

export interface ObjectCreatorInterface {
  load(): any;
  doConstruct(clazz: any, args?: any, context?: AutowiredContainerInterface): any;
  doConstructAsync(
    clazz: any,
    args?: any,
    context?: AutowiredContainerInterface
  ): Promise<any>;
  doInit(obj: any): void;
  doInitAsync(obj: any): Promise<void>;
  doDestroy(obj: any): void;
  doDestroyAsync(obj: any): Promise<void>;
}