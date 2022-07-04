import { ObjectFactoryInterface } from "./objectFactory.interface";
import { ObjectLifeCycleInterface } from "./objectLifeCycle.interface";
import EventEmitter from "events";
import {IdentifierRelationShipInterface} from "./identifierRelationShip.interface";
import {ObjectDefinitionInterface} from "./objectDefinition.interface";
import {FileDetectorInterface} from "./fileDetector.interface";
import { ObjectIdentifier } from "../decorator";

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
export interface AutowiredContainerInterface extends ObjectFactoryInterface,ObjectLifeCycleInterface{
  parent: AutowiredContainerInterface;
  identifierMapping: IdentifierRelationShipInterface;
  objectCreateEventTarget: EventEmitter;
  ready();
  stop(): Promise<void>;
  registerObject(identifier: ObjectIdentifier, target: any);
  load(module?: any);
  hasNamespace(namespace: string): boolean;
  hasDefinition(identifier: ObjectIdentifier);
  hasObject(identifier: ObjectIdentifier);
  bind<T>(target: T, options?: Partial<ObjectDefinitionInterface>): void;
  bind<T>(
      identifier: ObjectIdentifier,
      target: T,
      options?: Partial<ObjectDefinitionInterface>
  ): void;
  bindClass(exports, options?: Partial<ObjectDefinitionInterface>);
  setFileDetector(fileDetector: FileDetectorInterface);
  createChild(): AutowiredContainerInterface;
  listModule(identifier:ObjectIdentifier):any[]
  saveModule(identifier:ObjectIdentifier,module)
  /**
   * Set value to app attribute map
   * @param key
   * @param value
   */
  setAttr(key: string, value: any);

  /**
   * Get value from app attribute map
   * @param key
   */
  getAttr<T>(key: string): T;
}