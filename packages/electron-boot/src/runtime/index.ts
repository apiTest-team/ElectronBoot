import { BaseRuntime,
    ApplicationInterface,
    AutowiredContextInterface,
    RuntimeConfigurationOptions,
    Runtime,
    BootstrapOptions
} from "@autowired/core"

@Runtime()
export class AutowiredElectronRuntime extends BaseRuntime<
    ApplicationInterface,
    AutowiredContextInterface,
    RuntimeConfigurationOptions
    >{
    applicationInitialize(opts: Partial<BootstrapOptions>): any {


    }

    getRuntimeName(): string {
        return
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

}