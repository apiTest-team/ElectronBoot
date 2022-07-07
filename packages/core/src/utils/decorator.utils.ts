

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