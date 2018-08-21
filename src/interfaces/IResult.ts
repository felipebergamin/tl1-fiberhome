export interface IResult<T> {
  /** type of response matched by parser */
  type: 'operationCommand' | 'queryCommand';
  sid: string;
  /** date of command execution in format yyyy-mm-dd */
  date: string;
  /** time of command execution in format hh:mm:ss */
  time: string;
  /** command tag */
  ctag: string;
  /** completion code returned by server */
  completion_code: string;
  /** query terminator */
  terminator: ';' | '>';

  /** error code */
  error_code?: string;
  /** error description */
  error_description?: string;

  /** total blocks that server used for response */
  total_blocks?: number;
  /** number of current block */
  block_number?: number;
  /** total records on current block */
  block_records?: number;

  /**
   * Result of query commands.
   * Note: Only Query Command's has a result object
   */
  result?: {
    /** title of result */
    title?: string;
    /** strings array, each position is the name of a column in response */
    attribs: string[];
    /** values returned by server */
    values: T[];
  };
}
