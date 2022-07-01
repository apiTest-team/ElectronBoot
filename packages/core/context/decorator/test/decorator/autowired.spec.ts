import "reflect-metadata"
import {Component} from "../../decorator/common/component.decorator";
import {Autowired} from "../../decorator/common/autowired.decorator";
import {getPropertyAutowired} from "../../manager/default.manager";

@Component()
class MainWindow {

}

@Component()
class SettingWindow {
    
}

class MainApp {
    @Autowired()
    mainWin: MainWindow
    @Autowired()
    settingWin:SettingWindow
}

describe('Autowired decorator', function () {
    it('should inject show be ok', function () {
        const meta = getPropertyAutowired(MainApp);
        console.log(meta);
    });
});