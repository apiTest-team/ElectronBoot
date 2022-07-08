import util from "util";

const ToString = Function.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

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
 * 是否是正则
 * @param value
 */
export function isRegExp(value) {
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
 * 判断是否是方法
 * @param value
 */
export function isFunction(value) {
  return typeof value === 'function';
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
 * 类型相关内容
 */
export const Types = {
  isClass,
  isRegExp,
  isPromise,
  isFunction,
  isPlainObject,
  isAsyncFunction,
  isGeneratorFunction
}