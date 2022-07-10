import {BrowserWindowConstructorOptions, BrowserWindow, dialog, screen} from "electron"
import events from "events";
import { IBrowserWindow } from "../interface";
/**
 * 基础的window
 */
export abstract class BaseWindow extends events implements IBrowserWindow{
  // 窗口名称
  public abstract name:string
  // 默认配置信息
  protected defaultConf:BrowserWindowConstructorOptions={
    show: false,
    titleBarStyle: "default",
    focusable: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      scrollBounce: process.platform === 'darwin',
    }
  }
  // 配置信息
  protected  abstract conf:BrowserWindowConstructorOptions
  // 当前窗口实例
  protected windowsInstance:BrowserWindow|null = null
  // 当前窗体设计时电脑的宽度
  protected BASE_WIN_WIDTH = 1920;
  // 当前窗体设计时电脑的高度
  protected BASE_WIN_HEIGHT = 1080;
  // 设计宽度
  protected abstract DESIGN_MAIN_WIDTH:number
  // 设计高度
  protected abstract DESIGN_MAIN_HEIGHT:number
  // 让继承类去实现显示方法
  abstract run():void
  // 显示方法
  protected abstract onShow():void
  // url
  protected abstract url:string
  /**
   * 创建窗口方法
   * @private
   */
  protected createWindow(){
    const rect = screen.getPrimaryDisplay().bounds;
    this.conf.width = Math.ceil((rect.width / this.BASE_WIN_WIDTH) * this.DESIGN_MAIN_WIDTH);
    this.conf.height = Math.ceil((rect.height / this.BASE_WIN_HEIGHT) * this.DESIGN_MAIN_HEIGHT);
    this.windowsInstance = new BrowserWindow(this.conf)
    // 加载url
    this.windowsInstance.loadURL(this.url).then((r) => {})
    // 当前窗口事件监听
    this._initListener()
  }
  /**
   * 当前窗口事件监听
   * @private
   */
  protected _initListener() {
    console.log(this.windowsInstance)
    // 如果html加载完毕出现的事件
    this.windowsInstance?.once("ready-to-show", () => {
      this.onShow()
    });
    // 监听窗口关闭事件，防止内存泄漏
    this.windowsInstance?.on("close", () => {
      this.windowsInstance = null;
    });
    // 窗口触发了假死时执行
    this.windowsInstance?.on("unresponsive", () => {
      dialog
          .showMessageBox(this.windowsInstance as BrowserWindow, {
            type: "warning",
            title: "警告",
            buttons: ["重载", "退出"],
            message: "图形化进程失去响应，是否等待其恢复？",
            noLink: true
          })
          .then((res) => {
            if (res.response === 0) this.windowsInstance?.reload();
            else this.windowsInstance?.close();
          });
    });
  }
}
