import { IAutowiredContainer,getClassMetadata } from "@autowired/core";
import {ELECTRON_BOOT_STARTER} from "../constant";
import {BootstrapOptions} from "./options";
import { app } from "electron";
import { destroyGlobalApplicationContext, initializeGlobalApplicationContext } from "./setup";
import { WindowService } from "../service";

class BootstrapStarter {
    protected globalOptions:Partial<BootstrapOptions> = {}
    protected globalConfig:any
    private applicationContext:IAutowiredContainer

    /**
     * 配置
     * @param options
     */
    public configure(options:BootstrapOptions){
        this.globalOptions = options
        return this
    }

    /**
     * 初始化
     */
    public async init(){
        this.applicationContext = await initializeGlobalApplicationContext({
            ...this.globalOptions
        })
        return this.applicationContext
    }

    /**
     * 运行方法
     */
    public async run(){}

    /**
     * 停止
     */
    public async stop(){
        await destroyGlobalApplicationContext(this.applicationContext)
    }
}
/**
 * electron应用
 */
export class ElectronApplication {
    private static starter:BootstrapStarter
    private static configured=false
    private globalConfig:BootstrapOptions
    private static applicationContext:IAutowiredContainer
    /**
     * 获取启动器
     * @private
     */
    private static getStarter() {
        if (!this.starter) {
            this.starter = new BootstrapStarter();
        }
        return this.starter;
    }
    /**
     * 配置信息
     * @param configuration
     * @private
     */
    private static configure(configuration:BootstrapOptions={}){
        this.configured = true
        this.getStarter().configure(configuration)
        return this
    }
    /**
     * 应用初始化完毕
     */
    private static onAppReady = ()=>{
        // 获取窗口服务
        const service = this.applicationContext.get(WindowService,[this.applicationContext])
        // 获取主窗口
        const wind = service.getMainWindow()
        // 显示窗口
        wind.run()
    }
    /**
     * 启动方法
     * @param target
     * @param args
     */
    static async run(target:any,...args:string[]){
        // 获取配置信息
        const options = getClassMetadata(ELECTRON_BOOT_STARTER,target)
        if (!this.configured){
            this.configure(options)
        }
        // 应用上下文初始化
        this.applicationContext = await this.getStarter().init()
        // 应用初始化完毕
        app.whenReady().then(this.onAppReady)
        // 所有的窗口关闭事件
        app.on("window-all-closed", async () => {
            await this.stop
            // 所有平台均为所有窗口关闭就退出软件
            app.quit();
        });
        // 启动
        return this.getStarter()
          .run()
          .then(()=>{
              console.log("electron boot started");
          })
          .catch(err=>{
              console.log(err);
          })
    }
    /**
     * 停止
     */
    static async stop(){
        await this.starter.stop
        this.reset()
    }
    /**
     * 重置
     */
    static reset() {
        this.configured = false;
        this.starter = null;
    }
}