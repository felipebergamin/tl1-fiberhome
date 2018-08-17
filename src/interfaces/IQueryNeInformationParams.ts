import { OnuIdType } from "./types/OnuIdType.type";

export interface IQueryNeInformationParams {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
}
