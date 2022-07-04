
import { join } from 'path';
import { Autowired, Configuration } from "../../src/decorator";
import { ConfigService } from "../../src/service/config.service";
import { Config } from "../../src/decorator/decorator/runtime";
import { ALL } from "../../src/decorator/constant";

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
})
export class AutoConfiguration {
  @Config(ALL)
  prepareConfig

  @Autowired()
  configService:ConfigService

  async onReady() {
    console.log(this.configService.getConfiguration());
    console.log(this.prepareConfig);
    console.log('ready');
  }
}
