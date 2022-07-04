import { AirContainer } from "./container";
import { AirContainerInterface, ObjectContext } from "../interface";
import { REQUEST_CTX_KEY } from "./managedResolver";
import { PIPELINE_IDENTIFIER } from "../decorator";

export class AirRequestContainer extends AirContainer{

  private readonly applicationContext:AirContainerInterface

  constructor(ctx,applicationContext:AirContainerInterface) {
    super();
    this.applicationContext = applicationContext
    this.registry.setIdentifierRelation(
      this.applicationContext.registry.getIdentifierRelation()
    )
    this.ctx = ctx
    // 注册上下文
    this.registerObject(REQUEST_CTX_KEY,ctx)
    // 注册返回
    this.registerObject("res",{})

  }

  protected init() {}

  get<T = any>(identifier: any, args?: any[], objectContext?: ObjectContext): T {
    if (typeof identifier !== "string"){
      identifier = this.getIdentifier(identifier)
    }

    if (this.registry.hasObject(identifier)){
      return this.registry.getObject(identifier)
    }

    const definition = this.applicationContext.registry.getDefinition(identifier)
    if (definition){
      if (definition.isRequestScope() ||
        definition.id===PIPELINE_IDENTIFIER
      ){
        return this.getManagedResolverFactory().create({
          definition,
          args
        })
      }
    }
    if (this.parent){
      return this.parent.get(identifier,args)
    }
  }

  async getAsync<T = any>(identifier: any, args?: any[], objectContext?: ObjectContext): Promise<T> {
    if (typeof identifier!=="string"){
      identifier =  this.getIdentifier(identifier)
    }

    if (this.registry.hasObject(identifier)){
      return this.registry.getObject(identifier)
    }

    const definition = this.applicationContext.registry.getDefinition(identifier)
    if (definition){
      if (
        definition.isRequestScope()||
        definition.id=== PIPELINE_IDENTIFIER
      ){
        return this.getManagedResolverFactory().create({
          definition,
          args
        })
      }
    }
    if (this.parent){
      return this.parent.getAsync<T>(identifier, args);
    }
  }
  
  ready() {
  }

  getContext(){
    return this.ctx
  }
}