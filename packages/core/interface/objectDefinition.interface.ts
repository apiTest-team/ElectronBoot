import { ObjectCreatorInterface } from "./objectCreator.interface";
import { ManagedInstanceInterface, ObjectIdentifier, ScopeEnum } from "@electron-boot/decorator";

/**
 * 属性配置抽象
 */
export interface PropertiesInterface extends Map<ObjectIdentifier, any> {
  getProperty(key: ObjectIdentifier, defaultValue?: any): any;
  setProperty(key: ObjectIdentifier, value: any): any;
  propertyKeys(): ObjectIdentifier[];
}

export interface ObjectDefinitionInterface {
  namespace?: string;
  creator: ObjectCreatorInterface;
  id: string;
  name: string;
  initMethod: string;
  destroyMethod: string;
  constructMethod: string;
  srcPath: string;
  path: any;
  export: string;
  dependsOn: ObjectIdentifier[];
  constructorArgs: ManagedInstanceInterface[];
  properties: PropertiesInterface;
  scope: ScopeEnum;
  isAsync(): boolean;
  isSingletonScope(): boolean;
  isRequestScope(): boolean;
  hasDependsOn(): boolean;
  hasConstructorArgs(): boolean;
  getAttr(key: ObjectIdentifier): any;
  hasAttr(key: ObjectIdentifier): boolean;
  setAttr(key: ObjectIdentifier, value: any): void;
  // 自定义装饰器的 key、propertyName
  handlerProps: Array<{
    /**
     * decorator property name set
     */
    propertyName: string;
    /**
     * decorator uuid key
     */
    key: string;
    /**
     * custom decorator set metadata
     */
    metadata: any;
  }>;
  createFrom: 'framework' | 'file' | 'module';
  allowDowngrade: boolean;
  bindHook?: (module: any, options?: ObjectDefinitionInterface) => void;
}