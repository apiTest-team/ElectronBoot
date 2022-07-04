/**
 * 环境变量接口
 */
export interface EnvironmentServiceInterface {
  getCurrentEnvironment(): string
  setCurrentEnvironment(environment: string)
  isDevelopmentEnvironment(): boolean
}
