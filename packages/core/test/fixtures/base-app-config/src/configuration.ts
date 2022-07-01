
import { join } from 'path';
import { Configuration } from "../../../../context/decorator";

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
