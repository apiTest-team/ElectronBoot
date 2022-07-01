/**
 * 应用启动类
 * @constructor
 */
import { BootstrapOptionsInterface } from "../../interface/bootstrap.interface";
import { Component } from "./component.decorator";
import { Scope } from "./objectdef.decorator";
import { ScopeEnum } from "../../interface";
import { Configuration } from "./configuration.decorator";
import {
  getClassMetadata,
  getComponentUUID,
  getObjectDefinition,
  getPropertyAutowired
} from "../../manager/default.manager";
import { CONFIGURATION_KEY } from "../../constant";
import * as console from "console";

/**
 * 启动
 * @param opts
 * @constructor
 */
export const ElectronBootApplication = (opts?:BootstrapOptionsInterface):ClassDecorator => {
  return function(target) {
    Component()(target)
    Scope(ScopeEnum.Singleton)(target)
    Configuration(opts)(target)
    if (target.prototype.hasOwnProperty("main")){

    }
  }
}