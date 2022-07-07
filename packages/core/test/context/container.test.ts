import {Component} from "../../src/decorator/component.decorator";
import {AutowiredContainer} from "../../src/context/container";
import {Autowired} from "../../src/decorator/autowired.decorator";
import {Scope} from "../../src/decorator/definition.decorator";
import {ScopeEnum} from "../../src/interface/decorator.interface";

export interface Animal {
    Say()
}

@Component()
@Scope(ScopeEnum.Singleton)
export class Cat implements Animal{
    Say() {
        console.log("喵喵喵")
    }
}

@Component()
@Scope(ScopeEnum.Singleton)
export class Dog implements Animal{
    Say() {
        console.log("汪汪汪")
    }
}

@Component()
@Scope(ScopeEnum.Singleton)
export class LogService {
    @Autowired()
    public cat:Cat
    @Autowired()
    public dog:Dog
}


const container = new AutowiredContainer()
container.bindClass(Cat)
container.bindClass(Dog)
container.bindClass(LogService)

const clazz = container.get<LogService>(LogService)
console.log(clazz.dog)
