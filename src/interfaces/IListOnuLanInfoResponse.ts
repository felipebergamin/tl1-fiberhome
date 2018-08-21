export interface IListOnuLanInfoResponse {
  /** administration status */
  AdminStatus: string;
  /** running status */
  OperStatus: string;
  /** working mode */
  DUPLEX: string;
  /** vlan id */
  PVID: string;
  /** VLAN priority level */
  VLANPRIORITY: string;
  /** port rate */
  SPEED: string;
}
