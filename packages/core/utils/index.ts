import { randomUUID } from "./uuid";
import util from "util";
import { basename, dirname, resolve, sep } from "path";
import { readFileSync } from "fs";
import {app} from "electron";
import * as process from "process";

export * from "./camelCase"
export * from "./uuid"

const ToString = Function.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

/**
 * 获取指定对象的内容
 * @param fn
 */
function fnBody(fn) {
    return ToString.call(fn)
        .replace(/^[^{]*{\s*/, '')
        .replace(/\s*}[^}]*$/, '');
}

/**
 * 判断是否时正则
 * @param value
 */
export const isRegExp = (value) => {
    return util.types.isRegExp(value);
}

/**
 * 判断指定对象是否时类
 * @param fn 指定对象
 * @constructor
 */
export const isClass = (fn: any) => {
    if (typeof fn !== 'function') {
        return false;
    }

    if (/^class[\s{]/.test(ToString.call(fn))) {
        return true;
    }

    // babel.js classCallCheck() & inlined
    const body = fnBody(fn);
    return (
        /classCallCheck\(/.test(body) ||
        /TypeError\("Cannot call a class as a function"\)/.test(body)
    );
}

/**
 * 判断指定对象是否时
 * @param value
 */
export const isFunction = (value:any) =>{
    return typeof value === 'function'
}

/**
 * 获取当前环境变量
 */
export const getCurrentEnvironment = () => {
    return app?.isPackaged ? "prod": process.env.NODE_ENV || "prod"
}

/**
 * 判断是否时开发环境
 * @param env
 */
export const isDevelopmentEnvironment = env => {
    return ['local', 'test', 'unittest'].includes(env);
}

/**
 * 获取配置文件的环境变量
 * @param configFilePath
 */
export const getConfigEnv = (configFilePath) =>{
    // parse env
    const configFileBaseName = basename(configFilePath);
    const splits = configFileBaseName.split('.');
    const suffix = splits.pop();
    if (suffix !== "ts" && suffix !== "js" && suffix!=="jsx") {
        return suffix;
    }
    return splits.pop();
}

/**
 * @param p
 * @param enabledCache
 */
export const safeRequire = (p, enabledCache = true) => {
    if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
        p = resolve(dirname(module.parent.filename), p);
    }
    try {
        if (enabledCache) {
            return require(p);
        } else {
            const content = readFileSync(p, {
                encoding: 'utf-8',
            });
            return JSON.parse(content);
        }
    } catch (err) {
        return undefined;
    }
};

/**
 * 判断指定value是否时undefined
 * @param value
 */
export function isUndefined(value) {
    return value === undefined;
}

/**
 * 判断指定值是否时null
 * @param value
 */
export function isNull(value) {
    return value === null;
}

/**
 * 判断指定value是否是undefined或者null
 * @param value
 */
export function isNullOrUndefined(value) {
    return isUndefined(value) || isNull(value);
}

/**
 * 对象合并
 * @param target 目标对象
 * @param src 源对象
 */
export function merge(target: any, src: any) {
    if (!target) {
        target = src;
        src = null;
    }
    if (!target) {
        return null;
    }
    if (Array.isArray(target)) {
        return target.concat(src || []);
    }
    if (typeof target === 'object') {
        return Object.assign({}, target, src);
    }
    throw new Error('can not merge meta that type of ' + typeof target);
}

/**
 * 判断是否时纯对象
 * @param obj
 */
export const isPlainObject =  (obj) =>{
    if (!obj || toStr.call(obj) !== '[object Object]') {
        return false;
    }

    const hasOwnConstructor = hasOwn.call(obj, 'constructor');
    const hasIsPrototypeOf =
      obj.constructor &&
      obj.constructor.prototype &&
      hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    let key;
    for (key in obj) {
        /**/
    }

    return typeof key === 'undefined' || hasOwn.call(obj, key);
}

/**
 * 从对象里获取指定key的变量
 * @param list
 * @param obj
 */
export const safelyGet =  function(list: string | string[], obj?: Record<string, unknown>): any  {
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

/**
 * 是否时异步方法
 * @param value
 */
export function isAsyncFunction(value) {
    return util.types.isAsyncFunction(value);
}

/**
 * 判断是否时create工厂
 * @param value
 */
export function isGeneratorFunction(value) {
    return util.types.isGeneratorFunction(value);
}

/**
 * 判断是否是异步函数
 * @param value
 */
export function isPromise(value) {
    return util.types.isPromise(value);
}

export const Types = {
    isClass,
    isFunction,
    isRegExp,
    isPlainObject,
    isAsyncFunction,
    isGeneratorFunction,
    isPromise
}

export const Utils = {
    randomUUID,
}