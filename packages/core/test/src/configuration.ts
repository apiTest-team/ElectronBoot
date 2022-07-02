
import { join } from 'path';
import { Configuration } from "../../decorator";

@Configuration({
  importConfigs: [
    join(__dirname, './config')
  ],
})
export class AutoConfiguration {
  async onReady() {
    console.log('ready');
  }
}
