import "reflect-metadata"
import {
  ElectronBootApplication
} from "@electron-boot/core/context/decorator/decorator/common/electronBootApplication.decorator";
import { ElectronApplication } from "@electron-boot/core/boot/electronApplication";

@ElectronBootApplication()
export class DemoApplication {
  public static main(...args:string[]) {
    ElectronApplication.run(DemoApplication,...args)
  }
}