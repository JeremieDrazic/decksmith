# ADR-0007: Job Queue with BullMQ and Redis

**Last Updated:** 2026-01-10 **Status:** Active **Context:** Decksmith

---

## Context

Decksmith requires **asynchronous job processing** for operations that are too slow for synchronous
HTTP requests:

1. **PDF Generation**: High-quality proxy sheets take 30-60+ seconds to generate (downloading
   images, rendering layouts, uploading to storage)
2. **Scryfall Bulk Data Sync**: Daily import of ~100k cards with pricing data (~150 MB JSON file)
3. **Future Features**: Email notifications, collection import/export, batch operations

**Key requirements:**

- Jobs must survive API server restarts (persistent queue)
- Failed jobs must be retried with exponential backoff
- Monitor job status (pending, active, completed, failed)
- Support job prioritization (Pro users get priority)
- Schedule recurring jobs (daily Scryfall sync at 3 AM UTC)
- Rate limiting to prevent abuse

**Question:** Which job queue system should we use?

### Option 1: BullMQ + Redis

**BullMQ** is a Node.js job queue library built on Redis.

**Benefits:**

- Mature, battle-tested library (used by major companies)
- Built-in retry logic with exponential backoff
- Job prioritization (priority queue)
- Delayed jobs and cron-based scheduling
- Rate limiting built-in
- Bull Board dashboard (visual monitoring)
- Supports distributed workers (horizontal scaling)
- TypeScript-first with excellent type safety
- Active development and maintenance

**Costs:**

- Requires Redis instance (additional infrastructure)
- More complex setup than simple polling
- Redis adds operational overhead (monitoring, backups)

**Infrastructure:**

- **Dev:** Redis via Docker Compose (free, local)
- **Prod:** Upstash Redis serverless (~$5-10/month) or Redis Cloud free tier (up to 30MB)

### Option 2: Supabase Edge Functions + pg_cron

**Supabase** offers Edge Functions (serverless) + `pg_cron` (Postgres-based cron).

**Benefits:**

- No additional infrastructure (uses existing Supabase)
- Edge Functions are serverless (auto-scaling)
- pg_cron built into Supabase Postgres
- Simpler deployment (no Redis to manage)

**Costs:**

- **30-second timeout limit** on Edge Functions (too short for complex PDFs with 100+ cards)
- **No native job queue** (pg_cron is just scheduling, not queuing)
- **No automatic retry logic** (must implement manually)
- **No monitoring dashboard** (hard to debug failed jobs)
- **Cold starts** (Edge Functions have ~200ms startup delay)
- **Limited concurrency** (Supabase free tier: 500k Edge Function invocations/month)

**Workarounds:**

- Split long jobs into smaller chunks (complex, error-prone)
- Implement custom retry logic with database polling (reinventing BullMQ)
- Use webhooks for job status updates (adds complexity)

### Option 3: Simple Database Polling

**Custom job queue** using Postgres table + worker process polling for jobs.

**Example schema:**

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,  -- 'pdf-generation', 'scryfall-sync'
  payload JSONB,
  status TEXT DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Worker pseudocode:**

```typescript
setInterval(async () => {
  const job = await prisma.job.findFirst({
    where: { status: 'pending' },
    orderBy: { created_at: 'asc' },
  });

  if (job) {
    await processJob(job);
  }
}, 5000); // Poll every 5 seconds
```

**Benefits:**

- No additional infrastructure (uses existing Postgres)
- Simple to understand and debug
- Full control over implementation

**Costs:**

- **Reinventing the wheel:** Retry logic, rate limiting, scheduling must be built from scratch
- **No monitoring dashboard:** Must build custom admin UI
- **Polling overhead:** Constant database queries (inefficient)
- **No job prioritization:** Complex to implement
- **No distributed workers:** Scaling requires manual orchestration
- **Race conditions:** Multiple workers might pick same job (needs locking)

---

## Current Decision

We will use **BullMQ + Redis** for asynchronous job processing.

**Primary use cases:**

1. **PDF Generation** (worker package)
2. **Scryfall Bulk Data Sync** (worker package)
3. **Future:** Email notifications, batch operations

**Infrastructure:**

- **Development:** Redis in Docker Compose (local)
- **Production:** Upstash Redis serverless (free tier: 10k commands/day, upgrade ~$5-10/month if
  needed)

**Job Queue Configuration:**

