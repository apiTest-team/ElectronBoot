import { ObjectIdentifier } from "../types/decorator.types";
import { saveComponentId } from "./default.manager";
/**
 * 组件装饰器
 * @constructor
 */
export const Component = (identifier?:ObjectIdentifier):ClassDecorator=>{
  return target => {
    return saveComponentId(identifier,target)
  }
}