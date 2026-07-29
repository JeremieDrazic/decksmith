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
  Release** with generated notes. Plugins: `commit-analyzer`, `release-notes-generator`, `github`.
- **No repo commit:** we deliberately omit `@semantic-release/git` and `@semantic-release/npm`. The
  tool pushes a tag and a release only — never a commit to `main`. Since CI triggers on _branches_,
  not _tags_, creating a tag cannot re-trigger CI. No `[skip ci]` hack needed. The changelog lives
  in the GitHub Releases, not a committed file.
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
- **Clarity over cleverness** — the tag-only approach (no repo commit) removes the classic
  semantic-release CI-loop footgun entirely, rather than papering over it with `[skip ci]`.
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

## Alternatives Considered

- **Version = SHA only (status quo).** Simple, but no human-readable version, no changelog, no
  release history. Rejected: the goal is precisely to surface a real version.
- **semantic-release committing the changelog + version bump to the repo**
  (`@semantic-release/git`). Standard, but the commit re-triggers CI → needs `[skip ci]` and careful
  loop handling. Rejected in favour of the tag-only approach, which sidesteps the loop by
  construction.
- **Manual tagging / CalVer.** Less tooling, but reintroduces manual bookkeeping and drift.

## Evolution History

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
