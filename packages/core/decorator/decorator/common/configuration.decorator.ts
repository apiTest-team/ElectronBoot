/**
 * 配置应用类
 * @param opts
 * @constructor
 */
import { saveClassMetadata } from "../../manager/default.manager";
import { CONFIGURATION_KEY } from "../../constant";
import { ConfigurationOptions } from "../../interface/configuration.interface";

/**
 * 上下文启动配置
 * @param opts
 * @constructor
 */
export const Configuration = (opts:ConfigurationOptions={}):ClassDecorator => {
  return target => {
    saveClassMetadata(CONFIGURATION_KEY,opts,target)
  }
}