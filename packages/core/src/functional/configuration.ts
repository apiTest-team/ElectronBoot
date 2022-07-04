import { AirContainerInterface } from "../interface";
import { ConfigurationOptions } from "../decorator";


export class FunctionalConfiguration {
  private readyHandler;
  private stopHandler;
  private configLoadHandler;
  private serverReadyHandler;
  private options: ConfigurationOptions;

  constructor(options: ConfigurationOptions) {
    this.options = options;
    this.readyHandler = () => {};
    this.stopHandler = () => {};
    this.configLoadHandler = () => {};
    this.serverReadyHandler = () => {};
  }

  onConfigLoad(
    configLoadHandler:
      | ((container: AirContainerInterface) => any)
      | AirContainerInterface
  ) {
    if (typeof configLoadHandler === 'function') {
      this.configLoadHandler = configLoadHandler;
    } else {
      return this.configLoadHandler(configLoadHandler);
    }
    return this;
  }

  onReady(
    readyHandler:
      | ((container: AirContainerInterface) => void)
      | AirContainerInterface
  ) {
    if (typeof readyHandler === 'function') {
      this.readyHandler = readyHandler;
    } else {
      return this.readyHandler(readyHandler);
    }
    return this;
  }

  onServerReady(
    serverReadyHandler:
      | ((container: AirContainerInterface) => void)
      | AirContainerInterface
  ) {
    if (typeof serverReadyHandler === 'function') {
      this.serverReadyHandler = serverReadyHandler;
    } else {
      return this.serverReadyHandler(serverReadyHandler);
    }
    return this;
  }

  onStop(
    stopHandler:
      | ((container: AirContainerInterface) => void)
      | AirContainerInterface
  ) {
    if (typeof stopHandler === 'function') {
      this.stopHandler = stopHandler;
    } else {
      return this.stopHandler(stopHandler);
    }
    return this;
  }

  getConfigurationOptions() {
    return this.options;
  }
}

export const createConfiguration = (options: ConfigurationOptions) => {
  return new FunctionalConfiguration(options);
};
