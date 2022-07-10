import {Action, Ipc} from "../src";
import {AutowiredContainer} from "@autowired/core";
import {IpcService} from "../src/service/ipc.service";


@Ipc("/main/")
export class IpcTest1 {
    @Action("/login")
    public open(){

    }
}

@Ipc("/user/")
export class IpcTest2 {
    @Action("/test")
    public close(){

    }
}

const container = new AutowiredContainer()
container.bindClass(IpcService)

container.getAsync(IpcService).then((ipcService)=>{

})