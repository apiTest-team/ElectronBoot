import {BaseException, registerExceptionCode} from "./base";

export const CoreExceptionEnum = registerExceptionCode("autowired",{
    UNKNOWN:99999,
    COMMON:10000
} as const)

/**
 * 公共的异常
 */
export class AutowiredCommonException extends BaseException{
    constructor(msg:string) {
        super(msg,CoreExceptionEnum.COMMON);
    }
}