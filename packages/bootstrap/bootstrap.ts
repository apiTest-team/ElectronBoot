/**
 * 应用启动类
 */
class ElectronApplication {
  // 运行该项目的路径
  protected appDir:string
  // 其他文件所在的路径
  protected baseDir:string
  /**
   * 提供的静态初始化方法
   * @param target 目标注解类
   * @param args 额外参数
   */
  public static run(target,...args:Array<string>){
    new ElectronApplication().run(target,...args)
  }

  /**
   * 对象初始化方法
   * @param target
   * @param args
   */
  public run(target,...args:Array<string>){

  }

  /**
   * 初始化方法
   */
  public init(){

  }
}