import {attachClassMetadata, Component, saveClassMetadata, saveModule, Scope, ScopeEnum} from "@autowired/core";
import {IPC_ACTION, IPC_CONTROLLER} from "../constant";

/**
 * ipc前缀
 */
export interface ControllerOption {
    // 前缀
    prefix?:string
    ipcOptions:{
        sensitive?:boolean
        tagName?: string;
        description?: string;
        ignoreGlobalPrefix?:boolean
    }
}

/**
 * ipc信息
 */
export interface IpcOptions {
    path?:string
    ipcName?:string
    method?:string
    description?: string;
    sensitive?:boolean
}

/**
 * 表明是一个Ipc通道类
 * @constructor
 */
export const Ipc = (prefix:string="/",ipcOptions:{
    sensitive?:boolean
    tagName?:string
    method?:string,
    description?: string;
}={
    sensitive:true
}):ClassDecorator=>{
    return target => {
        saveModule(IPC_CONTROLLER,target)
        if (prefix){
            saveClassMetadata(
                IPC_CONTROLLER,
                {
                    prefix:prefix,
                    ipcOptions
                } as ControllerOption,
                target
            )
        }
        Scope(ScopeEnum.Singleton)(target)
        Component()(target)
    }
}

/**
 * ipc的方法装饰器
 * @constructor
 */
export const Action = (path?:string,ipcOptions:{
    sensitive?:boolean
    tagName?:string
    method?:string,
    description?: string;
}={
    sensitive:true
}):MethodDecorator=>{
    return (target, propertyKey, descriptor) => {
        attachClassMetadata(
            IPC_ACTION,
            Object.assign(ipcOptions,{
                path:path || "/",
                method:propertyKey,
                description:ipcOptions?.description||""
            })  as IpcOptions,
            target
        )
        return descriptor
    }
}