import "reflect-metadata"
import {ElectronApplication, ElectronBootApplication} from "@autowired/electron-boot";

export * from "./wins/main"

@ElectronBootApplication()
export class ApiTestApplication {
    public static async main(...args:string[]){
        await ElectronApplication.run(ApiTestApplication,...args)
    }
}