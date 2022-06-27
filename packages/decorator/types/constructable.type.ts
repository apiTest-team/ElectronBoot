/**
 * 类定义的泛型类型，代表当前类是可以初始化的
 */
export type Constructable<T> = new (...args: any[]) => T;

/**
 * 抽象类定义的泛型类型
 * 描述了一个具有原型的新函数
 */
export type AbstractConstructable<T> = NewableFunction & { prototype: T };


