import {InjectableMetadata} from "./injectable-metadata.interface";

export type InjectableOptions<T = unknown> =
    | Omit<Partial<InjectableMetadata<T>>, 'referencedBy' | 'type' | 'factory'>
    | Omit<Partial<InjectableMetadata<T>>, 'referencedBy' | 'value' | 'factory'>
    | Omit<Partial<InjectableMetadata<T>>, 'referencedBy' | 'value' | 'type'>;
