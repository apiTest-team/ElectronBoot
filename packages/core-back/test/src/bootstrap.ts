import { AutowiredApplication} from "../../src";
import { AutowiredBootApplication } from "../../src";
import { Autowired } from "../../src";
import { ConfigService } from "../../src";
import { Config } from "../../src";
import { ALL } from "../../src";



import * as extra from "./extra"
import * as defaultConfig from "./config/config.default"
import * as unittestConfig from "./config/config.unittest"
import { RemoteConfigService } from "./extra";

@AutowiredBootApplication({
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
    AutowiredApplication.run(TestApplication,args)
  }
  async onReady() {
    console.log(this.configService.getConfiguration());
    console.log(this.prepareConfig);
    console.log(this.remoteConfig);
    console.log('ready');
  }
}