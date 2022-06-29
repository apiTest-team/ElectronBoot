import "reflect-metadata"
import { Component } from "@elector-boot/decorator/index";
import { getComponentId } from "@elector-boot/decorator/index";
@Component("aaa")
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}

console.log(getComponentId(DemoApplication));