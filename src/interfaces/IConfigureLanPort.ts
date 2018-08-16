type ONUIDTYPE = 'ONU_NAME'| 'MAC' | 'LOID' | 'ONU_NUMBER';
type COS = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IConfigureLanPort {
  ONUIP?: string;
  OLTID?: string;
  PONID?: string;
  ONUIDTYPE?: ONUIDTYPE;
  ONUID?: string;
  ONUPORT?: string;
  SVLAN?: number;
  CVLAN?: number;
  SCOS?: COS;
  CCOS?: COS;
}