```typescript
// apps/worker/src/queue.ts
import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

// PDF Generation Queue
export const pdfQueue = new Queue('pdf-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5s delay, doubles each retry
    },
    removeOnComplete: 100, // Keep last 100 successful jobs
    removeOnFail: 500, // Keep last 500 failed jobs (debugging)
  },
});

// Scryfall Sync Queue (daily cron)
export const scryfallSyncQueue = new Queue('scryfall-sync', {
  connection: redisConnection,
});

// Schedule daily sync at 3 AM UTC
await scryfallSyncQueue.add(
  'sync',
  {},
  {
    repeat: { pattern: '0 3 * * *' }, // Cron expression
    removeOnComplete: 10, // Keep last 10 successful syncs
    removeOnFail: 50, // Keep last 50 failures
  }
);

// PDF Worker
export const pdfWorker = new Worker(
  'pdf-generation',
  async (job) => {
    const { deckId, userId, config } = job.data;

    // 1. Fetch deck cards from database
    // 2. Download high-res images from Scryfall
    // 3. Generate PDF with PDFKit
    // 4. Upload to Supabase Storage
    // 5. Notify user (email or in-app)

    return { pdfUrl: 'https://...' };
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 PDFs concurrently
    limiter: {
      max: 10, // Max 10 jobs per...
      duration: 60000, // ...minute (rate limiting)
    },
  }
);

// Scryfall Sync Worker
export const scryfallWorker = new Worker(
  'scryfall-sync',
  async (job) => {
    // 1. Fetch Scryfall bulk data metadata
    // 2. Download JSON (~150 MB)
    // 3. Upsert cards to database (batched)
    // 4. Log completion
  },
  {
    connection: redisConnection,
    concurrency: 1, // Only one sync at a time
  }
);
```

**Job Creation (API):**

```typescript
// apps/api/src/routes/pdf.ts
import { pdfQueue } from '@decksmith/worker/queue';

fastify.post(
  '/api/decks/:id/pdf',
  {
    preHandler: [fastify.authenticate],
  },
  async (req, reply) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;
    const config = req.body; // PDF config (paper, grid, dpi, etc.)

    // Add job to queue
    const job = await pdfQueue.add(
      'generate-pdf',
      {
        deckId,
        userId,
        config,
      },
      {
        priority: req.user.tier === 'pro' ? 1 : 10, // Pro users get priority
      }
    );

    return {
      jobId: job.id,
      status: 'pending',
      message: 'PDF generation started. You will be notified when ready.',
    };
  }
);

// Poll job status
fastify.get(
  '/api/jobs/:id',
  {
    preHandler: [fastify.authenticate],
  },
  async (req, reply) => {
    const { id: jobId } = req.params;

    const job = await pdfQueue.getJob(jobId);

    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      jobId: job.id,
      status: state, // 'waiting', 'active', 'completed', 'failed'
      progress, // 0-100%
      result: state === 'completed' ? await job.returnvalue : null,
    };
  }
);
```

**Bull Board Dashboard (Monitoring):**

```typescript
// apps/api/src/plugins/bull-board.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';

const serverAdapter = new FastifyAdapter();

createBullBoard({
  queues: [new BullMQAdapter(pdfQueue), new BullMQAdapter(scryfallSyncQueue)],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
fastify.register(serverAdapter.registerPlugin(), {
  prefix: '/admin/queues',
});

// Access dashboard at: http://localhost:3000/admin/queues
```

---

## Rationale

### Why BullMQ Fits Decksmith's Values

1. **Separation of concerns:**
   - API layer creates jobs (orchestration)
   - Worker package processes jobs (business logic)
   - Clear boundary between HTTP and background work

2. **Explicit data contracts:**
   - Job payload defined with Zod schemas (`packages/schema`)
   - TypeScript types ensure type safety across API ↔ Worker boundary

3. **Deterministic behavior:**
   - Jobs are persistent (survive restarts)
   - Retry logic is predictable (exponential backoff)
   - FIFO queue guarantees order (with priority support)

4. **Maintainability:**
   - Bull Board dashboard provides visual monitoring
   - Clear job state transitions (waiting → active → completed/failed)
   - Well-documented API, large community

5. **Clarity over cleverness:**
   - BullMQ is a proven solution (not reinventing queuing)
   - Standard patterns for job processing (no custom polling)
   - Easy to onboard new developers (familiar job queue pattern)

