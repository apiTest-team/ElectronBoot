
export interface ActionOptions {
  // 事件地址
  path?:string
  // 方法
  method?:string
  // 描述
  summary?:string
  // 介绍
  description?:string
}

export const defaultMetadata:ActionOptions = {
  path:"/"
}

export const Action = (options:ActionOptions=defaultMetadata):MethodDecorator => {
  const path = options.path || "/"
  return (target, propertyKey, descriptor) => {
    
  }
}