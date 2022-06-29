import {ObjectIdentifier} from "../../interface";
import {savePropertyInject} from "../../manager";

/**
 * 自动注入属性
 * @param identifier
 * @constructor
 */
export const Autowired = (identifier?:ObjectIdentifier):PropertyDecorator => {
  return (target, targetKey) => {
    savePropertyInject({
        identifier,
        target,
        targetKey
    })
  }
}