/**
 * Batches the items of an async iterable into fixed-size arrays, yielding each
 * batch as soon as it fills. The final batch may be smaller than `size` (the
 * remainder is flushed when the source ends).
 *
 * Being itself an async generator, it preserves backpressure: it only pulls
 * from `source` when the consumer asks for the next batch, so a slow consumer
 * naturally throttles a fast producer instead of buffering everything.
 *
 * @typeParam T - The item type of the source iterable
 * @param source - The async iterable to batch (e.g. an async generator)
 * @param size - Maximum items per batch; must be a positive integer
 * @returns An async generator of non-empty arrays, each of length `size` except
 *   possibly the last
 * @throws RangeError if `size` is less than 1
 */
export async function* chunkAsyncIterable<T>(
  source: AsyncIterable<T>,
  size: number
): AsyncGenerator<T[]> {
  if (size < 1) {
    throw new RangeError(`chunkAsyncIterable: size must be >= 1, got ${size}`);
  }

  let batch: T[] = [];
  for await (const item of source) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}
