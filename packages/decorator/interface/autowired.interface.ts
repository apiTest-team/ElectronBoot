import {ObjectIdentifier} from "./class.interface";
export type GroupModeType = 'one' | 'multi';
/**
 * 自动注入的类型枚举
 */
export enum AutowiredModeEnum {
    Identifier = 'Identifier',
    Class = 'Class',
    PropertyName = 'PropertyName',
}

/**
 * 属性类型
 */
export interface TSDesignType {
    name: string;
    originDesign: any;
    isBaseType: boolean;
}
/**
 * Autowired 的参数信息
 */
export interface AutowiredOptions {
    /**
     * 类标识
     */
    identifier?:ObjectIdentifier
    /**
     * 要注入属性的类
     */
    target:Object
    /**
     * 属性名称
     */
    targetKey:string|symbol
    /**
     * 参数
     */
    args?:any
}

/**
 * 指定类的属性元数据
 */
export interface TargetPropsMetadata {
    key: string | number | symbol;
    value: any;
    args?: any;
}

/**
 * 类的所有属性元数据
 */
export interface ClassPropsMetadata {
    [methodName: string]: TargetPropsMetadata;
}