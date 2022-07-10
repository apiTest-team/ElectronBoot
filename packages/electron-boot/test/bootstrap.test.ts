import {ElectronBootApplication} from "../src";
import {ElectronApplication} from "../src";

@ElectronBootApplication()
export class ApiTestApplication {
    public static async main(...args:string[]){
        await ElectronApplication.run(ApiTestApplication,...args)
    }
}