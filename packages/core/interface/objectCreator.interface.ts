/**
 * 创建工厂
 */
import { AirContainerInterface } from "./containerInterface";

export interface ObjectCreatorInterface {
  load(): any;
  doConstruct(clazz: any, args?: any, context?: AirContainerInterface): any;
  doConstructAsync(
    clazz: any,
    args?: any,
    context?: AirContainerInterface
  ): Promise<any>;
  doInit(obj: any): void;
  doInitAsync(obj: any): Promise<void>;
  doDestroy(obj: any): void;
  doDestroyAsync(obj: any): Promise<void>;
}