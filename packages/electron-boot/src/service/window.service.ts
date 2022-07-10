import {Component, IAutowiredContainer, Init, listModule, Scope, ScopeEnum} from "@autowired/core";
import { BaseWindow } from "../window";
import { ELECTRON_BOOT_WINDOW } from "../constant";
import { debuglog } from "util";
const debug = debuglog('electron:debug');

@Component()
@Scope(ScopeEnum.Singleton)
export class WindowService {
    private ready = false
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
        this.bindAllWindow()
    }

    /**
     * 绑定所有的窗口
     * @private
     */
    private bindAllWindow(){
        if (this.ready){
            return
        }
        // 获取所有的窗口
        const windows = listModule(ELECTRON_BOOT_WINDOW)

        debug(`[core]: Found windows length = ${windows.length}`);

        // 找出主窗口实例
        for (const window of windows) {
            this.applicationContext.bindClass(window)
            // 如果是设置了主窗口
            if (window.main){
                // 获取实例
                window.instance = this.applicationContext.get<BaseWindow>(window.target,[this.applicationContext])
                window.instance && (this.MainWindow = window.instance)
                break
            }
        }
        this.ready =  true
    }

    /**
     * 获取主窗口
     */
    getMainWindow=():BaseWindow => {
        return this.MainWindow
    }

}