import { EnvironmentServiceInterface } from "../interface/environment.service";
import { getCurrentEnvironment, isDevelopmentEnvironment } from "../utils";
import { Component, Scope, ScopeEnum } from "../decorator";

@Component()
@Scope(ScopeEnum.Singleton)
export class EnvironmentService implements EnvironmentServiceInterface{
  protected environment: string;

  /**
   * 获取当前使用的环境
   */
  public getCurrentEnvironment() {
    if (!this.environment) {
      this.environment = getCurrentEnvironment();
    }
    return this.environment;
  }

  public setCurrentEnvironment(environment: string) {
    this.environment = environment;
  }

  public isDevelopmentEnvironment() {
    return isDevelopmentEnvironment(this.environment);
  }
}