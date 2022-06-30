import {ContainerInterface} from "./container.interface";

export interface FileDetectorInterface {
    run(container: ContainerInterface, fileDetectorOptions?: Record<string, any>);
    setExtraDetectorOptions(detectorOptions: Record<string, any>);
}