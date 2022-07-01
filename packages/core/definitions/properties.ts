import { PropertiesInterface } from '../interface';
import { ObjectIdentifier } from "../context/decorator";

export class ObjectProperties
  extends Map<ObjectIdentifier, any>
  implements PropertiesInterface
{
  propertyKeys(): ObjectIdentifier[] {
    return Array.from(this.keys());
  }

  getProperty(key: ObjectIdentifier, defaultValue?: any): any {
    if (this.has(key)) {
      return this.get(key);
    }

    return defaultValue;
  }

  setProperty(key: ObjectIdentifier, value: any): any {
    return this.set(key, value);
  }
}