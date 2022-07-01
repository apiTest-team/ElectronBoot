import "reflect-metadata"
import {
  AutowiredModeEnum,
  AutowiredOptions,
  ComponentMetadata,
  ClassPropsMetadata,
  GroupModeType,
  ObjectIdentifier,
  TSDesignType, ModuleStoreInterface, ObjectDefinitionOptions
} from "../interface";
import {DecoratorManager} from "./decorator.manager";
import { AUTOWIRED_TAG, OBJECT_DEF_CLS, PRELOAD_MODULE_KEY, TARGETED_CLASS } from "../constant";
import {camelCase, isClass, isNullOrUndefined, merge, randomUUID} from "../../../utils";

/**
 * 保存id到target
 * @param identifier
 * @param target
 */
export const saveComponentId = <T>(identifier:ObjectIdentifier,target:any):T => {
  if (IsComponent(target)){
    const meta = getClassMetadata(TARGETED_CLASS,target)
    if (meta.id !== identifier){
      meta.id = identifier
      saveClassMetadata(TARGETED_CLASS,meta,target)
    }
  }else{
    const data:ComponentMetadata = {
      id:identifier,
      uuid:randomUUID(),
      originName:target.name,
      name:camelCase(target.name as string)
    }
    saveClassMetadata(TARGETED_CLASS,data,target)
  }
  return target
}
/**
 * 从所有的provide中获取指定provide的id
 * @param module
 */
export const getComponentId = (module:any):ObjectIdentifier=>{
  const metaData = getClassMetadata(TARGETED_CLASS,module)
  if (metaData && metaData.id){
    return metaData.id
  }
}

/**
 * 获取组件名称
 * @param module
 */
export const getComponentName = (module:any):string =>{
  const metaData = getClassMetadata(TARGETED_CLASS, module)
  if (metaData && metaData.name) {
    return metaData.name;
  }
}

/**
 * 获取组件的uuid
 * @param component
 */
export const getComponentUUID = (component):string => {
  const metadata = getClassMetadata(TARGETED_CLASS,component) as ComponentMetadata
  if (metadata&&metadata.uuid){
    return metadata.uuid
  }
}

/**
 * 保存属性property属性到元数据
 * @param opts
 */
export const savePropertyAutowired = (opts?:AutowiredOptions) => {
  let identifier = opts.identifier
  let autowiredMod = AutowiredModeEnum.Identifier
  if (!identifier){
    const type = getPropertyType(opts?.target,opts?.targetKey)
    if (!type.isBaseType&&IsComponent(type.originDesign)&&isClass(type.originDesign)){
      identifier = getComponentUUID(type.originDesign)
      autowiredMod = AutowiredModeEnum.Class
    }
    if (!identifier){
      identifier = opts.identifier
      autowiredMod = AutowiredModeEnum.PropertyName
    }
  }
  saveClassAttachMetadata(
      AUTOWIRED_TAG,
      {
        targetKey: opts.targetKey, // 注入的属性名
        value: identifier, // 注入的 id
        args: opts.args, // 注入的其他参数
        autowiredMod,
      },
      opts.target,
      opts.targetKey
  )
}

/**
 * save class object definition
 * @param target class
 * @param props property data
 */
export function saveObjectDefinition(target: any, props = {}) {
  saveClassMetadata(OBJECT_DEF_CLS, props, target, true);
  return target;
}
/**
 * 获取属性类型
 * @param target 目标类
 * @param methodName 目标方法
 */
export const getPropertyType = (target:Object,methodName:string|symbol) => {
  return transformTypeFromTSDesign(
      Reflect.getMetadata("design:type",target,methodName)
  )
}

/**
 * 获取指定target的注入信息
 * @param target
 * @param useCache
 */
export const getPropertyAutowired = (target:any,useCache?:boolean):ClassPropsMetadata => {
  return getClassExtendedMetadata(AUTOWIRED_TAG, target, undefined, useCache)
}
/**
 * get class object definition from metadata
 * @param target
 */
export function getObjectDefinition(target: any): ObjectDefinitionOptions {
  return getClassExtendedMetadata(OBJECT_DEF_CLS, target);
}
/**
 * 获取指定类的扩展元数据
 * @param decoratorNameKey
 * @param target
 * @param propertyName
 * @param useCache
 */
export const getClassExtendedMetadata = (
  decoratorNameKey: ObjectIdentifier,
  target, propertyName?: string,
  useCache?: boolean
) => {
  if (useCache === undefined) {
    useCache = true;
  }
  const extKey = DecoratorManager.getDecoratorClassExtendedKey(decoratorNameKey);
  let metadata = DecoratorManager.defaultManager.getMetadata(extKey,target,propertyName)
  if (useCache && metadata!==undefined){
    return metadata
  }
  const parent = Reflect.getPrototypeOf(target as Object)
  if (parent && parent.constructor !== Object){
    metadata = merge(
      getClassExtendedMetadata(
        decoratorNameKey,
        parent,
        propertyName,
        useCache
      ),
      DecoratorManager.defaultManager.getMetadata(decoratorNameKey,target,propertyName)
    )
  }
  DecoratorManager.defaultManager.saveMetadata(extKey,metadata||null,target,propertyName)
  return metadata
}

