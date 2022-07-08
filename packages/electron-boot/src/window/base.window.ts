import { BrowserWindowConstructorOptions,BrowserWindow } from "electron"
import events from "events";
import { IBrowserWindow } from "../interface/window.interface";
/**
 * 基础的window
 */
export abstract class BaseWindow extends events implements IBrowserWindow{
  // 窗口名称
  public name:string = "baseWindow"
  // 配置信息
  protected conf:BrowserWindowConstructorOptions={}
  // 当前窗口实例
  protected windowsInstance:BrowserWindow|null = null
  // 当前窗体设计时电脑的宽度
  protected BASE_WIN_WIDTH = 1440;
  // 当前窗体设计时电脑的高度
  protected BASE_WIN_HEIGHT = 900;
  // 让继承类去实现
  abstract show()
}
