import { ScopeEnum } from "../../interface";
import { saveObjectDefinition } from "../../manager";

/**
 * 给类方法设置为初始化时调用
 * @constructor
 */
export const Init = ():MethodDecorator=>{
  return (target, propertyKey) => {
    saveObjectDefinition(target, { initMethod: propertyKey });
  }
}
/**
 * 给类的方法设置为销毁时调用
 * @constructor
 */
export const Destroy = ():MethodDecorator => {
  return (target, propertyKey) => {
    saveObjectDefinition(target,{destroyMethod: propertyKey})
  }
}

/**
 * 设置类的作用域
 * @param scope 作用域枚举
 * @param scopeOptions
 * @constructor
 */
export const Scope = (scope: ScopeEnum,scopeOptions?: { allowDowngrade?: boolean }):ClassDecorator => {
    return target => {
      saveObjectDefinition(target, { scope, ...scopeOptions });
    }
}
