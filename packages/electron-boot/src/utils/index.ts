import { app } from "electron";

/**
 * 获取当前环境
 */
export const getCurrentEnvironment = ():string=>{
  return app.isPackaged ? "prod": "development"
}
/**
 * 判断是否时开发环境
 * @param env
 */
export const isDevelopmentEnvironment = (env:string)=>{
  return !app.isPackaged
}

/**
 * 获取配置信息
 * @param list
 * @param obj
 */
export function safelyGet(
  list: string | string[],
  obj?: Record<string, unknown>
): any {
  if (arguments.length === 1) {
    return (_obj: Record<string, unknown>) => safelyGet(list, _obj);
  }

  if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
    return void 0;
  }
  const pathArrValue = typeof list === 'string' ? list.split('.') : list;
  let willReturn: any = obj;

  for (const key of pathArrValue) {
    if (typeof willReturn === 'undefined' || willReturn === null) {
      return void 0;
    } else if (typeof willReturn !== 'object') {
      return void 0;
    }
    willReturn = willReturn[key];
  }

  return willReturn;
}