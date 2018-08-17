import { OnuIdType } from "./types/OnuIdType.type";

export interface IQueryOnuState {
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: OnuIdType;
  ONUID?: string;
}
