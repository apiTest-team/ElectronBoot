import { createCustomPropertyDecorator } from "../../manager/default.manager";
import { APPLICATION_KEY, CONFIG_KEY } from "../../constant";
import { RuntimeType } from "../../../interface/runtime.interface";

export function Config(identifier?: string): PropertyDecorator {
  return createCustomPropertyDecorator(CONFIG_KEY, {
    identifier,
  });
}

export function App(
  typeOrNamespace?: RuntimeType | string
): PropertyDecorator {
  return createCustomPropertyDecorator(APPLICATION_KEY, {
    type: typeOrNamespace,
  });
}