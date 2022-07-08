import util from "util";
import {AspectService, AutowiredContainer,bindContainer, DecoratorService, listPreloadModule} from "@autowired/core";
import {BootstrapOptions} from "./options";
import { DirectoryFileDetector } from "../detector/file.detector";
import { EnvironmentService } from "../service/environment.service";
import { InformationService } from "../service/infomation.service";
import { ConfigService } from "../service/config.service";
import configDefault from "../config/config.default";

//debug工具
const debug = util.debuglog('electron:debug');

/**
 * 初始化上下文
 * @param globalOptions 初始化参数
 */
export const initializeGlobalApplicationContext =async (globalOptions:BootstrapOptions)=>{
    // 创建应用上下文
    const applicationContext = prepareGlobalApplicationContext(globalOptions)



    // 初始化前置模块
    const modules = listPreloadModule()
    for (const module of modules) {
        applicationContext.getAsync(module)
    }

    return applicationContext
}

/**
 * 初始化应用上下文
 * @param globalOptions
 */
export const prepareGlobalApplicationContext =  (globalOptions:BootstrapOptions) => {
    debug('[electron-boot]: start "initializeGlobalApplicationContext"');
    debug(`[electron-boot]: bootstrap options = ${util.inspect(globalOptions)}`);

    // 设置扫描文件夹
    const baseDir = globalOptions.baseDir ?? ""

    // 创建上下文
    const applicationContext = globalOptions.applicationContext  ?? new AutowiredContainer()
    debug('[electron-boot]: delegate module map from decoratorManager');
    // 绑定容器
    bindContainer(applicationContext)
    global["ELECTRON_APPLICATION_CONTEXT"] = applicationContext

    // 绑定静态变量
    applicationContext.bindObject("baseDir",baseDir)

    // 如果设置了模块扫描器
    if (globalOptions.moduleDetector !== false) {
        if (
          globalOptions.moduleDetector === undefined ||
          globalOptions.moduleDetector === 'file'
        ) {
            applicationContext.setFileDetector(
              new DirectoryFileDetector({
                  loadDir: baseDir,
                  ignore: globalOptions.ignore ?? [],
              })
            );
        } else if (globalOptions.moduleDetector) {
            applicationContext.setFileDetector(globalOptions.moduleDetector);
        }
    }

    // 绑定内部服务
    applicationContext.bindClass(EnvironmentService)
    applicationContext.bindClass(InformationService)
    applicationContext.bindClass(AspectService)
    applicationContext.bindClass(DecoratorService)
    applicationContext.bindClass(ConfigService)

    // 初始化配置服务
    const configService = applicationContext.get(ConfigService)
    configService.add([
      {
          default:configDefault
      }
    ])

    // 初始化aop
    applicationContext.get(AspectService,[applicationContext])
    // 初始化decorator
    applicationContext.get(DecoratorService,[applicationContext])

    // 合并配置
    configService.load()
    debug("[electron-boot]: Current config = %j",configService.getConfiguration())

    return applicationContext
}