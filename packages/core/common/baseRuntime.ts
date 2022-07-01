import { AppContext } from "../interface/context.interface";
import { RuntimeInterface } from "../interface/runtime.interface";
import { ApplicationInterface } from "../interface/application.interface";
import { ConfigurationOptions } from "../context/decorator/interface/configuration.interface";

export abstract class BaseRuntime<
  App extends ApplicationInterface,
  Ctx extends AppContext,
  OPTS extends ConfigurationOptions,
  ResOrNext = unknown,
  Next = unknown
  > implements RuntimeInterface<App,Ctx,OPTS,ResOrNext,Next>
{
  public app:App;
  public configurationOptions:ConfigurationOptions

}