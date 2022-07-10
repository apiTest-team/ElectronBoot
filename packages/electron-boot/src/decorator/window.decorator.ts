import { Component, saveModule, Scope, ScopeEnum } from "@autowired/core";
import { ELECTRON_BOOT_WINDOW } from "../constant";

/**
 * window的参数
 */
export interface WindowOptions{
    main:boolean
}

/**
 * 表明是一个窗口类
 * @constructor
 */
export const Window = (opts?:WindowOptions):ClassDecorator=>{
    return target => {
        // 保存到模块
        saveModule(ELECTRON_BOOT_WINDOW,{
            target:target,
            namespace:"main",
            ...opts
        })
        // 单例
        Scope(ScopeEnum.Singleton)(target)
        // 保存组件
        Component()(target)
    }
}