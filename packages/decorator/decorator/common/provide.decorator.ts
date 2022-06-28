import { ProvideMetadata, ProvideOption } from "../../interface";
import { Constructable } from "../../types";
/**
 * 服务提供者
 * @constructor
 */
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