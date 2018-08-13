import { Socket, isIP } from 'net';
import { Subject } from 'rxjs';

import { CONNECTION } from './constants';
import debug from './debug';

/** handles socket operations */
export default class DataStream {

  /** tcp socket */
  private socket: Socket;

  /** flag indicating the connection state */
  private state = CONNECTION.CLOSED;

  private data$: Subject<Buffer>;

  constructor() {
    debug('new DataStream');

    this.socket = new Socket();

    this.socket.on('end', () => {
      debug('DataStream Socket End');
      this.data$.complete();
      this.state = CONNECTION.CLOSED;
    });

    this.socket.on('error', (err) => {
      debug('DataStream Socket Error');
      this.data$.error(err);
    });
  }

  /**
   *
   * @param socketConfs host and port to connect
   * @param timeout timeout config (in ms)
   */
  connect(socketConfs: {host: string, port: number}, timeout = 5000) {
    debug(`Connect socket %s`, JSON.stringify(socketConfs));
    this.state = CONNECTION.CONNECTING;

    return new Promise((resolve, reject) => {
      if (!isIP(socketConfs.host)) {
        throw new Error(`Invalid IP address ${socketConfs.host}`);
      }

      try {
        this.socket.connect(socketConfs, (...connectionArgs) => {
          debug('Socket connected %s', JSON.stringify(connectionArgs));

          this.socket.on('data', (data) => this.data$.next(data));

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
    this.socket.setTimeout(t, (timeoutError) => {
      if (!(this.state === CONNECTION.CONNECTED)) {
        this.data$.error(`Timeout error: ${JSON.stringify(timeoutError)}`);
        debug(`DataStream timeout error`);
      }
    });
  }

  write(tl1Sentence: string) {
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
}
