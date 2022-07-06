import {AutowiredContainerInterface} from "./containerInterface";

/**
 * 文件扫描器
 */
export interface FileDetectorInterface {
    run(container: AutowiredContainerInterface, fileDetectorOptions?: Record<string, any>);
    setExtraDetectorOptions(detectorOptions: Record<string, any>);
}