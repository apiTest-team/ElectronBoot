import { ClassMetadata, ObjectIdentifier } from "../interface";
import { DecoratorManager } from "./decorator.manager";
import { TARGETED_CLASS } from "../constant";
import { randomUUID,camelCase } from "../utils";

/**
 * 保存id到target
 * @param identifier
 * @param target
 */
export const saveProviderId = <T>(identifier:ObjectIdentifier,target:any):T => {
  if (IsProvide(target)){
    const meta = getClassMetadata(TARGETED_CLASS,target)
    if (meta.id !== identifier){
      meta.id = identifier
      saveClassMetadata(TARGETED_CLASS,meta,target)
    }
  }else{
    const data:ClassMetadata = {
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
export const getProviderId = (module:any):ObjectIdentifier=>{
  const metaData = getClassMetadata(TARGETED_CLASS,module)
  if (metaData && metaData.id){
    return metaData.id
  }
}
/**
 * 判断当前类是否已经存储过meta信息
 * @param target
 * @constructor
 */
export const IsProvide = <T>(target:T) => {
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
    if (Array.isArray(oldData)){
      return  DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,oldData.concat(data),target)
    }
    return DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,Object.assign(oldData,data),target)
  }
  return DecoratorManager.defaultManager.saveMetadata(decoratorNameKey,data,target)
}