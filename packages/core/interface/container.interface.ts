import { ObjectFactoryInterface } from "./objectFactory.interface";
import { ObjectLifeCycleInterface } from "./objectLifeCycle.interface";

/**
 * 对象生命周的事件名称
 */
export enum ObjectLifeCycleEvent {
  BEFORE_BIND = 'beforeBind',
  BEFORE_CREATED = 'beforeObjectCreated',
  AFTER_CREATED = 'afterObjectCreated',
  AFTER_INIT = 'afterObjectInit',
  BEFORE_DESTROY = 'beforeObjectDestroy',
}
/**
 * 定义容器接口
 */
export interface ContainerInterface  extends ObjectFactoryInterface,ObjectLifeCycleInterface{

}