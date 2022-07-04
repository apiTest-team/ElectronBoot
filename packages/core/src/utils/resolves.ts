import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import pm from "picomatch";
import { debuglog } from "util";

const debug = debuglog("air:glob");

export interface RunOptions {
  cwd: string;
  ignore?: string[];
}

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
  debug(`air glob timing ${Date.now() - startTime}ms`);
  return result;
};
