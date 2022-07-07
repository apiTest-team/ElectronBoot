import { IAutowiredContainer } from "../interface/container.interface";
import { IModuleStore } from "../interface/store.interface";
import {ResolverFactory} from "../factory/resolver.factory";

/**
 * 自动注入容器
 */
export class AutowiredContainer implements IAutowiredContainer,IModuleStore{
  private _resolverFactory:ResolverFactory
  

}