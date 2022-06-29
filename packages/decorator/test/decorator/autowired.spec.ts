import {Component} from "../../decorator";
import {Autowired} from "../../decorator/common/autowired.decorator";
import {getPropertyAutowired} from "../../manager";

@Component()
class MainWindow {

}

class MainApp {
    @Autowired()
    MainWin: MainWindow
}


describe('Autowired decorator', function () {
    it('should inject show be ok', function () {
        let meta = getPropertyAutowired(Test);
    });
});