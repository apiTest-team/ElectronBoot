import { BootstrapOptions } from "../decorator/interface/bootstrap.interface";
import { AirContainerInterface } from "../interface";
import { destroyGlobalApplicationContext, initializeGlobalApplicationContext } from "./setup";
import * as path from "path";
import { getClassMetadata } from "../decorator/manager/default.manager";
import { AIR_BOOT_STARTER } from "../decorator/constant";
import * as process from "process";

/**
 * 当前环境是否时ts开发环境
 */
export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.TS_MODE as string;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

export class BootstrapStarter {
  protected appDir:string=""
  protected baseDir:string=""
  protected globalOptions:Partial<BootstrapOptions> = {}
  protected globalConfig:any
  protected applicationContext:AirContainerInterface={} as AirContainerInterface
  public configure(opts:BootstrapOptions){
    this.globalOptions = opts
    return this
  }
  public async init(){
    this.appDir = this.globalOptions.appDir || process.cwd()
    this.baseDir = this.getBaseDir()
    this.applicationContext = await initializeGlobalApplicationContext({
      ...this.globalOptions,
      appDir:this.appDir,
      baseDir:this.baseDir
    })
    return this.applicationContext
  }

  public async run(){}

  public async stop(){
    await destroyGlobalApplicationContext(this.applicationContext)
  }

  protected getBaseDir():string{
    if (this.globalOptions.baseDir){
      return this.globalOptions.baseDir
    }
    if (isTypeScriptEnvironment()){
      return path.join(this.appDir,"src")
    }else{
      return path.join(this.appDir,"dist")
    }
  }
}

export class Bootstrap {
  private static starter:BootstrapStarter
  private static configured = false
  private static applicationContext:AirContainerInterface


  static configure(configuration:BootstrapOptions={}){
    this.configured = true
    if (configuration.appDir && configuration.appDir!==process.cwd()){
      process.chdir(configuration.appDir)
    }
    this.getStarter().configure(configuration)
    return this
  }

  private static getStarter(){
    if (!this.starter){
      this.starter = new BootstrapStarter()
    }
    return this.starter
  }

  /**
   * 运行方法
   */
  public static async run(){
    if (!this.configured){
      this.configure()
    }
    process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
    // kill(3) Ctrl-\
    process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
    // kill(15) default
    process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));

    process.once("exit",this.onExit.bind(this))

    this.uncaughtExceptionHandler = this.uncaughtExceptionHandler.bind(this);
    process.on('uncaughtException', this.uncaughtExceptionHandler);

    this.unhandledRejectionHandler = this.unhandledRejectionHandler.bind(this);
    process.on('unhandledRejection', this.unhandledRejectionHandler);

    this.applicationContext = await this.getStarter().init();
    return this.getStarter()
      .run()
      .then(() => {
        console.log('[midway:bootstrap] current app started');
      })
      .catch(err => {
        console.log(err);
        process.exit(1);
      });
  }

  static async stop() {
    await this.getStarter().stop();
    process.removeListener('uncaughtException', this.uncaughtExceptionHandler);
    process.removeListener(
      'unhandledRejection',
      this.unhandledRejectionHandler
    );
    this.reset();
  }

  static reset() {
    this.configured = false;
    this.starter = {} as BootstrapStarter;
  }

  private static uncaughtExceptionHandler(err:any) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }
    console.log(err);
  }

  private static unhandledRejectionHandler(err:any) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError';
    }
    console.log(err);
  }

  /**
   * on bootstrap receive a exit signal
   * @param signal
   */
  private static async onSignal(signal:any) {
    console.log('[air:bootstrap] receive signal %s, closing', signal);
    try {
      await this.stop();
      console.log('[air:bootstrap] close done, exiting with code:0');
      process.exit(0);
    } catch (err) {
      console.log('[air:bootstrap] close with error: ', err);
      process.exit(1);
    }
  }

  /**
   * on bootstrap process exit
   * @param code
   */
  private static onExit(code:any) {
    console.log("[air:bootstrap] exit with code:%s", code);
  }
}

export class AirApplication {
  private static starter:BootstrapStarter
  private static configured = false
  private applicationContext:AirContainerInterface

  /**
   * 配置信息
   * @param configuration
   */
  static configure(configuration:BootstrapOptions={}){
    this.configured = true
    if (configuration.appDir && configuration.appDir!==process.cwd()){
      process.chdir(configuration.appDir)
    }
  }
  /**
   * 运行方法
   */
  public static async run(target:any,args:string[]){
    const options = getClassMetadata(AIR_BOOT_STARTER,target)



    console.log(options);
    console.log(args);
  }
}