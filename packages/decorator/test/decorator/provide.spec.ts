import { Provide } from "../../decorator/common/provide.decorator";

describe("Provide Decorator", function() {
  it("should register class in the manager", function() {
    @Provide()
    class TestProvide {

    }
  });
});