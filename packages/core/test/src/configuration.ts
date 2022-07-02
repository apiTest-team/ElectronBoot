
import { join } from 'path';
import { Autowired, Configuration } from "../../decorator";
import { ConfigService } from "../../service/config.service";
import { Config } from "../../decorator/decorator/runtime";
import { ALL } from "../../decorator/constant";

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
