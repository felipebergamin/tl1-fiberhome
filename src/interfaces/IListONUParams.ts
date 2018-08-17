import { OnuIdType } from "./types/OnuIdType.type";

export interface IListONUParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
}
