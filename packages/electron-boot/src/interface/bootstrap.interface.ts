export interface AppInfo {
  pkg: Record<string, any>;
  name: string;
  baseDir: string;
  appDir: string;
  HOME: string;
  cache: string;
  env: string;
}