/**
 * 对象定义的存储器接口
 */
import { ObjectDefinitionInterface } from "./objectDefinition.interface";
import { IdentifierRelationShipInterface } from "./identifierRelationShip.interface";
import { ObjectIdentifier } from "../context/decorator";

export interface ObjectDefinitionRegistryInterface {
  readonly identifiers: ObjectIdentifier[];
  readonly count: number;
  registerDefinition(
    identifier: ObjectIdentifier,
    definition: ObjectDefinitionInterface
  );
  getSingletonDefinitionIds(): ObjectIdentifier[];
  getDefinition(identifier: ObjectIdentifier): ObjectDefinitionInterface;
  getDefinitionByName(name: string): ObjectDefinitionInterface[];
  removeDefinition(identifier: ObjectIdentifier): void;
  hasDefinition(identifier: ObjectIdentifier): boolean;
  clearAll(): void;
  hasObject(identifier: ObjectIdentifier): boolean;
  registerObject(identifier: ObjectIdentifier, target: any);
  getObject(identifier: ObjectIdentifier): any;
  getIdentifierRelation(): IdentifierRelationShipInterface;
  setIdentifierRelation(identifierRelation: IdentifierRelationShipInterface);
}