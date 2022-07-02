import { Autowired, Component, Init, Scope, ScopeEnum } from "../decorator";
import { ConfigService } from "./config.service";
import { AspectService } from "./aspect.service";
import { DecoratorService } from "./decorator.service";
import { AirContainerInterface } from "../interface";
import { ALL, CONFIG_KEY, RUNTIME_KEY } from "../decorator/constant";
import { getComponentUUID, listModule } from "../decorator/manager/default.manager";
import util from "util";
import { RuntimeInterface } from "../interface/runtime.interface";

const debug = util.debuglog('core:debug');

@Component()
@Scope(ScopeEnum.Singleton)
export class RuntimeService {
  @Autowired()
  configService:ConfigService
  @Autowired()
  aspectService:AspectService
  @Autowired()
  decoratorService:DecoratorService
  // 构造器
  constructor(
    readonly applicationContext:AirContainerInterface,
    readonly globalOptions
  ) {}

  @Init()
  protected async init(){
    // 注册属性值
    this.decoratorService.registerPropertyHandler(
      CONFIG_KEY,
      (propertyName,meta)=>{
          if (meta.identifier===ALL){
            return this.configService.getConfiguration()
          }else{
            return this.configService.getConfiguration(meta.identifier??propertyName)
          }
      }
    )

    // 所有的运行时环境
    const runtimes:Array<new (...args)=>any> = listModule(RUNTIME_KEY)
    // 如果有运行时环境
    if (runtimes.length){
      for (const runtime of runtimes) {
        if (!this.applicationContext.hasDefinition(getComponentUUID(runtime))){
          debug(
            `[core]: Found runtime "${runtime.name}" but missing definition, skip initialize`
          )
          continue
        }

        const runtimeInstance = await this.applicationContext.getAsync<
          RuntimeInterface<any,any,any>
          >(runtime,[this.applicationContext])
        // 如果当前运行时是开启的，则初始化
        if (runtimeInstance.isEnable()){
          // 初始化运行时
          await runtimeInstance.initialize({
            applicationContext:this.applicationContext,
            ...this.globalOptions
          })
          debug(
            `[core]: Found Framework "${runtimeInstance.getRuntimeName()}" and initialize.`
          );
        }else{
          debug(
            `[core]: Found Framework "${runtimeInstance.getRuntimeName()}" and delay initialize.`
          );
        }
        //
      }
    }
    await this.aspectService.loadAspect()
  }
}