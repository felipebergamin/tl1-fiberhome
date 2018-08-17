import { OnuIdType } from "./types/OnuIdType.type";

export interface IResetOnuParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
  PORTID?: string;
  /**
   * 0 - restart entire system
   * 1 - restart line card or main control unit
   */
  RESETTYPE?: 0 | 1;
}
