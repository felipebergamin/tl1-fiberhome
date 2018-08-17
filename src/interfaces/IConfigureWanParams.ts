import { OnuIdType } from "./types/OnuIdType.type";

export interface IConfigureWanParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
  /**
   * 1 = add
   * 2 = delete
   */
  STATUS?: 1 | 2;
  /**
   * 1 = TR069
   * 2 = INTERNET
   * 3 = TR069 INTERNET
   * 4 = OTHER
   */
  MODE?: 1 | 2 | 3 | 4;
  /**
   * 1 = Bridge
   * 2 = Router
   */
  CONNTYPE?: 1 | 2;
  /** 0-4085 */
  VLAN?: number;
  COS?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** 1 = enabled 2 = disabled */
  QOS?: 1 | 2;
  /** 1 = enabled 2 = disabled */
  NAT?: 1 | 2;
  /**
   * 1 = dhcp
   * 2 = static
   * 3 = pppoe
   */
  IPMODE?: 1 | 2 | 3;
  WANIP?: string;
  WANMASK?: string;
  WANGATEWAY?: string;
  MASTERDNS?: string;
  SLAVEDNS?: string;
  /** 1 = enabled 2 = disabled */
  PPPOEPROXY?: 1 | 2;
  PPPOEUSER?: string;
  PPPOEPASSWD?: string;
  PPPOENAME?: string;
  /** 1 = automatic connection 2 = connect on demand */
  PPPOEMODE?: 1 | 2;
  /** the FE port number (only one parameter can be used) */
  UPORT?: number;
  /** the SSID number (only one parameter can be used) */
  SSID?: number;
  WANSVC?: number;
  UPPROFILENAME?: string;
  DOWNPROFILENAME?: string;
}
