export interface IListONUResponse {
  /** OLT IP address or name */
  OLTID: string;
  /** pon location */
  PONID: string;
  /** ONU authorization code */
  ONUNO: string;
  /** onu name */
  NAME: string;
  /** onu description */
  DESC: string;
  /** onu type */
  ONUTYPE: string;
  /** management ip of onu */
  IP: string;
  /** auth mode */
  AUTHTYPE: 'MAC' | 'LOID' | 'LOIDONCEON';
  /** mac information of the onu */
  MAC: string;
  LOID: string;
  /** loid password */
  PWD: string;
  /** software version */
  SWVER: string;
}
