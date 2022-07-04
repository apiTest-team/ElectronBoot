import { AirApplication} from "../../boot/bootstrap";
import { AirBootApplication } from "../../decorator/decorator/common/bootstrap.decorator";



import * as extra from "./extra"
import * as defaultConfig from "./config/config.default"
import * as unittestConfig from "./config/config.unittest"

@AirBootApplication({
  bootstrapOptions:{
    imports:extra,
    moduleDetector:false
  },
  configurationOptions:{
    importConfigs:{
      default:defaultConfig,
      unittest:unittestConfig,
    }
  }
})
export class TestApplication {
  public static main(...args:string[]){
    AirApplication.run(TestApplication,args)
  }
}