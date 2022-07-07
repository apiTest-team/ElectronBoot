import { TSDesignType } from "../types/decorator.types";


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
 * 判断变量是否是undefined
 * @param value
 */
export const isUndefined = (value) => {
  return value === undefined;
}

/**
 * 判断变量是否时null
 * @param value
 */
export const isNull =(value) =>{
  return value === null;
}

/**
 * 判断变量是否为null或者undefined
 * @param value
 */
export function isNullOrUndefined(value) {
  return isUndefined(value) || isNull(value);
}

/**
 * 生成uuid的方法
 */
export const randomUUID = ():string => {
  const random: (multiplier: number) => number = (multiplier: number) => {
    return Math.floor(Math.random() * multiplier);
  };

  const hexadecimal: (index: number) => string = (index: number) => {
    return ((index === 19) ? random(4) + 8 : random(16)).toString(16);
  };

  const nextToken: (index: number) => string = (index: number) => {
    if (index === 8 || index === 13 || index === 18 || index === 23) {
      return "-";
    } else if (index === 14) {
      return "4";
    } else {
      return hexadecimal(index);
    }
  };

  const generate: () => string = () => {
    let uuid: string = "";

    while ((uuid.length) < 36) {
      uuid += nextToken(uuid.length);
    }
    return uuid;
  };

  return generate();
}

/**
 * 对象合并
 * @param target
 * @param src
 */
export const merge =(target: any, src: any) => {
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
 * 转换类型定义
 * @param designFn
 */
export const transformTypeFromTSDesign = (designFn): TSDesignType => {

  if (isNullOrUndefined(designFn)) {
    return { name: 'undefined', isBaseType: true, originDesign: designFn };
  }
  switch (designFn.name) {
    case 'String':
      return { name: 'string', isBaseType: true, originDesign: designFn };
    case 'Number':
      return { name: 'number', isBaseType: true, originDesign: designFn };
    case 'Boolean':
      return { name: 'boolean', isBaseType: true, originDesign: designFn };
    case 'Symbol':
      return { name: 'symbol', isBaseType: true, originDesign: designFn };
    case 'Object':
      return { name: 'object', isBaseType: true, originDesign: designFn };
    case 'Function':
      return { name: 'function', isBaseType: true, originDesign: designFn };
    default:
      return {
        name: designFn.name,
        isBaseType: false,
        originDesign: designFn,
      };
  }
}