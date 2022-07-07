import {Component} from "../../src/decorator/component.decorator";
import {Autowired} from "../../src/decorator/autowired.decorator";
import {getPropertyAutowired} from "../../src/decorator/default.manager";

@Component()
class InjectChild {

}

class Autowired2 {

}


class Test {
    @Autowired()
    aa:any

    @Autowired()
    ee:InjectChild
}


let meta =  getPropertyAutowired(Test)
console.log(meta)