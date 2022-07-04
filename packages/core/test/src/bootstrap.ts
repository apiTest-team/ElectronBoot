import { AirApplication} from "../../src/boot/bootstrap";
import { AirBootApplication } from "../../src/decorator/decorator/common/bootstrap.decorator";
import { Autowired } from "../../src/decorator";
import { ConfigService } from "../../src/service/config.service";
import { Config } from "../../src/decorator/decorator/runtime";
import { ALL } from "../../src/decorator/constant";



import * as extra from "./extra"
import * as defaultConfig from "./config/config.default"
import * as unittestConfig from "./config/config.unittest"
import { RemoteConfigService } from "./extra";

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
  @Config(ALL)
  prepareConfig
  @Autowired()
  configService:ConfigService
  @Autowired()
  remoteConfig:RemoteConfigService
  public static main(...args:string[]){
    AirApplication.run(TestApplication,args)
  }
  async onReady() {
    console.log(this.configService.getConfiguration());
    console.log(this.prepareConfig);
    console.log(this.remoteConfig);
    console.log('ready');
  }
}