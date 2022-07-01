import { BootstrapOptionsInterface } from "../context/decorator/interface/bootstrap.interface";
import { ContainerInterface } from "../interface";
import { join } from "path";
import { initializeGlobalApplicationContext } from "./setup";
import { getCurrentEnvironment } from "../utils";

/**
 * 应用初始化入口
 */
export class Bootstrap {
  /**
   * 是否已经配置
   * @private
   */
  private configured = false
  /**
   * 项目路径地址
   * @private
   */
  private appDir:string
  /**
   * 启动文件路径
   * @private
   */
  private baseDir:string
  /**
   * 日志组件
   * @private
   */
  private logger = null
  /**
   * app容器
   * @private
   */
  private applicationContext:ContainerInterface
  /**
   * 全局配置信息
   * @private
   */
  private globalOptions: Partial<BootstrapOptionsInterface> = {}

  /**
   * 构建器
   */
  public static build():Bootstrap{
    return new Bootstrap()
  }
  /**
   * 运行方法
   * @constructor
   */
  public static run() {
    return new Bootstrap().run().then().catch()
  }

  /**
   * 初始化配置
   */
  public configure(opts:BootstrapOptionsInterface={}){
    this.configured = true
    if (!this.logger){
      // 初始化日志
      if (opts.logger === false){

      }
      opts.logger = this.logger
    }

    return this
  }

  /**
   * 内部运行方法
   */
  public async run(){
    // 如果没有配置过
    if (!this.configured){
      this.configure()
    }
    // 配置electron的app模块


    this.applicationContext = await this.init()
    return this.start().then(()=>{
      console.log("[midway:bootstrap] current app started");
    }).catch((err)=>{
      console.log(err);
      process.exit(1);
    })
  }

  /**
   * 一直停止
   * @private
   */
  private async start(){

  }

  /**
   * 初始化
   * @private
   */
  private async init() {
    this.baseDir = this.getBaseDir()

    this.applicationContext = await initializeGlobalApplicationContext({
      ...this.globalOptions,
      baseDir:this.baseDir
    })
    return this.applicationContext
  }

  /**
   * 判断是否打了包
   * @protected
   */
  protected getBaseDir() {
    if (this.globalOptions.baseDir) {
      return this.globalOptions.baseDir;
    }
    const env = getCurrentEnvironment()
    this.baseDir = "./"
    // 判断是否打了包
    if (env !== "prod") {
      return join(this.baseDir, 'src');
    } else {
      return join(this.baseDir, 'dist');
    }
  }
}