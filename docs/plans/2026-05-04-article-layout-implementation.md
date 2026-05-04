# Article Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve article reading structure by fixing post layout data flow, adding a stable table of contents, tightening long-form typography, and restructuring representative post content.

**Architecture:** Keep Astro content rendering as-is, but move article-page structure into `PostLayout` with explicit post metadata and heading-driven TOC support. Add a small tested helper for heading filtering so the reading shell has stable input, then restyle the markdown body and clean representative post markdown to match the new structure.

**Tech Stack:** Astro 6, Astro Content Collections, Tailwind CSS v4, Node test runner

---

### Task 1: Add tested heading helper

**Files:**
- Create: `src/lib/post-layout.ts`
- Create: `tests/post-layout.test.mjs`

**Step 1: Write the failing test**

- Assert that article TOC headings only include `h2` and `h3`.
- Assert that empty text entries and `h1` entries are excluded.

**Step 2: Run test to verify it fails**

Run: `node --test tests/post-layout.test.mjs`

**Step 3: Write minimal implementation**

- Export a `getTocHeadings()` helper from `src/lib/post-layout.ts`.

**Step 4: Run test to verify it passes**

Run: `node --test tests/post-layout.test.mjs`

### Task 2: Refactor article page shell

**Files:**
- Modify: `src/pages/posts/[...slug].astro`
- Modify: `src/layouts/PostLayout.astro`

**Step 1: Wire explicit metadata**

- Pass real post metadata and filtered headings into `PostLayout`.

**Step 2: Add article structure**

- Replace fixed generic labels with actual tags, reading time, and publish/update metadata.
- Add desktop TOC and compact mobile TOC entry area.

**Step 3: Verify render path**

Run: `.\tools\build.ps1`

### Task 3: Tighten long-form styles

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Add article shell styles**

- Add styles for article grid, TOC, sticky sidebar, and denser meta groups.

**Step 2: Improve markdown typography**

- Rework intro paragraph, heading rhythm, link treatment, list spacing, blockquotes, code blocks, and tables.

**Step 3: Verify build**

Run: `.\tools\build.ps1`

### Task 4: Restructure representative posts

**Files:**
- Modify: `src/content/posts/ai-coding-git-management.md`
- Modify: `src/content/posts/building-an-ai-security-workflow.md`

**Step 1: Remove duplicate H1 usage**

- Keep layout-owned H1 and start content sections from `##`.

**Step 2: Normalize callouts**

- Replace unsupported alert syntax with markdown structures that render cleanly under the new styles.

**Step 3: Improve sectioning**

- Split oversized blocks into clearer steps, principles, command sections, and risk notes.

### Task 5: Record and verify

**Files:**
- Modify: `docs/progress-log.md`

**Step 1: Append this round's progress entry**

- Record completed changes, verification, and residual risks.

**Step 2: Run full verification**

Run: `npm test`
Run: `.\tools\build.ps1`
