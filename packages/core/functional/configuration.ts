import { InjectionConfigurationOptions } from "../interface/injectionConfigurationOptions.interface";
import { ContainerInterface } from "../interface";


export class FunctionalConfiguration {
  private readyHandler;
  private stopHandler;
  private configLoadHandler;
  private serverReadyHandler;
  private options: InjectionConfigurationOptions;

  constructor(options: InjectionConfigurationOptions) {
    this.options = options;
    this.readyHandler = () => {};
    this.stopHandler = () => {};
    this.configLoadHandler = () => {};
    this.serverReadyHandler = () => {};
  }

  onConfigLoad(
    configLoadHandler:
      | ((container: ContainerInterface) => any)
      | ContainerInterface
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
      | ((container: ContainerInterface) => void)
      | ContainerInterface
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
      | ((container: ContainerInterface) => void)
      | ContainerInterface
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
      | ((container: ContainerInterface) => void)
      | ContainerInterface
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

export const createConfiguration = (options: InjectionConfigurationOptions) => {
  return new FunctionalConfiguration(options);
};
