import { BaseRuntime,
    ApplicationInterface,
    AutowiredContextInterface,
    RuntimeConfigurationOptions,
    Runtime,
    BootstrapOptions
} from "@autowired/core"
import {WindowInterface} from "../window/interface";

@Runtime()
export class AutowiredElectronRuntime extends BaseRuntime<
    ApplicationInterface,
    AutowiredContextInterface,
    RuntimeConfigurationOptions
    >{
    private Window:WindowInterface

    applicationInitialize(opts: Partial<BootstrapOptions>): any {
    }

    configure(options: RuntimeConfigurationOptions | undefined): any {
    }

    getAppDir(): string {
        return "ecboot";
    }

    getBaseDir(): string {
        return "";
    }

    run(): Promise<void> {
        return Promise.resolve(undefined);
    }

    configure(opts?: RuntimeConfigurationOptions): any {
    }

}