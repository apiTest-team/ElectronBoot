export type HandlerFunction = (
  /**
   * decorator uuid key
   */
  key: string,
  /**
   * decorator set metadata
   */
  meta: any,
  instance: any
) => any;