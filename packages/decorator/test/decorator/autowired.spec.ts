import {Component} from "../../decorator";
import {Autowired} from "../../decorator/common/autowired.decorator";

@Component()
class MainWindow {

}

class MainApp {
    @Autowired()
    MainWin: MainWindow
}


describe('Autowired decorator', function () {
    it('should inject show be ok', function () {
        let meta = getPropertyInject(Test);
    });
});