export interface BootstrapOptions {
    [customPropertyKey: string]: any;
    // 单例
    single?:boolean
    // js执行路径
    baseDir?:string
}