/**
 * 判断是否已经是注解注入类
 * @param target
 * @constructor
 */
export const IsComponent = <T>(target:T) => {
  return !!getClassMetadata(TARGETED_CLASS,target)
}

/**
 * 获取类的元数据
 * @param decoratorNameKey
 * @param target
 */
export const getClassMetadata = <T>(decoratorNameKey:ObjectIdentifier,target:T):any => {
  return DecoratorManager.defaultManager.getMetadata(decoratorNameKey,target)
}

/**
 * 保存元数据
 * @param decoratorNameKey 元数据保存key
 * @param data  保存的数据
 * @param target 保存元数据的对象
 * @param merge
 */
export const saveClassMetadata = <T>(decoratorNameKey:ObjectIdentifier,data:any,target:T,merge?:boolean):any=>{
  // 如果设置合并,并且data是一个对象
  if (merge && typeof data==="object"){
    const oldData = DecoratorManager.defaultManager.getMetadata(decoratorNameKey,target)
    if (!oldData) {
      return DecoratorManager.defaultManager.saveMetadata(decoratorNameKey, data, target);
    }
    if (Array.isArray(oldData)){
      return  DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,oldData.concat(data),target)
    }
    return DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,Object.assign(oldData,data),target)
  }
  return DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,data,target)
}
/**
 * save module to inner map
 * @param decoratorNameKey
 * @param target
 */
export const saveModule =(decoratorNameKey: ObjectIdentifier, target) => {
  if (isClass(target)) {
    saveComponentId(undefined, target);
  }
  return DecoratorManager.defaultManager.saveModule(decoratorNameKey, target);
}

/**
 * 保存加载前的模块
 * @param target
 */
export const savePreloadModule = (target) => {
  return saveModule(PRELOAD_MODULE_KEY, target);
}

/**
 * 获取加载文件前的模块
 */
export const listPreloadModule =  (): any[] => {
  return listModule(PRELOAD_MODULE_KEY);
}

/**
 * 给装饰管理器绑定容器
 * @param container
 */
export const bindContainer =(container:ModuleStoreInterface) => {
  return DecoratorManager.defaultManager.bindContainer(container);
}

/**
 * get parameters type by reflect-metadata
 */
export function getMethodParamTypes(target, methodName: string | symbol) {
  if (isClass(target)) {
    target = target.prototype;
  }
  return Reflect.getMetadata('design:paramtypes', target, methodName);
}

/**
 * 清空容器
 */
export function clearBindContainer() {
  return (DecoratorManager.defaultManager.container = null);
}

/**
 * 从元数据中获取模块
 * @param decoratorNameKey
 * @param filter
 */
export function listModule(
  decoratorNameKey: ObjectIdentifier,
  filter?: (module) => boolean
): any[] {
  const modules = DecoratorManager.defaultManager.listModule(decoratorNameKey);
  if (filter) {
    return modules.filter(filter);
  } else {
    return modules;
  }
}

/**
 * 保存类的属性信息
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 * @param groupMode
 */
export const saveClassAttachMetadata = (
    decoratorNameKey:ObjectIdentifier,
    data:any,
    target:Object,
    groupBy?:string|symbol,
    groupMode?:GroupModeType) => {
    return DecoratorManager.defaultManager.saveClassAttachMetadata(decoratorNameKey, data, target,undefined,groupBy,groupMode)
}

/**
 * 从autowired装饰器中获取当前装饰的属性类型
 * @param designFn
 */
function transformTypeFromTSDesign(designFn): TSDesignType {
  if (isNullOrUndefined(designFn)) {
    return { name: 'undefined', isBaseType: true, originDesign: designFn };
  }
  switch (designFn.name) {
    case 'String':
      return { name: 'string', isBaseType: true, originDesign: designFn };
    case 'Number':
      return { name: 'number', isBaseType: true, originDesign: designFn };
    case 'Boolean':
      return { name: 'boolean', isBaseType: true, originDesign: designFn };
    case 'Symbol':
      return { name: 'symbol', isBaseType: true, originDesign: designFn };
    case 'Object':
      return { name: 'object', isBaseType: true, originDesign: designFn };
    case 'Function':
      return { name: 'function', isBaseType: true, originDesign: designFn };
    default:
      return {
        name: designFn.name,
        isBaseType: false,
        originDesign: designFn,
      };
  }
}