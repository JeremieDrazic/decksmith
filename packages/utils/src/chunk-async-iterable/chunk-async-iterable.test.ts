import { describe, expect, it } from 'vitest';

import { chunkAsyncIterable } from './chunk-async-iterable.js';

async function* from<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) {
    yield item;
  }
}

async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const value of source) {
    out.push(value);
  }
  return out;
}

describe('chunkAsyncIterable', () => {
  it('batches into fixed-size arrays and flushes a smaller final batch', async () => {
    const batches = await collect(chunkAsyncIterable(from([1, 2, 3, 4, 5]), 2));
    expect(batches).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('produces equal batches with no remainder when the count divides evenly', async () => {
    const batches = await collect(chunkAsyncIterable(from([1, 2, 3, 4]), 2));
    expect(batches).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('yields a single partial batch when size exceeds the item count', async () => {
    const batches = await collect(chunkAsyncIterable(from([1, 2, 3]), 10));
    expect(batches).toEqual([[1, 2, 3]]);
  });

  it('yields nothing for an empty source', async () => {
    const batches = await collect(chunkAsyncIterable(from<number>([]), 3));
    expect(batches).toEqual([]);
  });

  it('throws RangeError when size is less than 1', async () => {
    await expect(collect(chunkAsyncIterable(from([1, 2]), 0))).rejects.toThrow(RangeError);
  });
});
