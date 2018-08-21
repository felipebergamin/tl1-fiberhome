export interface IQueryOnuStateResponse {
  /** ONU identifier type */
  ONUID: string;
  /** administration status */
  AdminState: string;
  /** running status */
  OperState: string;
  /** auth mode */
  AUTH: string;
  /** auth information */
  AUTHINFO: string;
  /** ONU management IP address */
  ONUIP: string;
  /** ONU offline time */
  LASTOFFTIME: string;
}
