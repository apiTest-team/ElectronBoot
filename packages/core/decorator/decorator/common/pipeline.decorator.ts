import { ObjectIdentifier } from '../../interface';
import { PIPELINE_IDENTIFIER } from "../../constant";
import { createCustomPropertyDecorator } from "../../manager/default.manager";

export const Pipeline = (valves?: Array<ObjectIdentifier | (new (...args) => any)>):PropertyDecorator => {
  return createCustomPropertyDecorator(PIPELINE_IDENTIFIER, {
    valves,
  });
}
