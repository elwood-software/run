// modified from and (c) https://deno.land/x/short_uuid@v3.0.0-rc1/mod.ts?source

class ShortUniqueId {
  counter = 0;
  dict = ["t", "j", "k"];

  dictIndex: number = 0;
  dictRange: number[] = [];
  lowerBound: number = 0;
  upperBound: number = 0;
  dictLength: number = 2;

  seq(): string {
    return this.sequentialUUID();
  }

  /**
   * Generates UUID based on internal counter that's incremented after each ID generation.
   * @alias `const uid = new ShortUniqueId(); uid.seq();`
   */
  sequentialUUID(): string {
    let counterDiv: number;
    let counterRem: number;
    let id: string = "";

    counterDiv = this.counter;

    /* tslint:disable no-constant-condition */
    while (true) {
      counterRem = counterDiv % this.dictLength;
      counterDiv = Math.trunc(counterDiv / this.dictLength);
      id += this.dict[counterRem];
      if (counterDiv === 0) {
        break;
      }
    }
    /* tslint:enable no-constant-condition */
    this.counter += 1;

    return id;
  }
}

// singleton
const suid = new ShortUniqueId();

export function shortId(prefix = ""): string {
  return [prefix, suid.seq()].join("--");
}
