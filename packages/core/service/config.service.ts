import { ConfigMergeInfo, ConfigServiceInterface } from "../interface/config.interface";
import { EnvironmentService } from "./environment.service";
import { Autowired, Component, Scope, ScopeEnum } from "../context/decorator";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { getConfigEnv, safelyGet, Types } from "../utils";
import { extend } from "../utils/extend";
import util from "util";
import { FrameworkInvalidConfigError } from "../error/framework";

const debug = util.debuglog('electron-boot:debug');
/**
 * 配置服务
 */
@Component()
@Scope(ScopeEnum.Singleton)
export class ConfigService implements ConfigServiceInterface {
  private envDirMap: Map<string, Set<any>> = new Map();
  private aliasMap = {
    prod: "production",
    unittest: "test",
  };
  private configMergeOrder: Array<ConfigMergeInfo> = [];
  protected configuration;
  protected isReady = false;
  protected externalObject: Record<string, unknown>[] = [];

  @Autowired()
  protected environmentService: EnvironmentService;

  /**
   * 保存对应的环境配置
   * @param env
   * @private
   */
  private getEnvSet(env) {
    if (!this.envDirMap.has(env)) {
      this.envDirMap.set(env, new Set());
    }
    return this.envDirMap.get(env);
  }

  private loadConfig(
    configFilename:string
  ): (...args) => any | Record<string, unknown> {
    let exports =
      typeof configFilename === 'string'
        ? require(configFilename)
        : configFilename;

    if (exports && exports.default) {
      if (Object.keys(exports).length > 1) {
        throw new FrameworkInvalidConfigError(
          `${configFilename} should not have both a default export and named export`
        );
      }
      exports = exports.default;
    }

    return exports;
  }
  /**
   * 添加配置文件
   * @param configFilePaths
   */
  add(configFilePaths: any[]) {
    for (const dir of configFilePaths) {
      if (typeof dir === "string") {
        if (/\.\w+$/.test(dir)) {
          // file
          const env = getConfigEnv(dir);
          const envSet = this.getEnvSet(env);
          envSet.add(dir);
          if (this.aliasMap[env]) {
            this.getEnvSet(this.aliasMap[env]).add(dir);
          }
        } else {
          // directory
          const fileStat = statSync(dir);
          if (fileStat.isDirectory()) {
            const files = readdirSync(dir);
            this.add(
              files.map((file) => {
                return join(dir, file);
              })
            );
          }
        }
      } else {
        // object add
        for (const env in dir) {
          if (this.aliasMap[env]) {
            this.getEnvSet(this.aliasMap[env]).add(dir[env]);
          } else {
            this.getEnvSet(env).add(dir[env]);
          }
        }
      }
    }
  }

  /**
   * 添加 对象
   * @param obj
   * @param reverse
   */
  addObject(obj: Record<string, unknown>, reverse?: boolean) {
    if (this.isReady) {
      this.configMergeOrder.push({
        env: 'default',
        extraPath: '',
        value: obj,
      });
      if (reverse) {
        this.configuration = extend(true, obj, this.configuration);
      } else {
        extend(true, this.configuration, obj);
      }
    } else {
      this.externalObject.push(obj);
    }
  }

  /**
   * 清除变量
   */
  clearAllConfig() {
    this.configuration.clear();
  }

  /**
   * 获取指定key变量
   * @param configKey
   */
  getConfiguration(configKey?: string) {
    if (configKey) {
      return safelyGet(configKey, this.configuration);
    }
    return this.configuration;
  }

  /**
   * 加载配置文件
   */
  load() {
    if (this.isReady) return;
    // get default
    const defaultSet = this.getEnvSet('default');
    // get current set
    const currentEnvSet = this.getEnvSet(
      this.environmentService.getCurrentEnvironment()
    );
    // merge set
    const target = {};
    const defaultSetLength = defaultSet.size;
    for (const [idx, filename] of [...defaultSet, ...currentEnvSet].entries()) {
      const config = this.loadConfig(filename);

      if (!config) {
        continue;
      }

      if (typeof filename === 'string') {
        debug('[config]: Loaded config %s, %j', filename, config);
      } else {
        debug('[config]: Loaded config %j', config);
      }
      this.configMergeOrder.push({
        env:
          idx < defaultSetLength
            ? 'default'
            : this.environmentService.getCurrentEnvironment(),
        extraPath: filename,
        value: config,
      });

      extend(true, target, config);
    }
    if (this.externalObject.length) {
      for (const externalObject of this.externalObject) {
        if (externalObject) {
          debug('[config]: Loaded external object %j', externalObject);
          extend(true, target, externalObject);
          this.configMergeOrder.push({
            env: 'default',
            extraPath: '',
            value: externalObject,
          });
        }
      }
    }
    this.configuration = target;
    this.isReady = true;
  }

  getConfigMergeOrder(): Array<ConfigMergeInfo> {
    return this.configMergeOrder;
  }

  clearConfigMergeOrder() {
    this.configMergeOrder.length = 0;
  }
}