import util from "util";
import {AutowiredContainer,bindContainer} from "@autowired/core";
import {BootstrapOptions} from "./options";

//debug工具
const debug = util.debuglog('electron:debug');
/**
 * 初始化应用上下文
 * @param globalOptions
 */
export const prepareGlobalApplicationContext =  (globalOptions:BootstrapOptions) => {
    debug('[electron-boot]: start "initializeGlobalApplicationContext"');
    debug(`[electron-boot]: bootstrap options = ${util.inspect(globalOptions)}`);
    // 创建上下文
    const applicationContext = globalOptions.applicationContext  ?? new AutowiredContainer()
    debug('[electron-boot]: delegate module map from decoratorManager');
    // 绑定容器
    bindContainer(applicationContext)
    global["ELECTRON_APPLICATION_CONTEXT"] = applicationContext

}