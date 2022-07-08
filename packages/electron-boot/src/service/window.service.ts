import {Component, IAutowiredContainer, Init, listModule, Scope, ScopeEnum} from "@autowired/core";
import { BaseWindow } from "../window/base.window";
import { ELECTRON_BOOT_WINDOW } from "../constant/bootstrap.constant";
import { debuglog } from "util";
const debug = debuglog('electron:debug');

@Component()
@Scope(ScopeEnum.Singleton)
export class WindowService {
    /**
     * 主窗口
     * @private
     */
    private MainWindow:BaseWindow=null
    /**
     * 构造函数
     * @param applicationContext
     */
    constructor(readonly applicationContext:IAutowiredContainer) {}
    /**
     * 初始化
     * @protected
     */
    @Init()
    protected init(){
        console.log("进来了");
        // 获取所有的窗口
        const windows = listModule(ELECTRON_BOOT_WINDOW)

        debug(`[core]: Found windows length = ${windows.length}`);

        // 找出主窗口实例
        for (const window of windows) {
            // 如果是设置了主窗口
            if (window.main){
                // 获取实例
                window.instance = this.applicationContext.get<BaseWindow>(window.target)
                window.instance && (this.MainWindow = window.instance)
                break
            }
        }

    }

    /**
     * 获取主窗口
     */
    getMainWindow=():BaseWindow => {
        return this.MainWindow
    }

}