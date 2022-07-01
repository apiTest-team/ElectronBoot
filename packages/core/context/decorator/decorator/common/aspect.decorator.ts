import { saveClassAttachMetadata, saveModule } from "../../manager/default.manager";
import { Scope } from "./objectdef.decorator";
import { ScopeEnum } from "../../interface";
import { Component } from "./component.decorator";
import { ASPECT_KEY } from "../../constant";


export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed?(...args: any[]): any;
}

export interface AspectMetadata {
  aspectTarget: any;
  match?: string | string[];
  priority?: number;
}

export function Aspect(
  aspectTarget: any | any[],
  match?: string | (() => boolean),
  priority?: number
) {
  return function (target) {
    saveModule(ASPECT_KEY, target);
    const aspectTargets = [].concat(aspectTarget);
    for (const aspectTarget of aspectTargets) {
      saveClassAttachMetadata(
        ASPECT_KEY,
        {
          aspectTarget,
          match,
          priority,
        },
        target
      );
    }

    Scope(ScopeEnum.Singleton)(target);
    Component()(target);
  };
}
