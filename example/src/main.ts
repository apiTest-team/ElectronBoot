import "reflect-metadata"
import { Bootstrap } from "@air/core/boot/electronApplication";

export class DemoApplication {
  public static main(...args:string[]) {
    Bootstrap.run(DemoApplication,...args)
  }
}