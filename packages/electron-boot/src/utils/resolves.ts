import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, resolve, sep } from "path";
import pm from "picomatch";
import { debuglog } from "util";

const debug = debuglog("electron:debug");

export interface RunOptions {
  cwd: string;
  ignore?: string[];
}

/**
 * 加载文件
 * @param p
 * @param enabledCache
 */
export const safeRequire = (p, enabledCache = true) => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }
  try {
    if (enabledCache) {
      return require(p);
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    debug(`SafeRequire Warning, message = ${err.message}`);
    return undefined;
  }
};

export const resolves = (pattern: string[], options: RunOptions = { cwd: process.cwd(), ignore: [] }) => {
  const startTime = Date.now();
  const entryDir = options.cwd;
  const isMatch = pm(pattern, {
    ignore: options.ignore || [],
  });
  const ignoreMatch = pm("**", {
    ignore: options.ignore || [],
  });

  function globDirectory(dirname: string, isMatch, ignoreDirMatch, options?) {
    if (!existsSync(dirname)) {
      return new Array<any>();
    }
    const list = readdirSync(dirname);
    const result:Array<any> = [];

    for (const file of list) {
      const resolvePath = resolve(dirname, file);
      debug(`resolvePath = ${resolvePath}`);
      const fileStat = statSync(resolvePath);
      if (fileStat.isDirectory() && ignoreDirMatch(resolvePath.replace(entryDir, ""))) {
        const sChild = globDirectory(resolvePath, isMatch, ignoreDirMatch, options);
        result.push(...sChild);
      } else if (fileStat.isFile() && isMatch(resolvePath.replace(entryDir, ""))) {
        result.push(resolvePath);
      }
    }

    return result;
  }

  const result = globDirectory(entryDir, isMatch, ignoreMatch, options);
  debug(`autowired glob timing ${Date.now() - startTime}ms`);
  return result;
};
