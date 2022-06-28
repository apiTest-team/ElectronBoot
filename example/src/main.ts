import "reflect-metadata"
import { Provide } from "@elector-boot/decorator/decorator/common/provide.decorator";
@Provide()
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}