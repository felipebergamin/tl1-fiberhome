import debug from './debug';
import DataStream from './DataStream';
import { TaggedCommand } from './TaggedCommand';
import { processParams } from './utils';
import * as TL1 from './interfaces';

export class TL1Client {
  /** socket */
  private dataStream: DataStream;

  /**
   *
   * @param server tl1 server address
   * @param port tl1 port to connect (default 3337)
   */
  constructor(private server: string, private port: number = 3337, private timeout = 5000) {
    debug('TL1Client.new', server, port);
    this.dataStream = new DataStream();
  }

  get rawData() {
    return this.dataStream.rawData;
  }

  connect() {
    debug('TL1Client:Connecting on Socket %s:%d', this.server, this.port);

    return this.dataStream.connect({ host: this.server, port: this.port });
  }

  login(login: string, pwd: string, ctag = Date.now()) {
    const sentence = `LOGIN:::${ctag}::UN=${login},PWD=${pwd};`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  logout(ctag = Date.now()) {
    const sentence = `LOGOUT:::${ctag}::;`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  getOpticalModuleInformation(params: TL1.IListOpticalModuleDDMParams, ctag = Date.now()) {
    const targetIdAcceptParams = [
      "ONUIP", "OLTID", "PONID", "ONUIDTYPE", "ONUID", "PORTID", "PEERFLAG",
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-OMDDM::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IListOMDDMResponse>(sentence, this.dataStream, ctag.toString()).read;
  }

  handshake(ctag = Date.now()) {
    const sentence = `SHAKEHAND:::${ctag}::;`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  listUnregisteredONUs(params: TL1.IListUnregOnuParams, ctag = Date.now().toString()) {
    const acceptParams = ['OLTID', 'PONID'];
    const targetIdentifier = processParams(acceptParams, params);
    const sentence = `LST-UNREGONU::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.ILstUnregOnuResponse>(sentence, this.dataStream, ctag).read;
  }

  addOnu(params: TL1.IAddOnuParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      "OLTID", "PONID",
    ];
    const datablocksAcceptParams = [
      "AUTHTYPE", "ONUID", "PWD", "ONUNO", "NAME", "DESC", "ONUTYPE",
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);

    const sentence = `ADD-ONU::${targetIdentifier}:${ctag}::${datablocks};`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  /**
   * delete an authorized ONU from system
   */
  deleteOnu(params: TL1.IDelOnuParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'OLTID', 'PONID',
    ];
    const datablocksAcceptParams = [
      'ONUIDTYPE', 'ONUID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);
    const sentence = `DEL-ONU::${targetIdentifier}:${ctag}::${datablocks};`;
    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  configureLanPortVlan(params: TL1.IConfigureLanPort, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      "ONUIP", "OLTID", "PONID", "ONUIDTYPE", "ONUID", "ONUPORT",
    ];
    const datablocksAcceptParams = [
      "SVLAN", "CVLAN", "SCOS", "CCOS",
    ];

    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);

    const sentence = `CFG-LANPORTVLAN::${targetIdentifier}:${ctag}::${datablocks};`;
    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  delLanPortVlan(params: TL1.IDelLanPortVlan, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID', 'ONUPORT',
    ];

    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `DEL-LANPORTVLAN::${targetIdentifier}:${ctag}::;`;
    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  configureONUBandwidth(params: TL1.IConfigureLanPortBW, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      "ONUIP", "OLTID", "PONID", "ONUIDTYPE", "ONUID", "ONUPORT",
    ];
    const datablocksAcceptParams = [
      "UPBW", "DOWNBW",
    ];

    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);

    const sentence = `CFG-ONUBW::${targetIdentifier}:${ctag}::${datablocks};`;
    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  configureWanConnection(params: TL1.IConfigureWanParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      "ONUIP", "OLTID", "PONID", "ONUIDTYPE", "ONUID",
    ];
    const datablocksAcceptParams = [
      "STATUS", "MODE", "CONNTYPE", "VLAN", "COS", "QOS", "NAT", "IPMODE", "WANIP",
      "WANMASK", "WANGATEWAY", "MASTERDNS", "SLAVEDNS", "PPPOEPROXY", "PPPOEUSER",
      "PPPOEPASSWD", "PPPOENAME", "PPPOEMODE", "UPORT", "SSID", "WANSVC",
      "UPPROFILENAME", "DOWNPROFILENAME",
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);
    const sentence = `SET-WANSERVICE::${targetIdentifier}:${ctag}::${datablocks};`;
    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  queryOnuState(params: TL1.IQueryOnuState, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-ONUSTATE::${targetIdentifier}:${ctag}::;`;
    return this.runTaggedCommand<TL1.IQueryOnuStateResponse>(sentence, this.dataStream, ctag).read;
  }

  ping(params: TL1.IOnuPingParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID',
    ];
    const datablocksAcceptParams = ['IP'];

    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);
    const sentence = `PING::${targetIdentifier}:${ctag}::${datablocks};`;

    return this.runTaggedCommand<TL1.IOnuPingResponse>(sentence, this.dataStream, ctag).read;
  }

  queryNEInformation(params: TL1.IQueryNeInformationParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-DEVINFO::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IQueryNeInformationResponse>(sentence, this.dataStream, ctag).read;
  }

  queryCardInformation(params: TL1.IQueryCardInformationParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID', 'BOARDID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-BRDINFO::${targetIdentifier}:${ctag}::;`;
    return this.runTaggedCommand<TL1.IQueryCardInformationResponse>(sentence, this.dataStream, ctag).read;
  }

  queryPonInfo(params: TL1.IQueryPonInfoParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'OLTID', 'PONID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-PONINFO::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IQueryPonInfoResponse>(sentence, this.dataStream, ctag).read;
  }

  resetOnu(params: TL1.IResetOnuParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID', 'PORTID',
    ];
    const datablocksAcceptParams = ['RESETTYPE'];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const datablocks = processParams(datablocksAcceptParams, params);
    const sentence = `RESET-ONU::${targetIdentifier}:${ctag}::${datablocks};`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag).read;
  }

  queryOltInformation(params: { OLTID: string }, ctag = Date.now().toString()) {
    const targetIdAcceptParams = ['OLTID'];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-DEVICE::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IQueryOltInformationResponse>(sentence, this.dataStream, ctag).read;
  }

  listOnu(params: TL1.IListONUParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-ONU::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IListONUResponse>(sentence, this.dataStream, ctag).read;
  }

  listOnuLanInfo(params: TL1.IListOnuLanInfoParams, ctag = Date.now().toString()) {
    const targetIdAcceptParams = [
      'ONUIP', 'OLTID', 'PONID', 'ONUIDTYPE', 'ONUID', 'ONUPORT',
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-ONULANINFO::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand<TL1.IListOnuLanInfoResponse>(sentence, this.dataStream, ctag).read;
  }

  disconnect() {
    this.dataStream.closeSocket();
  }

  private runTaggedCommand<T>(tl1Command: string, dataStream: DataStream, ctag: string): TaggedCommand<T> {
    const exec = new TaggedCommand<T>(dataStream, ctag, this.timeout);
    exec.write(tl1Command);

    return exec;
  }
}
