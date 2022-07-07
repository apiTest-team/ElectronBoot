import { ScopeEnum } from "../interface/decorator.interface";
import { saveObjectDefinition } from "./default.manager";

/**
 * 作用域装饰器
 * @param scope 作用域枚举
 * @param scopeOpts 额外参数
 * @constructor
 */
export const Scope = (
  scope:ScopeEnum,
  scopeOpts?:{
    allowDowngrade?:boolean
  }
):ClassDecorator => {
  return target => {
    saveObjectDefinition(target,{scope,...scopeOpts})
  }
}

/**
 * 初始化方法装饰器
 * @constructor
 */
export const Init = ():MethodDecorator => {
  return (target:any, propertyKey:string) => {
    saveObjectDefinition(target,{
      initMethod:propertyKey
    })
  }
}

/**
 * 销毁方法装饰器
 * @constructor
 */
export const Destroy = ():MethodDecorator => {
  return (target:any, propertyKey:string) => {
    saveObjectDefinition(target,{
      destroyMethod:propertyKey
    })
  }
}