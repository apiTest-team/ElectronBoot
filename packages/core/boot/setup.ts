import { ContainerInterface } from "../interface";
import { BootstrapOptionsInterface, Constructable } from "../context/decorator/interface/bootstrap.interface";
import { bindContainer, clearBindContainer, listPreloadModule } from "../context/decorator/manager/default.manager";
import { ElectronBootContainer } from "../context/container";
import { DirectoryFileDetector } from "../common/fileDetector";
import { safeRequire } from "../utils";
import {app} from "electron";
import {join} from "path"
import { EnvironmentService } from "../service/environment.service";
import { ConfigService } from "../service/config.service";
import defaultConfig from "../config/default.config";
import util from "util";
import { LifeCycleService } from "../service/lifeCycleService";
import { AspectService } from "../service/aspectService";
import { DecoratorService } from "../service/decorator.service";
const debug = util.debuglog('electron-boot:debug');
/**
 * 初始化全局工期
 * @param globalOptions
 */
export const initializeGlobalApplicationContext = async function(globalOptions:BootstrapOptionsInterface):Promise<ContainerInterface> {
  // 创建容器
  const applicationContext = prepareGlobalApplicationContext(globalOptions)

  // 生命周期组件
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
export const destroyGlobalApplicationContext = async (applicationContext:ContainerInterface)=>{
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
export const prepareGlobalApplicationContext = (globalOptions:BootstrapOptionsInterface):ContainerInterface => {
  // 要扫描的文件路径
  const baseDir = globalOptions.baseDir??""
  // 初始化一个容器
  const applicationContext = globalOptions.applicationContext?? new ElectronBootContainer()
  // 绑定容器到装饰器管理器
  bindContainer(applicationContext)
  // 注册值
  applicationContext.registerObject("app",app)
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
  // // 初始化主窗口
  // applicationContext.get(globalOptions.mainWind,[applicationContext])
  // 加载配置文件
  if (!globalOptions.imports){
    globalOptions.imports = [
      safeRequire(join(globalOptions.baseDir,"configuration"))
    ]
  }
  for (const configurationModule of [].concat(globalOptions.imports).concat(globalOptions.configurationModule)) {
    if (configurationModule){
      applicationContext.load(configurationModule)
    }
  }

  applicationContext.ready()

  // 配置服务
  if (globalOptions.globalConfig){
    if (Array.isArray(globalOptions.globalConfig)){
      configService.add(globalOptions.globalConfig)
    }else{
      configService.addObject(globalOptions.globalConfig)
    }
  }

  configService.load()
  debug('[core]: Current config = %j', configService.getConfiguration());

  return applicationContext
}