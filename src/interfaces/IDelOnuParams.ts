import { OnuIdType } from "./types/OnuIdType.type";

export interface IDelOnuParams {
  /** IP address, name or ID of an OLT */
  OLTID?: string;
  /** Cabinet-Subrack-Slot-Pon Number */
  PONID?: string;
  /** type of ONU identifier specified on ONUID param */
  ONUIDTYPE?: OnuIdType;
  /** onu id value */
  ONUID?: string;
}
