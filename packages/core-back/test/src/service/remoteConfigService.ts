import { Component, Scope, ScopeEnum } from "../../../src/decorator";

@Component()
@Scope(ScopeEnum.Singleton)
export class RemoteConfigService {
  public dataName="1111111"
}
