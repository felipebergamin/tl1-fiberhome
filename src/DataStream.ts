import { Socket, isIP } from 'net';
import { Subject, Observable, fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

import { CONNECTION } from './constants';
import debug from './debug';
import * as parser from './parser';

/** handles socket operations */
export default class DataStream {

  /** tcp socket */
  private socket: Socket;

  /** flag indicating the connection state */
  private state = CONNECTION.CLOSED;

  private data$: Subject<any>;

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

    this.socket.on('timeout', (timeoutError) => {
      this.data$.error(`Timeout error: ${JSON.stringify(timeoutError)}`);
      debug(`DataStream timeout error`);
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
  connect(socketConfs: { host: string, port: number }, timeout = 5000) {
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

          /* parse responses with one or more sentences */
          this.rawData$.pipe(
            scan((last, curr) => {
              debug('Last Buffer', last.toString());
              debug('Current Buffer', curr.toString());
              let dataBuffer = Buffer.concat([last, curr]);
              const indexOnBuffer = 0;
              let endOfSentence = 0;
              debug('Data on Buffer (%d bytes):', dataBuffer.length, dataBuffer.toString());

              while (dataBuffer.length > 0) {
                endOfSentence = dataBuffer.toString().search(/(;|>)/);
                debug('Terminator of Next Sentence: %d \t Buffer Length %d',
                  endOfSentence, dataBuffer.length);

                if (endOfSentence === -1) { break; }

                const sentence = dataBuffer.slice(indexOnBuffer, endOfSentence + 1);
                this.data$.next(parser.parse(sentence.toString().replace(/-{5,}/g, '@'.repeat(40))));
                // indexOnBuffer = endOfSentence + 1;

                debug('Reached End of Sentence on index %d: ', endOfSentence, sentence.toString());
                dataBuffer = dataBuffer.slice(endOfSentence + 1, dataBuffer.length);
                debug('Remaining %d bytes on buffer', dataBuffer.length);
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
          this.setTimeout(timeout);

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
    err ? this.socket.destroy(err) : this.socket.end();
  }

  setTimeout(t: number) {
    debug('Set tocket timeout', t);
    this.socket.setTimeout(t);
  }

  write(tl1Sentence: string) {
    if (this.state !== CONNECTION.CONNECTED) {
      debug(`Socket not connected`);
      return;
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