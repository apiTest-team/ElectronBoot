import { AirApplication} from "../boot/bootstrap";
import { AirBootApplication } from "../decorator/decorator/common/bootstrap.decorator";

@AirBootApplication({
  bootstrapOptions:{
    imports:["configuration"]
  }
})
export class TestApplication {
  public static main(...args:string[]){
    AirApplication.run(TestApplication,args)
  }
}