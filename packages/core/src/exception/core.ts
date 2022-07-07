import {BaseException, registerExceptionCode} from "./base";
import {ObjectIdentifier} from "../types/decorator.types";

export const CoreExceptionEnum = registerExceptionCode("autowired",{
    UNKNOWN:99999,
    COMMON:10000,
    MISSING_RESOLVER:10001,
    DEFINITION_NOT_FOUND:10002,
    SINGLETON_INJECT_TEMP:10003,
} as const)

/**
 * 公共的异常
 */
export class AutowiredCommonException extends BaseException{
    constructor(msg:string) {
        super(msg,CoreExceptionEnum.COMMON);
    }
}

/**
 * 解析程序缺少异常
 */
export class ResolverMissingException extends BaseException {
    constructor(type: string) {
        super(
            `${type} resolver is not exists!`,
            CoreExceptionEnum.MISSING_RESOLVER
        );
    }
}

/**
 * 没找到定义异常
 */
export class DefinitionNotFoundException extends BaseException {
    static readonly type = Symbol.for('#NotFoundError');
    static isClosePrototypeOf(ins: DefinitionNotFoundException): boolean {
        return ins
            ? ins[DefinitionNotFoundException.type] ===
            DefinitionNotFoundException.type
            : false;
    }
    constructor(identifier: ObjectIdentifier) {
        super(
            `${identifier.toString()} is not valid in current context`,
            CoreExceptionEnum.DEFINITION_NOT_FOUND
        );
        this[DefinitionNotFoundException.type] =
            DefinitionNotFoundException.type;
    }
    updateErrorMsg(className: string): void {
        const identifier = this.message.split(
            ' is not valid in current context'
        )[0];
        this.message = `${identifier} in class ${className} is not valid in current context`;
    }
}

/**
 * 注入temp单例异常
 */
export class SingletonInjectTempException extends BaseException {
    constructor(singletonScopeName: string, requestScopeName: string) {
        const text = `${singletonScopeName} with singleton scope can't implicitly inject ${requestScopeName} with temp scope directly, please add "@Scope(ScopeEnum.Temp, { allowDowngrade: true })" in ${requestScopeName} or use "ctx.tempContext.getAsync(${requestScopeName})".`;
        super(text, CoreExceptionEnum.SINGLETON_INJECT_TEMP);
    }
}