import { OnuIdType } from "./types/OnuIdType.type";

export interface IListOnuLanInfoParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
  ONUPORT?: string;
}
