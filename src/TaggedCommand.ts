import { ReplaySubject, of } from 'rxjs';
import { filter, takeWhile, concatMap, reduce } from 'rxjs/operators';

import DataStream from './DataStream';
import debug from './debug';

export class TaggedCommand {
  private data$ = new ReplaySubject(1);

  /**
   *
   * @param dataStream data stream reference
   * @param ctag command tag
   */
  constructor(private dataStream: DataStream, public ctag: string) { }

  write(sentence: string) {
    this.dataStream.write(sentence);

    /**
     * anm2000 can send data in multiple responses
     * this code catch all responses, reduce them and emits ahead
     */
    this.dataStream.data.pipe(
      filter(result => typeof result === typeof {} && result.ctag === this.ctag.toString()),
      concatMap(result => result.terminator === ';' ? of(result, null) : of(result)),
      takeWhile(result => result),
      reduce((acc, currentValue) => {
        debug('Reducing response');
        currentValue.values.unshift(acc.values);
        return currentValue;
      }),
    ).subscribe(res => {
      this.data$.next(res);
      this.data$.complete();
    });
  }

  get read() {
    return this.data$;
  }
}
