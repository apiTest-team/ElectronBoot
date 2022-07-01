import {join} from "path"
import { initializeGlobalApplicationContext } from "../boot/setup";
import { ConfigService } from "../service/config.service";
describe("/test/setup.test.ts", function() {
  it("should test setup and config", async function() {
      const baseDir = join(__dirname,"./fixtures/base-app-config/src")
    const container = await initializeGlobalApplicationContext({
      baseDir,
      configurationModule:[require(join(baseDir,"configuration"))]
    })
    const configService = await container.getAsync(ConfigService)
    const config =  configService.getConfiguration()
    console.log(config);
  });
});