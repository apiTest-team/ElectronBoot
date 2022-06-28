import { Provide } from "../../decorator";
import { getProviderId, IsProvide } from "../../manager";

@Provide("dataList")
class DataList {

}

describe("Provide Decorator", function() {
  it("should register class in the manager", function() {
    const id = getProviderId(DataList)
    expect(id).toEqual("dataList")
    expect(IsProvide(DataList)).toBeTruthy()
  });
});