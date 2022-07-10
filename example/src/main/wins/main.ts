import {BaseWindow, Window} from "@autowired/electron-boot";
import {app, BrowserWindow, BrowserWindowConstructorOptions, dialog} from "electron";
import {release} from "os";
import {AutowiredContainer} from "@autowired/core";
import {join} from "path";

@Window({
    main:true
})
export class MainWindow extends BaseWindow{
    // 窗口名称
    name: string = "mainWindow";
    // 设计宽度
    protected DESIGN_MAIN_WIDTH: number= 1300;
    // 设计高度
    protected DESIGN_MAIN_HEIGHT: number = 850;
    // 配置信息
    protected conf = Object.assign({},this.defaultConf,{
        show:true
    } as BrowserWindowConstructorOptions)
    // 构造函数
    constructor(readonly applicationContext:AutowiredContainer) {
        super();
    }
    // 运行方法
    run(): void {
        this.configureApp()
    }
    /**
     * 配置app
     * @private
     */
    private configureApp (){

        // 保证项目单实例运行
        if (!app.requestSingleInstanceLock()) {
            app.quit();
            process.exit(0);
        }

        // 禁用Windows 7的GPU加速
        if (release().startsWith("6.1")) app.disableHardwareAcceleration();

        // 设置Windows 10+通知的应用程序名称
        if (process.platform === "win32") app.setAppUserModelId(app.getName());

        // 禁止安全警告
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

        // 由于9.x版本问题，需要加入该配置关闭跨域问题
        app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

        // app准备完毕
        app.whenReady().then(()=>{
            // 创建窗口
            this.createWindow()
        })

        // 所有的窗口关闭事件
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        })

        // 窗口活动事件监听
        app.on('activate', () => {
            const allWindows = BrowserWindow.getAllWindows()
            if (allWindows.length) {
                allWindows[0].focus()
            } else {
                this.createWindow()
            }
        })

        // 当确定渲染进程卡死时，分类型进行告警操作
        app.on("render-process-gone", (event, webContents, details) => {
            const message = {
                title: "",
                buttons: [] as Array<string>,
                message: ""
            };
            switch (details.reason) {
                case "crashed":
                    message.title = "警告";
                    message.buttons = ["确定", "退出"];
                    message.message = "图形化进程崩溃，是否进行软重启操作？";
                    break;
                case "killed":
                    message.title = "警告";
                    message.buttons = ["确定", "退出"];
                    message.message = "由于未知原因导致图形化进程被终止，是否进行软重启操作？";
                    break;
                case "oom":
                    message.title = "警告";
                    message.buttons = ["确定", "退出"];
                    message.message = "内存不足，是否软重启释放内存？";
                    break;

                default:
                    break;
            }
            dialog
                .showMessageBox(this.windowsInstance as BrowserWindow, {
                    type: "warning",
                    title: message.title,
                    buttons: message.buttons,
                    message: message.message,
                    noLink: true
                })
                .then((res) => {
                    if (res.response === 0) this.windowsInstance?.reload();
                    else this.windowsInstance?.close();
                });
        });
        /**
         * 新的gpu崩溃检测，详细参数详见：http://www.electronjs.org/docs/api/app
         * @returns void
         * @author zmr (umbrella22)
         * @date 2020-11-27
         */
        app.on("child-process-gone", (event, details) => {
            const message = {
                title: "",
                buttons: [] as Array<string>,
                message: ""
            };
            switch (details.type) {
                case "GPU":
                    switch (details.reason) {
                        case "crashed":
                            message.title = "警告";
                            message.buttons = ["确定", "退出"];
                            message.message = "硬件加速进程已崩溃，是否关闭硬件加速并重启？";
                            break;
                        case "killed":
                            message.title = "警告";
                            message.buttons = ["确定", "退出"];
                            message.message = "硬件加速进程被意外终止，是否关闭硬件加速并重启？";
                            break;
                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }
            dialog
                .showMessageBox(this.windowsInstance as BrowserWindow, {
                    type: "warning",
                    title: message.title,
                    buttons: message.buttons,
                    message: message.message,
                    noLink: true
                })
                .then((res) => {
                    // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
                    if (res.response === 0) {
                        if (details.type === "GPU") app.disableHardwareAcceleration();
                        this.windowsInstance?.reload();
                    } else {
                        this.windowsInstance?.close();
                    }
                });
        });
    }

    /**
     * 页面地址
     * @protected
     */
    protected get url(): string{
        if (app.isPackaged){
            const url = new URL("file://")
            url.pathname = join(__dirname, '..', 'renderer', 'index.html')
            return url.href
        }else{
            return `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`
        }
    }

    /**
     * 窗口页面加载完毕回调
     * @protected
     */
    protected onShow(): void {
        console.log("进来了")
        this.windowsInstance?.show()
    }
}