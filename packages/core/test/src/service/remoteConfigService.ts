import { Component, Scope, ScopeEnum } from "../../../decorator";

@Component()
@Scope(ScopeEnum.Singleton)
export class RemoteConfigService {
  public dataName="1111111"
}
