import { JoinPoint } from "../decorator/common/aspect.decorator";

export type MethodHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
}) => MethodAspectInterface;

export type ParameterHandlerFunction = (options: {
  target: new (...args) => any;
  propertyName: string;
  metadata: any;
  originArgs: Array<any>;
  originParamType: any;
  parameterIndex: number;
}) => any;

export interface MethodAspectInterface {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}