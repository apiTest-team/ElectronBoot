import { RuntimeConfigurationOptions,
  RuntimeInterface,
  RuntimeType,
  AutowiredContextInterface,
  AutowiredContainerInterface,
  ApplicationInterface} from "../interface";
import { EnvironmentService,ConfigService } from "../service";
import { Autowired, Destroy, Init,BootstrapOptions } from "../decorator";
import { AutowiredRequestContainer } from "../context";
/**
 * 基础运行时环境
 */
export abstract class BaseRuntime<
  App extends ApplicationInterface<Ctx>,
  Ctx extends AutowiredContextInterface,
  Opts extends RuntimeConfigurationOptions
> implements RuntimeInterface<App, Ctx, Opts>
{
  public app: App;
  public configurationOptions: Opts;
  protected contextLoggerApplyLogger: string;
  protected defaultContext = {};

  @Autowired()
  environmentService: EnvironmentService;

  @Autowired()
  configService: ConfigService;

  // 构造函数
  protected constructor(readonly applicationContext: AutowiredContainerInterface) {}

  @Init()
  async init() {
    this.configurationOptions = this.configure() ?? ({} as Opts);
    return this;
  }
  // 提供配置犯法供继承类配置
  abstract configure(options?: Opts);
  // 是否禁用
  isEnable(): boolean {
    return true;
  }
  /**
   * 初始化接口
   * @param opts
   */
  public async initialize(opts?: Partial<BootstrapOptions>): Promise<void> {
    await this.beforeContainerInitialize(opts);
    await this.containerInitialize(opts);
    await this.afterContainerInitialize(opts);
    await this.containerDirectoryLoad(opts);
    await this.afterContainerDirectoryLoad(opts);
    // 第三方应用初始化
    await this.applicationInitialize(opts);
    await this.containerReady(opts);
    await this.afterContainerReady(opts);
  }

  protected async beforeContainerInitialize(opts: Partial<BootstrapOptions>): Promise<void> {}

  protected async containerInitialize(opts: Partial<BootstrapOptions>): Promise<void> {}

  protected async afterContainerInitialize(opts: Partial<BootstrapOptions>): Promise<void> {}

  protected async containerDirectoryLoad(opts: Partial<BootstrapOptions>): Promise<void> {}

  protected async afterContainerDirectoryLoad(opts: Partial<BootstrapOptions>): Promise<void> {}

  public abstract applicationInitialize(opts: Partial<BootstrapOptions>);

  protected async containerReady(opts: Partial<BootstrapOptions>) {
    // 如果没有获取到应用的上下文，则给应用定义
    if (!this.app.getApplicationContext()) {
      this.defineApplicationProperties();
    }
  }

  protected async afterContainerReady(opts: Partial<BootstrapOptions>): Promise<void> {}

  public abstract getAppDir(): string;

  public getApplicationContext(): AutowiredContainerInterface {
    return this.applicationContext;
  }

  abstract getBaseDir(): string;

  public getCurrentEnvironment(): string {
    return this.environmentService.getCurrentEnvironment();
  }

  public getConfiguration(key?: string): any {
    return this.configService.getConfiguration(key);
  }

  public getRuntimeName(): string{
    return this.constructor.name
  }

  getApplication(): App {
    return this.app
  }

  abstract run(): Promise<void>;

  @Destroy()
  public async stop(): Promise<void> {
    await this.beforeStop();
  }

  protected async beforeStop(): Promise<void> {}
  /**
   * 给应该定义信息
   * @param applicationProperties
   * @param whiteList
   * @protected
   */
  protected defineApplicationProperties(applicationProperties = {}, whiteList: string[] = []) {
    const defaultApplicationProperties: ApplicationInterface = {
      getAppDir: (): string => {
        return this.getAppDir();
      },
      getBaseDir: (): string => {
        return this.getAppDir();
      },
      getEnv: (): string => {
        return this.environmentService.getCurrentEnvironment();
      },
      getConfig: (key?: string): any => {
        return this.getConfiguration(key);
      },
      addConfigObject: (object: any) => {
        this.configService.addObject(object);
      },
      getAttr<T>(key: string): T {
        return this.getApplicationContext().getAttr(key);
      },
      setAttr(key: string, value: any) {
        this.getApplicationContext().setAttr(key, value);
      },
      getRuntimeType: (): RuntimeType => {
        if (this["getRuntimeType"]) {
          return this["getRuntimeType"]();
        }
      },
      getApplicationContext: (): AutowiredContainerInterface => {
        return this.getApplicationContext();
      },
      createAnonymousContext: (extendCtx?: Ctx): Ctx => {
        const ctx = extendCtx || Object.create(this.defaultContext);
        if (!ctx.startTime) {
          ctx.startTime = Date.now();
        }
        if (!ctx.requestContext) {
          ctx.requestContext = new AutowiredRequestContainer(ctx, this.getApplicationContext());
          ctx.requestContext.ready();
        }
        ctx.setAttr = (key: string, value: any) => {
          ctx.requestContext.setAttr(key, value);
        };
        ctx.getAttr = <T>(key: string): T => {
          return ctx.requestContext.getAttr(key);
        };
        return ctx;
      },
    };
    Object.assign(this.app, defaultApplicationProperties, applicationProperties);
  }
}