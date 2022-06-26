/**
 *
 */
export enum Scope{
    // 实例启动的时候时候去实例化
    SINGLETON,
    REQUEST
}

export interface InjectableMetadata<Type = unknown>{
    scope?:Scope
}