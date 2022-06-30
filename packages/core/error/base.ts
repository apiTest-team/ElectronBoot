/**
 * 错误参数
 */
interface ErrorOption {
    cause?: Error;
    status?: number;
    module?:string
}

interface Convertable {
    [key: string]: string | number;
}

/**
 * 转换string
 */
type ConvertString<T extends Convertable, Group extends string> = {
    [P in keyof T]: P extends string
        ? T[P] extends number
            ? `${Uppercase<Group>}_${T[P]}`
            : never
        : never;
};

const codeGroup = new Set();
/**
 * 注册错误分组，并返回Convertable类型
 * @param errorGroup 错误分组
 * @param errorCodeMapping 错误码映射map
 */
export function registerErrorCode<T extends Convertable, G extends string>(
    errorGroup: G,
    errorCodeMapping: T
): ConvertString<T, G> {
    if (codeGroup.has(errorGroup)) {
        throw new BaseError(
            `Error group ${errorGroup} is duplicated, please check before adding.`
        );
    } else {
        codeGroup.add(errorGroup);
    }
    const newCodeEnum = {} as Convertable;
    // ERROR => GROUP_10000
    for (const errKey in errorCodeMapping) {
        newCodeEnum[errKey as string] =
            errorGroup.toUpperCase() +
            '_' +
            String(errorCodeMapping[errKey]).toUpperCase();
    }
    return newCodeEnum as ConvertString<T, G>;
}

/**
 * 基本错误信息
 */
export class BaseError extends Error{
    code:string|number
    module:string
    cause:Error
    constructor(message: string, code?: string|number, opts?: ErrorOption) {
        super(message)
        if (!code && typeof code==="object"){
            opts = code
            code = "base_99999"
        }
        this.name = this.constructor.name
        this.code = code
        this.cause = opts?.cause
        this.module = opts?.module || "framework"
    }
}