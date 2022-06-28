import { ProvideMetadata, ProvideOption } from "../../interface/provide.interface";
import { Constructable } from "../../types/constructable.type";

export function Provide():Function
export function Provide<T = unknown>(options:ProvideOption<T>):Function
export function Provide<T>(options:any = {}):ClassDecorator{
  return target => {
    const provideMetadata: ProvideMetadata<T> = {
      Value: undefined, factory: undefined,
      id:options.id || target,
      type: target as unknown  as Constructable<T>

    }
    console.log("进来了");
    console.log(provideMetadata);
  }
}