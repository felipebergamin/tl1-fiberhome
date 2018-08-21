export interface IOnuPingResponse {
  TxPkts: number;
  RxPkts: number;
  LostPkts: number;
  LostPktRatio: number;
  MinDelay: number;
  MaxDelay: number;
  AvgDelay: number;
}
