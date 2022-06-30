/**
 * 组件信息
 */
export interface ComponentInfoInterface {
    component: any;
    enabledEnvironment?: string[];
}

/**
 * 注入的配置信息
 */
export interface InjectionConfigurationOptions {
    imports?: Array<string | ComponentInfoInterface | { Configuration: any }>;
    importObjects?: Record<string, unknown>;
    importConfigs?:
        | Array<{ [environmentName: string]: Record<string, any> }>
        | Record<string, any>;
    namespace?: string;
    detectorOptions?: Record<string, any>;
    /**
     * @deprecated
     */
    conflictCheck?: boolean;
}