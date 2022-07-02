import {AirContainerInterface} from "./containerInterface";

/**
 * 文件扫描器
 */
export interface FileDetectorInterface {
    run(container: AirContainerInterface, fileDetectorOptions?: Record<string, any>);
    setExtraDetectorOptions(detectorOptions: Record<string, any>);
}