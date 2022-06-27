import "reflect-metadata"

@ElectronBootApplication()
class DemoApplication {
  public static main(...args:Array<string>):void {
    ElectronApplication.run(DemoApplication,...args)
  }
}

/**
 * 应用启动类
 */
class ElectronApplication {
  public static run(target,...args:Array<string>){

  }
}