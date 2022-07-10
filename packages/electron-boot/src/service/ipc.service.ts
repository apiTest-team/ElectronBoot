import {
    Component,
    getClassMetadata,
    getComponentName,
    listModule,
    Scope,
    ScopeEnum
} from "@autowired/core";
import {IPC_ACTION, IPC_CONTROLLER} from "../constant";
import {ControllerOption} from "../decorator";

@Component()
@Scope(ScopeEnum.Singleton)
export class IpcService {
    // 是否准备就绪
    private isReady = false
    // 存储ipc回调
    private _ListenMap = new Map()

    // 异步初始化
    private async analyze(){
        // 获取所有的ipc模块
        const ipcModules = listModule(IPC_CONTROLLER)
        for (const ipcModule of ipcModules) {
            // 获取控制器信息
            const controllers:ControllerOption = getClassMetadata(
                IPC_CONTROLLER,
                ipcModule
            )
            // 获取action信息
            const actions:ControllerOption =   getClassMetadata(
                IPC_ACTION,
                ipcModule
            )

            const controllerId = getComponentName(ipcModule)

            console.log(controllerId,controllers,actions)
        }
    }
}