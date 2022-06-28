import { ObjectIdentifier } from "../../interface";
import { saveProviderId } from "../../manager";
/**
 * 服务提供者
 * @constructor
 */
export const Provide = (identifier?:ObjectIdentifier):ClassDecorator => {
  return target => {
    return saveProviderId(identifier,target)
  }
}