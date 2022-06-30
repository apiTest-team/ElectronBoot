import {ElectronBootError, registerErrorCode} from "./base";

/**
 * 定义框架错误
 */
export const FrameworkErrorEnum = registerErrorCode("core",{
    UNKNOWN:99999,
    COMMON:10000,
    MISSING_RESOLVER:10001,
    INCONSISTENT_VERSION:10002,
    MISSING_IMPORTS:10003
})

/**
 * 解析错误
 */
export class FrameworkResolverMissingError extends ElectronBootError{
    constructor(type: string) {
        super(
            `${type} resolver is not exists!`,
            FrameworkErrorEnum.MISSING_RESOLVER
        );
    }
}

/**
 * 导入组件错误
 */
export class FrameworkMissingImportComponentError extends ElectronBootError {
    constructor(originName: string) {
        const text = `"${originName}" can't inject and maybe forgot add "{imports: [***]}" in @Configuration.`;
        super(text, FrameworkErrorEnum.MISSING_IMPORTS);
    }
}

/**
 * 导入的信息不一致
 */
export class FrameworkInconsistentVersionError extends ElectronBootError {
    constructor() {
        const text =
            'We find a latest dependency package installed, please remove the lock file and use "npm update" to upgrade all dependencies first.';
        super(text, FrameworkErrorEnum.INCONSISTENT_VERSION);
    }
}