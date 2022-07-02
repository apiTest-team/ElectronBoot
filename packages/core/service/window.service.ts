import { Autowired, Component, Scope, ScopeEnum } from "../decorator";
import { ConfigService } from "./config.service";
import { AspectService } from "./aspect.service";
import { DecoratorService } from "./decorator.service";
import { AirContainerInterface } from "../interface";

@Component()
@Scope(ScopeEnum.Singleton)
export class WindowService {

  @Autowired()
  configService:ConfigService

  @Autowired()
  aspectService:AspectService

  @Autowired()
  decoratorService:DecoratorService
  /**
   * 构造器
   * @param applicationContext
   * @param globalOptions
   */
  constructor(readonly applicationContext:AirContainerInterface, readonly globalOptions) {
  }

  public getMainWindow(){

  }
}