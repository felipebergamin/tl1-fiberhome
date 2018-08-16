import debug from './debug';
import DataStream from './DataStream';
import { TaggedCommand } from './TaggedCommand';
import { processParams } from './utils';

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

  connect() {
    debug('TL1Client:Connecting on Socket %s:%d', this.server, this.port);

    return this.dataStream.connect({host: this.server, port: this.port});
  }

  login(login: string, pwd: string, ctag = Date.now()) {
    const sentence = `LOGIN:::${ctag}::UN=${login},PWD=${pwd};`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  logout(ctag = Date.now()) {
    const sentence = `LOGOUT:::${ctag}::;`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  getOpticalModuleInformation(params, ctag = Date.now()) {
    const targetIdAcceptParams = [
      "ONUIP", "OLTID", "PONID", "ONUIDTYPE", "ONUID", "PORTID", "PEERFLAG",
    ];
    const targetIdentifier = processParams(targetIdAcceptParams, params);
    const sentence = `LST-OMDDM::${targetIdentifier}:${ctag}::;`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  handshake(ctag = Date.now()) {
    const sentence = `SHAKEHAND:::${ctag}::;`;

    return this.runTaggedCommand(sentence, this.dataStream, ctag.toString()).read;
  }

  disconnect() {
    this.dataStream.closeSocket();
  }

  private runTaggedCommand(tl1Command: string, dataStream: DataStream, ctag: string): TaggedCommand {
    const exec = new TaggedCommand(dataStream, ctag, this.timeout);
    exec.write(tl1Command);

    return exec;
  }
}
