import { BrowserWindowConstructorOptions,BrowserWindow } from "electron"
import events from "events";
/**
 * 基础的window
 */
export abstract class BaseWindow extends events{
  // 窗口名称
  protected abstract name:string
  // 配置信息
  protected abstract conf:BrowserWindowConstructorOptions
  // 当前窗口实例
  protected windowsInstance:BrowserWindow|null = null
  // 当前窗体设计时电脑的宽度
  protected BASE_WIN_WIDTH = 1440;
  // 当前窗体设计时电脑的高度
  protected BASE_WIN_HEIGHT = 900;

}
