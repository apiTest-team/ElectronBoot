import {Component, Scope, ScopeEnum} from "@autowired/core/src";

@Component()
@Scope(ScopeEnum.Singleton)
export class WindowService {
    /**
     * 窗口映射
     * @protected
     */
    protected windows = new Map<string,any>





}