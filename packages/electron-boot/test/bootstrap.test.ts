import {ElectronBootApplication} from "../src/decorator/bootstrap.decorator";
import {ElectronApplication} from "../src/boot/bootstrap";

@ElectronBootApplication()
export class TestElectronApplication {
    public static main(...args:string[]){
        ElectronApplication.run(TestElectronApplication,...args)
    }
}