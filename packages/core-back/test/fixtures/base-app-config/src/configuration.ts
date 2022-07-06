
import { join } from 'path';
import { Configuration } from "../../../../src/decorator";

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
