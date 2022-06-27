import { AbstractConstructable, Constructable } from "./constructable.type";
import { Token } from "../class/token.class";

export type ProvideIdentifier<T = unknown> =
  | Constructable<T>
  | AbstractConstructable<T>
  | CallableFunction
  | Token<T>
  | symbol
  | string