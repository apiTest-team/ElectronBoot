import "reflect-metadata"
import { getComponentId } from "@elector-boot/decorator/manager/default.manager";
import { ElectronBootApplication } from "@elector-boot/decorator/decorator/bootstrap/bootstrap";

@ElectronBootApplication()
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}
console.log(getComponentId(DemoApplication));