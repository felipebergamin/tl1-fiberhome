import { Socket, isIP } from 'net';
import { Subject, Observable, fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';
import * as Debug from 'debug';

import { CONNECTION } from './constants';
import debug from './debug';
import * as parser from './parser';

const parserDebug = Debug('node-tl1-fiberhome:parser');

/** handles socket operations */
export default class DataStream {

  /** tcp socket */
  private socket: Socket;

  /** flag indicating the connection state */
  private state = CONNECTION.CLOSED;

  /** emit parsed data */
  private data$: Subject<any>;

  /** emit raw data (Buffer) received on Socket */
  private rawData$: Observable<Buffer>;

  constructor() {
    debug('new DataStream');

    this.socket = new Socket();
    this.rawData$ = new Observable();
    this.data$ = new Subject();

    this.socket.on('end', () => {
      debug('DataStream Socket End');
      this.endObservables();
      this.state = CONNECTION.CLOSED;
    });

    this.socket.on('error', (err) => {
      debug('DataStream Socket Error');
      this.data$.error(err);
    });
  }

  get data(): Subject<any> {
    return this.state === CONNECTION.CONNECTED ? this.data$ : null;
  }

  get rawData(): Observable<Buffer> {
    return this.state === CONNECTION.CONNECTED ? this.rawData$ : null;
  }

  /**
   *
   * @param socketConfs host and port to connect
   * @param timeout timeout config (in ms)
   */
  connect(socketConfs: { host: string, port: number }) {
    debug(`DataStream:Connecting socket %s`, JSON.stringify(socketConfs));
    this.state = CONNECTION.CONNECTING;

    return new Promise((resolve, reject) => {
      if (!isIP(socketConfs.host)) {
        throw new Error(`Invalid IP address ${socketConfs.host}`);
      }

      try {
        this.socket.connect(socketConfs, (...connectionArgs) => {
          debug('Socket connected %s', JSON.stringify(connectionArgs));

          this.rawData$ = fromEvent(this.socket, 'data');
          /* this.rawData$.subscribe(rawData => {
            this.data$.next(parser.parse(rawData.toString().replace(/-{5,}/g, '@'.repeat(40))));
          }); */

          /**
           * parse responses with one or more sentences
           * - inspired by trakkasure/mikronode code
           * thank you :D
           */
          this.rawData$.pipe(
            scan((last, curr) => {
              parserDebug('Last Buffer', last.toString());
              parserDebug('Current Buffer', curr.toString());
              let dataBuffer = Buffer.concat([last, curr]);
              const indexOnBuffer = 0;
              let endOfSentence = 0;
              parserDebug('Data on Buffer (%d bytes):', dataBuffer.length, dataBuffer.toString());

              while (dataBuffer.length > 0) {
                endOfSentence = dataBuffer.toString().search(/(;|>)/);
                parserDebug('Terminator of Next Sentence: %d \t Buffer Length %d',
                  endOfSentence, dataBuffer.length);

                if (endOfSentence === -1) { break; }

                const sentence = dataBuffer.slice(indexOnBuffer, endOfSentence + 1);
                this.data$.next(parser.parse(sentence.toString().replace(/-{5,}/g, '@'.repeat(40))));
                // indexOnBuffer = endOfSentence + 1;

                parserDebug('Reached End of Sentence on index %d: ', endOfSentence, sentence.toString());
                dataBuffer = dataBuffer.slice(endOfSentence + 1, dataBuffer.length);
                parserDebug('Remaining %d bytes on buffer', dataBuffer.length);
                // this.data$.next(parser.parse(sentence.toString().replace(/-{5,}/g, '@'.repeat(40))));
              }

              return dataBuffer;
            }, Buffer.from([])),
          ).subscribe();

          /* this.socket.on('data', (data) => {
            const strdata = data.toString();
            debug('onData', data.toString());

            this.rawData$.next(data);
            this.data$.next(parser.parse(strdata.replace(/-{5,}/g, '@'.repeat(40))));
          }); */
          this.state = CONNECTION.CONNECTED;

          return resolve(connectionArgs);
        });
      } catch (err) {
        debug('Error on Socket Connect', err);
        this.state = CONNECTION.ERROR;
        return reject(err);
      }

      this.data$.subscribe(null, (err) => {
        this.state = CONNECTION.ERROR;
        this.closeSocket(err);
        reject(err);
      });
    });
  }

  closeSocket(err?) {
    debug('Closing socket');
    this.endObservables();
    err ? this.socket.destroy(err) : this.socket.end();
  }

  write(tl1Sentence: string) {
    if (this.state !== CONNECTION.CONNECTED) {
      debug(`Socket not connected`);
      throw new Error(`Can't write: Socket is closed`);
    }
    debug(`Writing ${tl1Sentence}`);

    if (typeof tl1Sentence !== typeof '') {
      debug('Invalid TL1 Sentence: %s', tl1Sentence);
      return;
    }
    if (!this.socket || !(this.state === CONNECTION.CONNECTED)) {
      debug(`Can't write: Socket not connected`);
      return;
    }

    this.socket.write(tl1Sentence);
  }

  private endObservables() {
    this.data$.complete();
  }
}
