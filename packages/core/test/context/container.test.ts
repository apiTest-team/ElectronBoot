import {Component} from "../../src";
import {AutowiredContainer} from "../../src";
import {Autowired} from "../../src";
import {Scope} from "../../src";
import {ScopeEnum} from "../../src";

export interface Animal {
    Say():any
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
    public cat: Cat | undefined
    @Autowired()
    public dog: Dog | undefined
}


const container = new AutowiredContainer()
container.bindClass(Cat)
container.bindClass(Dog)
container.bindClass(LogService)

const clazz = container.get<LogService>(LogService)
console.log(clazz.dog)
