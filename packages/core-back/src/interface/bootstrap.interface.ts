import { BootstrapOptions } from "../decorator";
import { ConfigurationOptions } from "../decorator";

export interface AutowiredBootstrapOptions {
  bootstrapOptions?:BootstrapOptions,
  configurationOptions?:ConfigurationOptions
}