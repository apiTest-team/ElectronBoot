/**
 * 运行时环境
 * @constructor
 */
import { saveModule } from "../../manager";
import { RUNTIME_KEY } from "../../constant";
import { Scope } from "./objectdef.decorator";
import { ScopeEnum } from "../../interface";
import { Component } from "./component.decorator";

/**
 * 运行时环境装饰器
 * @constructor
 */
export const Runtime = ():ClassDecorator=>{
  return target => {
    saveModule(RUNTIME_KEY,target)
    Scope(ScopeEnum.Singleton)(target)
    Component()(target)
  }
}