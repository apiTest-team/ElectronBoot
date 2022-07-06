import { Autowired_BOOT_STARTER, BootstrapOptions, getClassMetadata } from "../decorator";
import { AutowiredContainerInterface } from "../interface";
import { destroyGlobalApplicationContext, initializeGlobalApplicationContext } from "./setup";
import { join } from "path";

/**
 * 当前环境是否时ts开发环境
 */
export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

/**
 * app启动器
 */
export class AutowiredApplication {
  private static starter:AutowiredApplication
  private static configured = false
  private static applicationContext:AutowiredContainerInterface
  private applicationContext: AutowiredContainerInterface;
  protected appDir:string=""
  protected baseDir:string=""
  protected globalOptions:Partial<BootstrapOptions> = {}
  protected globalConfig:any
  public static build(){
    if (!this.starter){
      this.starter = new AutowiredApplication()
    }
    return this.starter
  }

  // public static configure(opts:BootstrapOptions){
  //
  // }
  /**
   * 配置信息
   * @param configuration
   */
  private static configure(configuration:BootstrapOptions={}){
    this.configured = true
    if (configuration.appDir && configuration.appDir!==process.cwd()){
      process.chdir(configuration.appDir)
    }
    configuration.globalConfig
    this.getStarter().configure(configuration)
    return this
  }
  /**
   * 获取启动器
   * @private
   */
  private static getStarter(){
    if (!this.starter){
      this.starter = new AutowiredApplication()
    }
    return this.starter
  }
  /**
   * 运行方法
   */
  public static async run(target:any,args:string[]){
    // 获取配置信息
    const options = getClassMetadata(Autowired_BOOT_STARTER,target)
    if (!this.configured){
      this.configure(options)
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

  /**
   * 获取应用上下文
   */
  public static getApplicationContext(): AutowiredContainerInterface {
    return this.applicationContext;
  }

  /**
   * on bootstrap receive a exit signal
   * @param signal
   */
  private static async onSignal(signal:any) {
    console.log('[autowired:bootstrap] receive signal %s, closing', signal);
    try {
      await this.stop();
      console.log('[autowired:bootstrap] close done, exiting with code:0');
      process.exit(0);
    } catch (err) {
      console.log('[autowired:bootstrap] close with error: ', err);
      process.exit(1);
    }
  }

  /**
   * on bootstrap process exit
   * @param code
   */
  private static onExit(code) {
    console.log('[midway:bootstrap] exit with code:%s', code);
  }

  private static uncaughtExceptionHandler(err) {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    if (err.name === 'Error') {
      err.name = 'unhandledExceptionError';
    }
    console.log(err);
  }

  private static unhandledRejectionHandler(err) {
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
    this.starter = {} as AutowiredApplication;
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

  public configure(opts:BootstrapOptions){
    this.globalOptions = opts
    return this
  }

  protected getBaseDir() {
    if (this.globalOptions.baseDir) {
      return this.globalOptions.baseDir;
    }
    if (isTypeScriptEnvironment()) {
      return join(this.appDir);
    } else {
      return join(this.appDir);
    }
  }

  public async run() {}

  public async stop() {
    await destroyGlobalApplicationContext(this.applicationContext);
  }
}