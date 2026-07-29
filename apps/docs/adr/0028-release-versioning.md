# ADR-0028: Release & Versioning — semantic-release in the deploy pipeline

**Last Updated:** 2026-07-29  
**Status:** Active  
**Context:** Decksmith

---

## Context

Decksmith deploys on every push to `main` (CI → deploy, ADR-0026). Until now the only identifier of
a deployment was the commit SHA — there was no human-readable version, no changelog, and no way to
see, from the running app, which release is live. We already write conventional commits
(`feat`/`fix`/`chore`…), so a version can be derived from them automatically.

The design constraint is the existing pipeline: `deploy.yml` is triggered by `workflow_run` on a
successful CI run. Any versioning tool that commits or tags from CI must not loop back into CI, and
must run early enough for the computed version to be baked into the images.

## Current Decision

Adopt **semantic-release** as a `release` job at the head of the deploy pipeline
(`release → build-{api,web,statics} → deploy`).

- **What it does:** derives the SemVer version from the conventional commits since the last tag
  (`feat` → minor, `fix` → patch, `BREAKING CHANGE` → major), creates the **git tag** and a **GitHub
  Release** with generated notes, and **bumps the root `package.json`** to the new version. Plugins:
  `commit-analyzer`, `release-notes-generator`, `exec` (`pnpm pkg set version`), `github`, `git`.
- **Root `package.json` bump:** the version is written to the **root** `package.json` only (the
  workspace packages stay `0.0.0` — they are `private`, never published, so their `version` field is
  irrelevant; the root serves as the repo's single human-readable version reference). This is a
  deliberate reversal of the original tag-only design — see Evolution History.
- **One `[skip ci]` commit:** writing the bump means semantic-release pushes a
  `chore(release): x.y.z` commit to `main`. That commit carries `[skip ci]` in its message, so
  GitHub skips the CI workflow for it — and since the deploy is gated on CI, the deploy does not
  re-fire either. This is the standard, well-understood loop-breaker (`main` has no branch
  protection, so the default `GITHUB_TOKEN` can push directly).
- **Version propagation:** the `release` job exposes the version as a job output. The build jobs tag
  the images with it (alongside the SHA) and bake it in via build-args — `APP_VERSION` for the API
  (surfaced at `GET /api/version`) and `VITE_APP_VERSION` for the web (shown in the footer, mono
  type). Deployment still pins the **SHA** in the server `.env` (`IMAGE_TAG`), so determinism is
  unchanged; the version tag is an additional, human-readable reference.
- **Fallback:** on a push with no releasable commits (e.g. docs-only), no new version is published;
  the job stamps the latest existing tag instead (or `0.0.0` before the first release), so the app
  always shows a coherent version.

## Rationale

- **Deterministic behavior** — releases are a pure function of the commit history; no manual version
  bumping, no drift. The deploy still pins the exact tested SHA.
- **Explicit data contracts** — the version is exposed through a stable endpoint (`/api/version`)
  and the footer, not guessed.
- **Single source of version truth** — the root `package.json` always reflects the latest release,
  so the version is visible in the repo, not only in the tag list. The `[skip ci]` marker keeps the
  CI-loop closed with a single, well-understood convention.
- **Maintainability** — conventional commits were already the norm; this makes them load-bearing and
  self-documenting via the generated release notes.

## Trade-offs

**Benefits:**

- Automated SemVer + changelog + GitHub Releases from existing commit discipline.
- Version visible in production (API endpoint + web footer) and in the image tags.
- No CI loop, minimal permissions (the release job adds `contents`/`issues`/`pull-requests: write`
  for tagging and PR/issue release comments; build/deploy jobs keep their least-privilege scopes).

**Costs:**

- The deploy pipeline gains a job and a third-party action (`cycjimmy/semantic-release-action`,
  SHA-pinned per the supply-chain policy).
- A release is created on `main` HEAD; if `main` moves between the tested push and the release job,
  the tag could sit on a slightly later commit than the deployed SHA (rare, low-impact for a solo
  project).

**Risks:**

- A malformed commit convention could mis-classify a bump (e.g. a breaking change not marked
  `BREAKING CHANGE`). Mitigation: the history is auditable and tags are cheap to correct.
- `@semantic-release/github` posting comments needs `issues`/`pull-requests: write`. Accepted for
  the traceability benefit (PR ↔ shipped version); can be disabled later to drop those scopes.
- The `chore(release)` commit pushes to `main`. If `main` ever gains branch protection requiring PRs
  or status checks, the default `GITHUB_TOKEN` push would be rejected — a PAT or a protection
  exception for the release bot would then be needed. Not an issue today (no protection).

## Alternatives Considered

- **Version = SHA only (status quo).** Simple, but no human-readable version, no changelog, no
  release history. Rejected: the goal is precisely to surface a real version.
- **Tag-only, no repo commit** (the original design). Sidesteps the CI loop by construction (CI
  triggers on branches, not tags), but leaves the repo's `package.json` files stuck at `0.0.0` — the
  version lives only in the tag list. Rejected on review: we want the version visible in the repo
  itself (root `package.json`). The `[skip ci]` commit is a small, standard price for that.
- **Bumping every workspace `package.json`.** Rejected: the packages are `private` and never
  published, so their `version` is meaningless churn. Only the root is bumped.
- **Manual tagging / CalVer.** Less tooling, but reintroduces manual bookkeeping and drift.

## Evolution History

### 2026-07-29: Bump the root `package.json`

- Before merging: added the root `package.json` version bump. semantic-release now also runs
  `@semantic-release/exec` (`pnpm pkg set version`) + `@semantic-release/git` to commit the bump as
  `chore(release): x.y.z [skip ci]`. The `[skip ci]` marker keeps CI (and therefore the deploy) from
  re-firing on the release commit.
- **Reason:** the version should be visible in the repo, not only in the tag list. Only the root is
  bumped — workspace packages are `private`/unpublished, so their `version` is left at `0.0.0`.
- `main` has no branch protection, so the default `GITHUB_TOKEN` pushes the commit directly.

### 2026-07-29: Initial decision

- semantic-release as a `release` job at the head of the deploy pipeline; tag + GitHub Release only,
  no repo commit (no CI loop). Version baked into images via build-args and exposed at
  `/api/version` + the web footer; deployment still pins the SHA.
- Plugins: commit-analyzer, release-notes-generator, github (with PR/issue comments kept on).
- **Alternatives rejected:** SHA-only (no readable version), `@semantic-release/git` (CI-loop
  footgun), manual/CalVer (drift).

## References

- ADR-0026: Reverse Proxy & Deployment Topology (the CI → deploy pipeline this extends)
- `.releaserc.json` — semantic-release configuration
- `.github/workflows/deploy.yml` — the `release` job + version propagation
- `apps/api/src/plugins/version.ts` — the `/api/version` endpoint
- Conventional Commits — the commit convention releases are derived from
