// 获取所有的value
export const ALL = 'common:all_value_key';

// common
export const CONFIGURATION_KEY = "common:configuration"
export const ASPECT_KEY = "common:aspect"
export const RUNTIME_KEY = "common:runtime"
export const AIR_BOOT_STARTER ="common:air_boot_starter"

// pipeline
export const PIPELINE_IDENTIFIER = '__pipeline_identifier__';

// runtime
export const CONFIG_KEY="config"

// framework
export const APPLICATION_CONTEXT_KEY = '__framework_application_context__';

/**
 * 类的元数据存储的key
 */
export const INJECT_CLASS_KEY_PREFIX:string = "INJECTION_CLASS_META_DATA"
/**
 * 类方法的元素数据存储key
 */
export const INJECT_CLASS_METHOD_KEY_PREFIX:string = "INJECTION_CLASS_METHOD_META_DATA"
/**
 * 对象definition属性
 */
export const OBJECT_DEF_CLS = "injection:object_definition_class"
/**
 * 加载之前注入的模块
 */
export const PRELOAD_MODULE_KEY = "INJECTION_PRELOAD_MODULE_KEY"
/**
 * 方法的元数据存储key
 */
export const INJECT_METHOD_KEY_PREFIX:string = "INJECTION_METHOD_META_DATA"
/**
 * 用于存储要注入的类
 */
export const TARGETED_CLASS:string = "injection:targeted_class"
/**
 * 自定义属性装饰器与解析器一起注入
 */
export const INJECT_CUSTOM_PROPERTY = 'inject_custom_property';
/**
 * 使用解析器注入自定义方法装饰器
 */
export const INJECT_CUSTOM_METHOD = 'inject_custom_method';
/**
 * 使用解析器注入自定义参数装饰器
 */
export const INJECT_CUSTOM_PARAM = 'inject_custom_param';
/**
 * 主模块存储key
 */
export const MAIN_MODULE_KEY = '__main__';
/**
 * 自动注入标签
 */
export const AUTOWIRED_TAG:string = "autowired";
