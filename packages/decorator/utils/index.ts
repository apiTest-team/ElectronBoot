import { randomUUID } from "./uuid";

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
    return typeof value === 'function';
}

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

export const Types = {
    isClass,
    isFunction
}

export const Utils = {
    randomUUID,
}