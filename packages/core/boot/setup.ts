import { AirContainerInterface } from "../interface";
import { BootstrapOptions, Constructable } from "../decorator/interface/bootstrap.interface";
import { bindContainer, clearBindContainer, listPreloadModule } from "../decorator/manager/default.manager";
import { AirContainer } from "../context/container";
import { DirectoryFileDetector } from "../common/fileDetector";
import { safeRequire } from "../utils";
import {join} from "path"
import { EnvironmentService } from "../service/environment.service";
import { ConfigService } from "../service/config.service";
import defaultConfig from "../config/default.config";
import util from "util";
import { LifeCycleService } from "../service/lifeCycleService";
import { AspectService } from "../service/aspect.service";
import { DecoratorService } from "../service/decorator.service";
import { RuntimeService } from "../service/runtime.service";
const debug = util.debuglog('air:debug');
/**
 * 初始化全局工期
 * @param globalOptions
 */
export const initializeGlobalApplicationContext = async function(globalOptions:BootstrapOptions):Promise<AirContainerInterface> {
  // 创建容器
  const applicationContext = prepareGlobalApplicationContext(globalOptions)

  // 初始化运行时
  await applicationContext.getAsync(RuntimeService,[applicationContext,globalOptions])

  // 初始化生命周期
  await applicationContext.getAsync(LifeCycleService,[applicationContext])

  // 加载前的模块初始化
  const modules =  listPreloadModule()
  for (const module of modules) {
    await applicationContext.getAsync(module as Constructable<any>)
  }

  return applicationContext
}

/**
 * 等待注销
 * @param applicationContext
 */
export const destroyGlobalApplicationContext = async (applicationContext:AirContainerInterface)=>{
  const lifecycleService = await applicationContext.getAsync(LifeCycleService)
  await lifecycleService.stop()
  // 停止容器
  await applicationContext.stop()
  clearBindContainer()
}

/**
 * 前置处理
 * @param globalOptions
 */
export const prepareGlobalApplicationContext = (globalOptions:BootstrapOptions):AirContainerInterface => {

  debug(`[core]: start "initializeGlobalApplicationContext"`)
  debug(`[core]: bootstrap options = ${util.inspect(globalOptions)}`)
  // 要扫描的文件路径
  const baseDir = globalOptions.baseDir??""
  // 应用路径
  const appDir = globalOptions.appDir??""
  // 初始化全局容器
  const applicationContext = globalOptions.applicationContext?? new AirContainer()
  debug(`[core]: delegate module map from decoratorManager`)
  // 绑定容器到装饰器管理器
  bindContainer(applicationContext)

  // 注册目录
  applicationContext.registerObject("baseDir",baseDir)
  applicationContext.registerObject("appDir",appDir)

  // 如果没有禁用扫描器
  if (globalOptions.moduleDetector!==false){
    if (globalOptions.moduleDetector===undefined || globalOptions.moduleDetector==="file"){
      applicationContext.setFileDetector(
        new DirectoryFileDetector({
          loadDir:baseDir,
          ignore:globalOptions.ignore??[]
        })
      )
    }else if (globalOptions.moduleDetector){
      applicationContext.setFileDetector(globalOptions.moduleDetector)
    }
  }

  // 绑定内部服务
  applicationContext.bindClass(EnvironmentService)
  applicationContext.bindClass(AspectService);
  applicationContext.bindClass(DecoratorService);
  applicationContext.bindClass(ConfigService)
  applicationContext.bindClass(RuntimeService)
  applicationContext.bindClass(LifeCycleService)

  // 加载前的模块绑定
  if (globalOptions.preloadModules && globalOptions.preloadModules.length) {
    for (const preloadModule of globalOptions.preloadModules) {
      applicationContext.bindClass(preloadModule);
    }
  }

  // 初始化并设置默认配置
  const configService = applicationContext.get(ConfigService)
  configService.add([{
    default:defaultConfig
  }])

  // 初始化aspect
  applicationContext.get(AspectService,[applicationContext])

  // 初始化decorator
  applicationContext.get(DecoratorService,[applicationContext])

  // 加载全局配置，即是运行目录加上configuration文件名
  if (!globalOptions.imports){
    globalOptions.imports = [
      safeRequire(join(globalOptions.baseDir ,"configuration"))
    ]
  }

  // 加载模块
  for (const configurationModule of []
    .concat(globalOptions.imports)
    .concat(globalOptions.configurationModule)
    ) {
    if (configurationModule){
      applicationContext.load(configurationModule)
    }
  }

  // app容器准备完毕
  applicationContext.ready()

  // 配置配置信息到配置服务
  if (globalOptions.globalConfig){
    if (Array.isArray(globalOptions.globalConfig)){
      configService.add(globalOptions.globalConfig)
    }else{
      configService.addObject(globalOptions.globalConfig)
    }
  }

  // 加载配置文件
  configService.load()
  debug('[core]: Current config = %j', configService.getConfiguration());

  return applicationContext
}