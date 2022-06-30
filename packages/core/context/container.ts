import { ContainerInterface, ObjectDefinitionRegistryInterface } from "../interface";
import { ModuleStoreInterface } from "@electron-boot/decorator";
import EventEmitter from "events";
import {ManagedResolverFactory} from "./managedResolverFactory";
import {FileDetectorInterface} from "../interface/fileDetector.interface";


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
  private fileDetector: FileDetectorInterface;
  private attrMap: Map<string, any> = new Map();
  private _namespaceSet: Set<string> = null;
  private isLoad = false;

  constructor(parent?: ContainerInterface) {
    this.parent = parent;
    this.init();
  }
}