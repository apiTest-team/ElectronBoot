import { Window } from "../src/decorator/window.decorator";
import { BaseWindow } from "../src/window/base.window";
import { BrowserWindowConstructorOptions } from "electron"
import { AutowiredContainer, Init } from "@autowired/core";
import { WindowService } from "../src/service/window.service";

@Window({
  main:true
})
export class MainWindow extends BaseWindow{
  public name: string = "mainWindow";
  protected conf:BrowserWindowConstructorOptions = {}

  @Init()
  protected init(){
    console.log("进来了");
  }

  run(): void {
    console.log("我进来了")
  }
}


const context = new AutowiredContainer()
context.bindClass(MainWindow)
context.bindClass(WindowService)

const service = context.get(WindowService,[context])
const window = service.getMainWindow()
console.log(window);


