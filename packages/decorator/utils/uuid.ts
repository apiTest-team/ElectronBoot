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