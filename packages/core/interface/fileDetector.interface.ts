import {ContainerInterface} from "./container.interface";

/**
 * 文件扫描器
 */
export interface FileDetectorInterface {
    run(container: ContainerInterface, fileDetectorOptions?: Record<string, any>);
    setExtraDetectorOptions(detectorOptions: Record<string, any>);
}