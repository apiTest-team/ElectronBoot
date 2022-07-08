
import {Component, isFunction, saveClassMetadata, Scope, ScopeEnum} from "@autowired/core";
import { BootstrapOptions } from "../boot/options";
import {ELECTRON_BOOT_STARTER} from "../constant/bootstrap.constant";

/**
 * 自动启动装饰器
 * @param opts
 * @constructor
 */
export const ElectronBootApplication = (opts?:BootstrapOptions):ClassDecorator=>{
    return target => {
        // 组件装饰器
        Component()(target)
        // 单例
        Scope(ScopeEnum.Singleton)(target)
        // 保存元数据
        saveClassMetadata(ELECTRON_BOOT_STARTER,opts,target)
        // 启动
        target["main"] && isFunction(target["main"]) && target["main"](process.argv.splice(2))
    }
}