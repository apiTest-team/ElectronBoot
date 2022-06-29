import { ContainerInterface, ObjectDefinitionRegistryInterface } from "../interface";
import { ModuleStoreInterface } from "@electron-boot/decorator";
import EventEmitter from "events";


/**
 * 应用容器
 */
export class ElectronBootContainer implements ContainerInterface,ModuleStoreInterface{
  private _resolverFactory: ManagedResolverFactory = null;
  private _registry: ObjectDefinitionRegistryInterface = null;
  private _identifierMapping = null;
  private moduleMap = null;
  private _objectCreateEventTarget: EventEmitter;
  public parent: ContainerInterface = null;
  // 仅仅用于兼容requestContainer的ctx
  protected ctx = {};
  private fileDetector: IFileDetector;
  private attrMap: Map<string, any> = new Map();
  private _namespaceSet: Set<string> = null;
  private isLoad = false;

  constructor(parent?: ContainerInterface) {
    this.parent = parent;
    this.init();
  }
}