import "reflect-metadata"
import { getComponentId, IsComponent } from "../../manager/default.manager";
import { Component } from "../../decorator/common/component.decorator";

@Component("dataList")
class DataList {

}

describe("Provide Decorator", function() {
  it("should register class in the manager", function() {
    const id = getComponentId(DataList)
    expect(id).toEqual("dataList")
    expect(IsComponent(DataList)).toBeTruthy()
  });
});