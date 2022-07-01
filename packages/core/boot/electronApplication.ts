import { app } from "electron"
import { BootstrapOptionsInterface, Constructable } from "../context/decorator/interface/bootstrap.interface";
import { ContainerInterface } from "../interface";
import * as process from "process";
import { join } from "path";
import { initializeGlobalApplicationContext } from "./setup";

/**
 * 应用初始化入口
 */
export class ElectronApplication {
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
  public static build():ElectronApplication{
    return new ElectronApplication()
  }
  /**
   * 运行方法
   * @constructor
   */
  public static run<T>(target:Constructable<T>,...args:string[]):void {
    void (new ElectronApplication())
      .run(target,...args)
      .then()
      .catch()
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
   * @param target
   * @param args
   */
  public async run<T>(target:Constructable<T>,...args:string[]){
    // 如果没有配置过
    if (!this.configured){
      this.configure()
    }
    // 配置electron的app模块


    this.applicationContext = await this.init()
  }

  /**
   * 初始化
   * @private
   */
  private async init() {
    this.appDir = this.globalOptions.appDir || process.cwd()
    this.baseDir = this.getBaseDir()

    this.applicationContext = await initializeGlobalApplicationContext({
      ...this.globalOptions,
      appDir:this.appDir,
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
    // 判断是否打了包
    if (app.isPackaged) {
      return join(this.appDir, 'src');
    } else {
      return join(this.appDir, 'dist');
    }
  }
}