### Why NOT Supabase Edge Functions

**30-second timeout is a hard blocker** for PDF generation:

- Downloading 100+ high-res images from Scryfall: ~20-30 seconds
- Rendering PDF with PDFKit: ~10-20 seconds
- Uploading to Supabase Storage: ~5-10 seconds
- **Total:** 35-60+ seconds (exceeds 30s limit)

**Workarounds are too complex:**

- Splitting job into chunks (download → render → upload as separate Edge Functions) adds
  orchestration complexity
- Custom retry logic requires database polling (reinventing BullMQ)
- No monitoring dashboard (hard to debug failures)

**Verdict:** Edge Functions are great for fast API endpoints (<30s), but not suitable for
long-running jobs.

### Why NOT Simple Database Polling

**Reinventing the wheel:**

- Retry logic: Must implement exponential backoff manually
- Rate limiting: Must track job attempts and throttle
- Scheduling: Must implement cron-like logic
- Monitoring: Must build custom admin UI
- Distributed workers: Must implement locking to prevent race conditions

**Polling overhead:**

- Constant `SELECT * FROM jobs WHERE status = 'pending'` queries
- Inefficient (polling every 5 seconds wastes database resources)

**BullMQ solves all of these problems out-of-the-box.**

**Verdict:** Only consider custom polling if Redis is absolutely impossible (not the case here).

---

## Trade-offs

**Benefits:**

- **Handles long-running jobs:** No timeout limits (PDF generation can take 60+ seconds)
- **Automatic retries:** Failed jobs retried with exponential backoff (resilience)
- **Monitoring dashboard:** Bull Board provides visual job queue status
- **Job prioritization:** Pro users can get faster PDF generation
- **Rate limiting:** Prevent abuse (max 10 PDFs/minute per user)
- **Scheduled jobs:** Daily Scryfall sync with cron expressions
- **Horizontal scaling:** Add more worker processes to handle load
- **TypeScript-first:** Excellent type safety and developer experience

**Costs:**

- **Additional infrastructure:** Requires Redis instance (Docker Compose dev, Upstash/Redis Cloud
  prod)
- **Operational overhead:** Redis needs monitoring, backups (though Upstash handles this)
- **Learning curve:** Developers must learn BullMQ API (minimal, well-documented)
- **Cost:** ~$5-10/month for Upstash Redis in production (free tier may suffice for MVP)

**Risks:**

- **Redis downtime:** If Redis goes down, job queue stops working
  - **Mitigation:** Use managed Redis (Upstash) with high uptime SLA
  - **Fallback:** Jobs are persistent in Redis, restart worker when Redis recovers
- **Memory usage:** Redis stores all jobs in memory (pending, active, completed, failed)
  - **Mitigation:** Configure `removeOnComplete` and `removeOnFail` to prune old jobs
  - **Monitoring:** Track Redis memory usage, scale up if needed
- **Job data size:** Large payloads (e.g., full deck data) bloat Redis memory
  - **Mitigation:** Store minimal data in job payload (e.g., `deckId`, not full deck object)
  - **Worker fetches full data from database** (Redis only stores job metadata)

---

## Evolution History

### 2026-01-10: Initial decision

- Chose BullMQ + Redis for asynchronous job processing (PDF generation, Scryfall sync)
- Rejected Supabase Edge Functions due to 30-second timeout limit
- Rejected custom database polling due to complexity (reinventing the wheel)
- Infrastructure: Docker Compose (dev), Upstash Redis serverless (prod)
- Monitoring: Bull Board dashboard for visual job queue status
- Rate limiting: 10 jobs/minute per user (prevent abuse)
- Job prioritization: Pro users get priority queue (future monetization)

---

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [BullMQ GitHub](https://github.com/taskforcesh/bullmq)
- [Bull Board (Monitoring Dashboard)](https://github.com/felixmosh/bull-board)
- [Upstash Redis (Serverless)](https://upstash.com/)
- [Redis Cloud Free Tier](https://redis.com/try-free/)
- [Supabase Edge Functions Limits](https://supabase.com/docs/guides/functions/limits)
- Related specs: [PDF Generation](../specs/pdf-generation.md),
  [Card Search](../specs/card-search.md) (Scryfall sync)
- Related ADRs: ADR-0005 (Package boundaries: worker package owns job processing)
