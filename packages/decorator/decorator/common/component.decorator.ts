import { ObjectIdentifier } from "../../interface";
import { saveComponentId } from "../../manager";
/**
 * 服务提供者
 * @constructor
 */
export const Component = (identifier?:ObjectIdentifier):ClassDecorator => {
  return target => {
    return saveComponentId(identifier,target)
  }
}