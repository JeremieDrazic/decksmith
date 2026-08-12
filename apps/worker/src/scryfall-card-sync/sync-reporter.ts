import { clearLine as clearTerminalLine, cursorTo } from 'node:readline';
import { styleText } from 'node:util';

import type { BulkDataInfo } from '@decksmith/scryfall';
import { ZodError } from 'zod';

// Colorize and render the live progress line only on a TTY. A headless prod
// worker (BullMQ, no terminal) then gets plain one-line logs and never emits
// cursor/clear control codes into its log stream.
const IS_TTY = process.stdout.isTTY === true;
const RENDER_THROTTLE_MS = 150;

const numberFmt = new Intl.NumberFormat('en-US');

function paint(format: Parameters<typeof styleText>[0], text: string): string {
  return IS_TTY ? styleText(format, text) : text;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(0)} MB`;
}

function isoDay(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

// Turn a validation failure into a short field list ("oracle_id, cmc") instead
// of dumping the whole ZodError. `error` is unknown by contract; we only special-
// case ZodError and fall back to nothing.
function invalidFields(error: unknown): string | null {
  if (error instanceof ZodError) {
    const fields = error.issues.map((issue) => issue.path.join('.')).filter(Boolean);
    return fields.length > 0 ? fields.join(', ') : null;
  }
  return null;
}

/**
 * Owns the worker's stdout during one card sync. Emits concise, human-readable
 * milestone logs (colored on a TTY, plain in prod) and, on a TTY only, a live
 * in-place progress line. The dump is streamed with no known total, so progress
 * is an honest running count (prints/cards/skipped + elapsed + rate), not a fake
 * percentage.
 *
 * All output routes through here so the progress line and discrete log messages
 * never garble each other: a message clears the line, prints, then the progress
 * re-renders on the next chunk. Line control uses Node's `readline` helpers
 * rather than raw ANSI escapes.
 *
 * @returns A reporter to drive from `runScryfallCardSync`
 */
export function createSyncReporter() {
  const startedAt = Date.now();
  let prints = 0;
  let cards = 0;
  let skipped = 0;
  let lastRenderAt = 0;

  function clearLine(): void {
    if (IS_TTY) {
      cursorTo(process.stdout, 0);
      clearTerminalLine(process.stdout, 0);
    }
  }

  function renderProgress(force: boolean): void {
    if (!IS_TTY) {
      return;
    }
    const now = Date.now();
    if (!force && now - lastRenderAt < RENDER_THROTTLE_MS) {
      return;
    }
    lastRenderAt = now;

    const elapsedMs = now - startedAt;
    const rate = elapsedMs > 0 ? Math.round(prints / (elapsedMs / 1000)) : 0;
    const line = `▸ ${numberFmt.format(prints)} prints · ${numberFmt.format(cards)} cards · ${numberFmt.format(skipped)} skipped · ${formatDuration(elapsedMs)} · ${rate}/s`;
    clearLine();
    process.stdout.write(paint('cyan', line));
  }

  return {
    /** Announce the run once the dump metadata is known. */
    start(info: BulkDataInfo): void {
      clearLine();
      console.info(
        `${paint(['cyan', 'bold'], '⏳ syncing default_cards')}${paint('dim', ` (dump ${isoDay(info.updatedAt)}, ${formatMegabytes(info.size)})…`)}`
      );
    },

    /** Record one upserted chunk: its print count and how many new cards it held. */
    recordChunk(printsInChunk: number, newCards: number): void {
      prints += printsInChunk;
      cards += newCards;
      renderProgress(false);
    },

    /** Record one skipped invalid row, with a concise field summary. */
    recordInvalid(index: number, error: unknown): void {
      skipped += 1;
      const fields = invalidFields(error);
      clearLine();
      console.warn(
        `${paint('yellow', `⚠ row ${numberFmt.format(index)} skipped`)}${paint('dim', fields ? ` — invalid: ${fields}` : '')}`
      );
      renderProgress(true);
    },

    /** The dump is unchanged since the last successful sync — nothing to do. */
    unchanged(updatedAt: string): void {
      console.info(paint('dim', `↩ dump unchanged (${isoDay(updatedAt)}) — skipping`));
    },

    /** Record the post-load aggregation pass: how many card rows it refreshed. */
    aggregated(count: number): void {
      clearLine();
      console.info(
        `${paint(['cyan', 'bold'], '🧩 aggregated')}${paint('dim', ` — ${numberFmt.format(count)} cards refreshed`)}`
      );
    },

    /** Final success summary. */
    done(): void {
      clearLine();
      console.info(
        `${paint(['green', 'bold'], '✅ sync done')}${paint('dim', ` — ${numberFmt.format(cards)} cards, ${numberFmt.format(prints)} prints, ${numberFmt.format(skipped)} skipped, ${formatDuration(Date.now() - startedAt)}`)}`
      );
    },

    /** Final failure line (the error is re-thrown by the caller for BullMQ). */
    failed(message: string): void {
      clearLine();
      console.error(`${paint(['red', 'bold'], '✖ sync failed')}${paint('dim', ` — ${message}`)}`);
    },
  };
}
