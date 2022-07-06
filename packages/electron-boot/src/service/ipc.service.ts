import { Component,Scope, ScopeEnum } from "@autowired/core";

@Component()
@Scope(ScopeEnum.Singleton)
export class IpcService {
  
}