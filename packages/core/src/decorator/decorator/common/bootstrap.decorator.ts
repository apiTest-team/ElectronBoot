import { Configuration } from "./configuration.decorator";
import { ConfigurationOptions,BootstrapOptions,ScopeEnum } from "../../interface";
import { Component } from "./component.decorator";
import { Scope } from "./objectdef.decorator";
import { saveClassMetadata} from "../../manager";
import { AIR_BOOT_STARTER } from "../../constant";
import { isFunction } from "../../../utils";
import * as path from "path";
import { AirBootstrapOptions } from "../../../interface";
/**
 * 启动类
 * @param opts 启动参数
 * @constructor
 */
export const AirBootApplication = (opts?:AirBootstrapOptions):ClassDecorator=>{
  return target => {
    // 设置默认配置文件
    const defaultConfiguration:ConfigurationOptions = {
      importConfigs:[
        path.join(process.cwd(),"./config")
      ]
    }
    const configurationOptions = Object.assign({},defaultConfiguration,opts?.configurationOptions)
    // 设置默认的bootstrap配置文件
    const defaultBootstrapOptions:BootstrapOptions = {
      configurationModule:[target]
    }
    const bootStrapOptions = Object.assign({},defaultBootstrapOptions,opts?.bootstrapOptions)
    // 自动配置
    Configuration(configurationOptions)(target)
    // 是一个组件
    Component()(target)
    // 装饰当前类为单例
    Scope(ScopeEnum.Singleton)(target)
    // 保存启动配置参数
    saveClassMetadata(AIR_BOOT_STARTER,bootStrapOptions,target)
    // 启动
    target["main"] && isFunction(target["main"]) && target["main"](process.argv.splice(2))
  }
}