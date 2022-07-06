import {
  Component,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum
} from "@autowired/core";
import { IPC_KEY } from "../constant";

/**
 * 配置信息
 */
export interface IpcOptions {
  prefix?: string
  ipcOptions?:{

  }
}

/**
 * 表示这是一个ipcMain的事件监听
 * @param prefix 前缀
 * @param opts 参数信息
 * @constructor
 */
export const Ipc = (prefix = "/",opts?:IpcOptions):ClassDecorator => {
  return target => {
    saveModule(IPC_KEY,target)
    if (prefix){
      saveClassMetadata(
        IPC_KEY,
        {
          prefix:prefix,
          ipcOptions:{

          }
        } as IpcOptions,
        target
      )
    }
    Component()(target)
    Scope(ScopeEnum.Singleton)
  }
}

