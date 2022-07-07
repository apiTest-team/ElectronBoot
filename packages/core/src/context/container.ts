import {IAutowiredContainer, IFileDetector, IObjectDefinitionRegistry} from "../interface/container.interface";
import { IModuleStore } from "../interface/store.interface";
import {ResolverFactory} from "../factory/resolver.factory";
import * as util from "util";
import EventEmitter from "events";
import {TEMP_CTX_KEY} from "../constant/context.constant";

const debug = util.debuglog("autowired:debug")
const debugLog = util.debuglog("autowired:bind")
/**
 * 自动注入容器
 */
export class AutowiredContainer implements IAutowiredContainer,IModuleStore{
  private _namespaceSet:Set<string> = null
  private _resolverFactory:ResolverFactory = null
  private _registry:IObjectDefinitionRegistry = null
  private _identifierMapping = null
  private _objectCreateEventTarget:EventEmitter
  private moduleMap = null
  private parent:IAutowiredContainer = null
  private ctx = {}
  private fileDetector:IFileDetector
  private attrMap:Map<string,any> = new Map()
  private isLoad = false
  constructor(parent?:IAutowiredContainer) {
    this.parent = parent
    this.init()
  }

  protected init(){
    this.registerObject(TEMP_CTX_KEY,this.ctx)
  }
}