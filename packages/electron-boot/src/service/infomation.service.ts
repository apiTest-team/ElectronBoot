import { join } from "path";
import { Component, Scope, ScopeEnum,Autowired } from "@autowired/core";
import { safeRequire } from "../utils/resolves";
import { app } from "electron";
import { getCurrentEnvironment, isDevelopmentEnvironment } from "../utils";

@Component()
@Scope(ScopeEnum.Singleton)
export class InformationService {
  private pkg: Record<string, unknown>;

  @Autowired()
  protected baseDir: string;

  @Autowired()
  protected init() {
    if (this.baseDir) {
      this.pkg = safeRequire(join(this.baseDir, 'package.json')) || {};
    } else {
      this.pkg = {};
    }
  }

  /**
   * 获取应用路径
   */
  getAppDir(): string {
    return app.getAppPath();
  }

  /**
   * 获取js目录
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * 用户home目录
   */
  getHome(): string {
    return app.getPath("home");
  }

  /**
   * 应用的pkg信息
   */
  getPkg(): any {
    return this.pkg;
  }

  /**
   * 项目名称
   */
  getProjectName(): string {
    return (this.pkg?.['name'] as string) || '';
  }

  /**
   * 获取缓存目录
   */
  getCache(): string {
    const isDevelopmentEnv = isDevelopmentEnvironment(getCurrentEnvironment());
    return isDevelopmentEnv ? this.getAppDir() : this.getHome();
  }
}