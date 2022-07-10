import { contextBridge, ipcRenderer } from "electron";
import os from "os";
import { RpcResponse } from "./interface";

const _map = new Map();
// 监听来自服务器的消息
ipcRenderer.on("from-server", (event, params: RpcResponse) => {
  const cb = _map.get(params._symbol);
  if (typeof cb === "function") {
    _map.delete(params._symbol);
    cb();
  }
});
// 暴露出去rpc接口
contextBridge.exposeInMainWorld("rpc", (type: string, data: JSON) => {
  const _symbol = Symbol(Date.now() + type);
  return new Promise((resolve) => {
    _map.set(_symbol, (data: JSON) => {
      resolve(data);
    });
    ipcRenderer.send("from-client", {
      _symbol,
      type,
      data
    });
  });
});
