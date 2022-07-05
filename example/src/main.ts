import "reflect-metadata"
import {Autowired, AutowiredApplication, AutowiredBootApplication, ConfigService} from "@autowired/core"

@AutowiredBootApplication()
export class DemoApplication {

  @Autowired()
  public configService: ConfigService | undefined

  public static main(...args:string[]) {
    AutowiredApplication.run(DemoApplication,args)
  }

  async onReady(){
    console.log(this.configService?.getConfiguration())
  }
}