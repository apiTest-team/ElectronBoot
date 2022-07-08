import { Component, saveModule, Scope, ScopeEnum } from "@autowired/core";
import { ELECTRON_BOOT_IPC } from "../constant/bootstrap.constant";

export interface IpcOptions {
    
}
/**
 * 表明是一个Ipc通道类
 * @constructor
 */
export const Ipc = (opts?:IpcOptions):ClassDecorator=>{
    return target => {
        saveModule(ELECTRON_BOOT_IPC,target)

        Scope(ScopeEnum.Singleton)(target)
        Component()(target)
    }
}