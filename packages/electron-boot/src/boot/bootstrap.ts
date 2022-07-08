import { IAutowiredContainer,getClassMetadata } from "@autowired/core";
import {ELECTRON_BOOT_STARTER} from "../constant/bootstrap.constant";
import {BootstrapOptions} from "./options";

/**
 * 默认的参数信息
 */
export const defaultOptions:BootstrapOptions =  {
    single:true
}
/**
 * electron应用
 */
export class ElectronApplication {
    private static configured=false
    private globalConfig:BootstrapOptions
    private static applicationContext:IAutowiredContainer

    /**
     * 配置信息
     * @param configuration
     * @private
     */
    private static configure(configuration:BootstrapOptions={}){
        this.configured = true
    }

    /**
     * 启动方法
     * @param target
     * @param args
     */
    public static run(target:any,...args:string[]){
        // 获取配置信息
        const options = getClassMetadata(ELECTRON_BOOT_STARTER,target)
        if (!this.configured){
            this.configure(options)
        }

    }
}