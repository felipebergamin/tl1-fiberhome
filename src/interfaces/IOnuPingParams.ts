import { OnuIdType } from "./types/OnuIdType.type";

export interface IOnuPingParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
  IP?: string;
}
