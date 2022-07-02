import {ObjectIdentifier} from "../../interface";
import { savePropertyAutowired } from "../../manager/default.manager";

/**
 * 自动注入属性
 * @param identifier
 * @constructor
 */
export const Autowired = (identifier?:ObjectIdentifier):PropertyDecorator => {
  return (target, targetKey) => {
    savePropertyAutowired({
        identifier,
        target,
        targetKey
    })
  }
}