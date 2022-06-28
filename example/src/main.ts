import "reflect-metadata"
import { Provide } from "@elector-boot/decorator/index";
import { getProviderId } from "@elector-boot/decorator/index";
@Provide("aaa")
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}

console.log(getProviderId(DemoApplication));