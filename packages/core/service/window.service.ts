import { Autowired, Component, Scope, ScopeEnum } from "../context/decorator";
import { ConfigService } from "./config.service";
import { AspectService } from "./aspectService";
import { DecoratorService } from "./decorator.service";
import { ContainerInterface } from "../interface";

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
  constructor(readonly applicationContext:ContainerInterface,readonly globalOptions) {
  }

  public getMainWindow(){

  }
}