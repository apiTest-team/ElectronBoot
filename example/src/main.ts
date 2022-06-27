import "reflect-metadata"
@ElectronBootApplication()
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}