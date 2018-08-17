import { OnuIdType } from "./types/OnuIdType.type";

export interface IQueryCardInformationParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
  BOARDID?: string;
}
