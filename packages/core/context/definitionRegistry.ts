import {
  IdentifierRelationShipInterface,
  ObjectDefinitionInterface,
  ObjectDefinitionRegistryInterface
} from "../interface";
import { ObjectIdentifier } from "@electron-boot/decorator";
import { getComponentId, getComponentName } from "@electron-boot/decorator/manager/default.manager";

const PREFIX = '_id_default_';

class LegacyIdentifierRelation
  extends Map<ObjectIdentifier, string>
  implements IdentifierRelationShipInterface
{
  saveClassRelation(module: any, namespace?: string) {
    const componentId = getComponentId(module);
    // save uuid
    this.set(componentId, componentId.toString());
    if (componentId) {
      // save alias id
      const aliasId = getComponentId(module);
      if (aliasId) {
        // save alias Id
        this.set(aliasId, componentId.toString());
      }
      // save className alias
      this.set(getComponentName(module), componentId.toString());
      // save namespace alias
      if (namespace) {
        this.set(namespace + ":" + getComponentName(module), componentId.toString());
      }
    }
  }

  saveFunctionRelation(id: ObjectIdentifier, uuid: string) {
    this.set(uuid, uuid);
    this.set(id, uuid);
  }

  hasRelation(id: ObjectIdentifier): boolean {
    return this.has(id);
  }

  getRelation(id: ObjectIdentifier): string {
    return this.get(id);
  }
}
/**
 * 对象定义存储器
 */
export class ObjectDefinitionRegistry
  extends Map
  implements ObjectDefinitionRegistryInterface
{
  private singletonIds = [];
  private _identifierRelation: IdentifierRelationShipInterface =
    new LegacyIdentifierRelation();

  get identifierRelation() {
    if (!this._identifierRelation) {
      this._identifierRelation = new LegacyIdentifierRelation();
    }
    return this._identifierRelation;
  }

  set identifierRelation(identifierRelation) {
    this._identifierRelation = identifierRelation;
  }

  get identifiers() {
    const ids = [];
    for (const key of this.keys()) {
      if (key.indexOf(PREFIX) === -1) {
        ids.push(key);
      }
    }
    return ids;
  }

  get count() {
    return this.size;
  }

  getSingletonDefinitionIds(): ObjectIdentifier[] {
    return this.singletonIds;
  }

  getDefinitionByName(name: string): ObjectDefinitionInterface[] {
    const definitions = [];
    for (const v of this.values()) {
      const definition = v as ObjectDefinitionInterface;
      if (definition.name === name) {
        definitions.push(definition);
      }
    }
    return definitions;
  }

  registerDefinition(
    identifier: ObjectIdentifier,
    definition: ObjectDefinitionInterface
  ) {
    if (definition.isSingletonScope()) {
      this.singletonIds.push(identifier);
    }
    this.set(identifier, definition);
  }

  getDefinition(identifier: ObjectIdentifier): ObjectDefinitionInterface {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.get(identifier);
  }

  removeDefinition(identifier: ObjectIdentifier): void {
    this.delete(identifier);
  }

  hasDefinition(identifier: ObjectIdentifier): boolean {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.has(identifier);
  }

  clearAll(): void {
    this.singletonIds = [];
    this.clear();
  }

  hasObject(identifier: ObjectIdentifier): boolean {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.has(PREFIX + identifier.toString());
  }

  registerObject(identifier: ObjectIdentifier, target: any) {
    this.set(PREFIX + identifier.toString(), target);
  }

  getObject(identifier: ObjectIdentifier): any {
    identifier = this.identifierRelation.getRelation(identifier) ?? identifier;
    return this.get(PREFIX + identifier.toString());
  }

  getIdentifierRelation(): IdentifierRelationShipInterface {
    return this.identifierRelation;
  }

  setIdentifierRelation(identifierRelation: IdentifierRelationShipInterface) {
    this.identifierRelation = identifierRelation;
  }
}