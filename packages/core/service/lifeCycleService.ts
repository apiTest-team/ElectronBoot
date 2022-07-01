import { debuglog } from 'util';
import { Autowired, Component, Init, Scope, ScopeEnum } from "../context/decorator";
import { ConfigService } from "./config.service";
import { ContainerInterface, LifeCycleInterface } from "../interface";
import { listModule } from "../context/decorator/manager/default.manager";
import { CONFIGURATION_KEY } from "../context/decorator/constant";
import { FunctionalConfiguration } from "../functional/configuration";
const debug = debuglog('electron-boot:debug');

@Component()
@Scope(ScopeEnum.Singleton)
export class LifeCycleService {

  @Autowired()
  protected configService: ConfigService;

  constructor(readonly applicationContext: ContainerInterface) {}

  @Init()
  protected async init() {
    // run lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    debug(`[core]: Found Configuration length = ${cycles.length}`);

    const lifecycleInstanceList = [];
    for (const cycle of cycles) {
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        cycle.instance = cycle.target;
      } else {
        // 普通类写法
        debug(`[core]: Lifecycle run ${cycle.target.name as string} init`);
        cycle.instance = await this.applicationContext.getAsync<LifeCycleInterface>(
          cycle.target
        );
      }

      cycle.instance && lifecycleInstanceList.push(cycle);
    }

    // bind object lifecycle
    await Promise.all([
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectInit'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectDestroy'),
    ]);

    // bind framework lifecycle
    // onAppError

    // exec onConfigLoad()
    await this.runContainerLifeCycle(
      lifecycleInstanceList,
      'onConfigLoad',
      configData => {
        if (configData) {
          this.configService.addObject(configData);
        }
      }
    );

    // exec onReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onReady');

    // exec onServerReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onServerReady');

    // clear config merge cache
    if (!this.configService.getConfiguration('debug.recordConfigMergeOrder')) {
      this.configService.clearConfigMergeOrder();
    }
  }

  public async stop() {
    // stop lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    for (const cycle of cycles) {
      let inst;
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        inst = cycle.target;
      } else {
        inst = await this.applicationContext.getAsync<LifeCycleInterface>(cycle.target);
      }

      await this.runContainerLifeCycle(inst, 'onStop');
    }
  }

  private async runContainerLifeCycle(
    lifecycleInstanceOrList,
    lifecycle,
    resultHandler?: (result: any) => void
  ) {
    if (Array.isArray(lifecycleInstanceOrList)) {
      for (const cycle of lifecycleInstanceOrList) {
        if (typeof cycle.instance[lifecycle] === 'function') {
          debug(
            `[core]: Lifecycle run ${cycle.instance.constructor.name as string} ${lifecycle as string}`
          );
          const result = await cycle.instance[lifecycle](
            this.applicationContext
          );
          if (resultHandler) {
            resultHandler(result);
          }
        }
      }
    } else {
      if (typeof lifecycleInstanceOrList[lifecycle] === 'function') {
        debug(
          `[core]: Lifecycle run ${lifecycleInstanceOrList.constructor.name as string} ${lifecycle as string}`
        );
        const result = await lifecycleInstanceOrList[lifecycle](
          this.applicationContext
        );
        if (resultHandler) {
          resultHandler(result);
        }
      }
    }
  }

  private async runObjectLifeCycle(lifecycleInstanceList, lifecycle) {
    for (const cycle of lifecycleInstanceList) {
      if (typeof cycle.instance[lifecycle] === 'function') {
        debug(
          `[core]: Lifecycle run ${cycle.instance.constructor.name as string} ${lifecycle as string}`
        );
        return this.applicationContext[lifecycle](
          cycle.instance[lifecycle].bind(cycle.instance)
        );
      }
    }
  }
}
