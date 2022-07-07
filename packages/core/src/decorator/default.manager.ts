import { GroupModeType, ObjectIdentifier } from "../types/decorator.types";
import { PRELOAD_MODULE_KEY, TARGETED_CLASS } from "./decorator.constant";
import { ComponentMetadata } from "../interface/decorator.interface";
import { DecoratorManager } from "./decorator.manager";
import { isClass, randomUUID } from "../utils/decorator.utils";
import { camelCase } from "../utils/camelcase.utils";

/**
 * 保存元数据
 * @param decoratorNameKey 元数据保存key
 * @param data  保存的数据
 * @param target 保存元数据的对象
 * @param merge
 */
export const saveClassMetadata = <T>(
  decoratorNameKey:ObjectIdentifier,
  data:any,
  target:T,
  merge?:boolean
):any=>{
  // 如果设置合并,并且data是一个对象
  if (merge && typeof data==="object"){
    const oldData = DecoratorManager.default.getMetadata(decoratorNameKey,target)
    if (!oldData) {
      return DecoratorManager.default.saveMetadata(decoratorNameKey, data, target);
    }
    if (Array.isArray(oldData)){
      return  DecoratorManager.default.saveMetadata(decoratorNameKey,oldData.concat(data),target)
    }
    return DecoratorManager.default.saveMetadata(decoratorNameKey,Object.assign(oldData,data),target)
  }
  return DecoratorManager.default.saveMetadata(decoratorNameKey,data,target)
}

/**
 * attach data to class
 * @param decoratorNameKey
 * @param data
 * @param target
 * @param groupBy
 * @param groupMode
 */
export function attachClassMetadata(
    decoratorNameKey: ObjectIdentifier,
    data: any,
    target,
    groupBy?: string,
    groupMode?: GroupModeType
) {
  return DecoratorManager.default.attachMetadata(
      decoratorNameKey,
      data,
      target,
      undefined,
      groupBy,
      groupMode
  );
}



/**
 * 将特性属性数据附加到类
 * @param decoratorNameKey 存储key
 * @param data 属性数据
 * @param target 目标类
 * @param propertyName
 * @param groupBy
 */
export const attachPropertyDataToClass = (
    decoratorNameKey: ObjectIdentifier,
    data,
    target,
    propertyName,
    groupBy?: string
)=>{
  return DecoratorManager.default.attachPropertyDataToClass(
      decoratorNameKey,
      data,
      target,
      propertyName,
      groupBy
  );
}


/**
 * 保存加载前的模块
 * @param target
 */
export const savePreloadModule = (target:any) => {
  return saveModule(PRELOAD_MODULE_KEY, target);
}
/**
 * 保存模块到内部map
 * @param decoratorNameKey
 * @param target
 */
export const saveModule =(decoratorNameKey: ObjectIdentifier, target:any) => {
  if (isClass(target)) {
    saveComponentId(undefined, target);
  }
  return DecoratorManager.default.saveModule(decoratorNameKey, target);
}



/**
 * 获取类的元数据
 * @param decoratorNameKey
 * @param target
 */
export const getClassMetadata = <T>(
  decoratorNameKey:ObjectIdentifier,
  target:T
):any => {
  return DecoratorManager.default.getMetadata(decoratorNameKey,target)
}










/**
 * 保存id到target
 * @param identifier
 * @param target
 */
export const saveComponentId = <T>(identifier:ObjectIdentifier|undefined,target:any):T => {
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
 * 判断是否已经是注解注入类
 * @param target
 * @constructor
 */
export const IsComponent = <T>(target:T) => {
  return !!getClassMetadata(TARGETED_CLASS,target)
}