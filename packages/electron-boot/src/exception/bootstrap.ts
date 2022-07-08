import { BaseException, registerExceptionCode } from "@autowired/core";

export const ElectBootExceptionEnum = registerExceptionCode("electron-boot",{
  DUPLICATE_CLASS_NAME:200001,
  INVALID_CONFIG:20002
} as const)
/**
 * 类重复异常
 */
export class DuplicateClassNameException extends BaseException{
  constructor(className: string, existPath: string, existPathOther: string) {
    super(
      `"${className}" duplicated between "${existPath}" and "${existPathOther}"`,
      ElectBootExceptionEnum.DUPLICATE_CLASS_NAME
    );
  }
}

/**
 * 配置无效异常
 */
export class InvalidConfigException extends BaseException{
  constructor(message?: string) {
    super(
      'Invalid config file \n' + message,
      ElectBootExceptionEnum.INVALID_CONFIG
    );
  }
}