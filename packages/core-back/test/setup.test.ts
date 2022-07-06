import {join} from "path"
import { initializeGlobalApplicationContext } from "../src/boot/setup";
import { ConfigService } from "../src/service/config.service";
describe("/test/boot.test.ts", function() {
  it("should test boot and config", async function() {
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