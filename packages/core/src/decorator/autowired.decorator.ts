import { ObjectIdentifier } from "../types/decorator.types";
import { savePropertyAutowired } from "./default.manager";

/**
 * 自动注入装饰器
 * @param identifier
 * @constructor
 */
export const Autowired = (identifier?: ObjectIdentifier):PropertyDecorator => {
  return (target:any, targetKey:string) => {
    savePropertyAutowired({target,targetKey,identifier})
  }
}