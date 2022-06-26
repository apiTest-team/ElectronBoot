import {InjectableOptions} from "../../interface/injectable-option.interface";
import {InjectableMetadata} from "../../interface/injectable-metadata.interface";

export function Injectable<T = unknown>(): Function;
export function Injectable<T = unknown>(options: InjectableOptions<T>): Function;
export function Injectable<T>(options: InjectableOptions<T> = {}): ClassDecorator {
    return targetConstructor => {
        const serviceMetadata: InjectableMetadata<T> = {
            id: options.id || targetConstructor,
            type: targetConstructor as unknown as Constructable<T>,
            factory: (options as any).factory || undefined,
            multiple: options.multiple || false,
            eager: options.eager || false,
            scope: options.scope || 'container',
            referencedBy: new Map().set(ContainerRegistry.defaultContainer.id, ContainerRegistry.defaultContainer),
            value: EMPTY_VALUE,
        };
    };
}