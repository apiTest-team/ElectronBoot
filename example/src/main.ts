import "reflect-metadata"
import { AirApplication } from "@air/core/boot/bootstrap";
import { AirBootApplication } from "@air/core/decorator/decorator/common/bootstrap.decorator";

@AirBootApplication()
export class DemoApplication {
  public static main(...args:string[]) {
    AirApplication.run(DemoApplication,args)
  }
}