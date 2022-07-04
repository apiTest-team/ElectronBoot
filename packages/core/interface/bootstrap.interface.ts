import { BootstrapOptions } from "../decorator/interface/bootstrap.interface";
import { ConfigurationOptions } from "../decorator/interface/configuration.interface";

export interface AirBootstrapOptions {
  bootstrapOptions?:BootstrapOptions,
  configurationOptions?:ConfigurationOptions
}