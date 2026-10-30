# EduNest Frontend — Jira Import Notes

| Field | Value |
|---|---|
| Import file | `jira-import.csv` |
| Rows | **38** = 7 Epics + 26 Tasks + 5 Sub-tasks |
| Planning date | 2026-10-30 |
| Jira integration | **None.** This repository has no Jira connection, API token, or project key. Nothing has been imported. |
| Real keys | **None claimed.** `FE-###` and `FE-EPIC-##` are temporary planning identifiers only. |

These notes describe how to move the proposed backlog into a Jira project safely. Field names vary between Jira Cloud team-managed and company-managed projects and across importer versions; verify each mapping in a sandbox project before importing into a shared board.

---

## 1. What is in the CSV

| Issue type | Count | Temporary ID pattern | Parent column |
|---|---:|---|---|
| Epic | 7 | `FE-EPIC-01` … `FE-EPIC-07` | Empty |
| Task | 26 | `FE-001` … `FE-026` | Temporary epic ID, e.g. `FE-EPIC-02` |
| Sub-task | 5 | `FE-006A/B/C`, `FE-012A/B` | Temporary task ID, e.g. `FE-006` |

FE-019A and FE-019B are **workstreams inside FE-019**, not separate issues. This keeps the sub-task count at five and avoids a hierarchy that implies independent deliverables.

**Columns**

| Column | Required | Content | Notes |
|---|---|---|---|
| `Issue Type` | Yes | `Epic`, `Task`, `Sub-task` | Must match issue type names in the target project |
| `Summary` | Yes | Short title prefixed with the temporary ID | Keep the prefix until real keys exist; it makes cross-references readable |
| `Description` | Yes | Problem, objective, scope, AC summary, files, evidence | Plain text, single line, semicolon-separated; no raw newlines |
| `Priority` | Yes | `Highest`, `High`, `Medium`, `Low` | Maps from P0–P3 |
| `Labels` | No | Comma-separated labels inside a quoted field | See section 4 |
| `Parent` | Tasks/sub-tasks | Temporary epic or task ID | Must be replaced with real keys before import (section 3) |
| `Temporary ID` | Yes | `FE-###` / `FE-EPIC-##` | Use as External Issue ID if the importer supports it |

---

## 2. Field mapping

### 2.1 Core fields

| CSV | Team-managed project | Company-managed project | Notes |
|---|---|---|---|
| `Issue Type` | Issue Type | Issue Type | Sub-task type must exist and be enabled for the project |
| `Summary` | Summary | Summary | ≤ 255 characters; current summaries are within limit |
| `Description` | Description | Description | Importer may convert plain text to ADF; verify formatting |
| `Priority` | Priority | Priority | Priority scheme must contain all four values |
| `Labels` | Labels | Labels | Labels cannot contain spaces |
| `Parent` | Parent | Parent / Epic Link (version-dependent) | Hierarchy differs by project type; see section 3 |
| `Temporary ID` | External issue ID or a short-text custom field | External issue ID or custom field | Enables idempotent re-import and traceability |

### 2.2 Recommended custom fields

Create these only if the team wants structured reporting. Otherwise keep the data in the description.

| Field | Type | Values / source |
|---|---|---|
| Temporary ID | Short text | `FE-###` |
| Checklist IDs | Short text or labels | `CQ-01`, `SEC-05`, etc. |
| Release Gate | Select | `Hard`, `Waiver`, `Post-launch` |
| Track | Select | `A Build`, `B Security`, `C Testing`, `D Performance/A11y`, `E Release` |
| Milestone | Select | `M0` … `M5` |
| Estimate Low (pd) | Number | Lower bound from the task table |
| Estimate High (pd) | Number | Upper bound |
| Confidence | Select | `High`, `Medium`, `Low` |
| Evidence Required | Short text | Link or artifact name expected at Done |

**Estimates:** Jira story points cannot represent a range. Do not silently convert a range to a single number. Either store low/high in custom fields, or use the upper bound and state the assumption in the description. Do not set story points until the team agrees on a scale.

### 2.3 Priority mapping

| Plan priority | Jira priority | Meaning |
|---|---|---|
| P0 | Highest | Release blocker; no production without it |
| P1 | High | Required; waiver only with RA + PO approval |
| P2 | Medium | May ship after launch with a ticket |
| P3 | Low | Product-decision dependent; post-launch |

If the project's priority scheme uses different names (e.g. `Blocker`, `Critical`), map by rank, not by label. Record the mapping in the project README.

---

## 3. Import order (three passes)

Jira Cloud's CSV importer does not reliably resolve a temporary parent identifier to a newly created issue in the same file. Import in passes and replace temporary parents with real keys.

### Pass 0 — Prepare

1. Work in a **sandbox project** first, never directly on the shared delivery board.
2. Validate the CSV: 38 data rows, 7 columns, no embedded newlines, no duplicate `Temporary ID`.
3. Confirm the project has `Epic`, `Task`, and `Sub-task` issue types and the four priority values.
4. Decide whether to use `External issue ID` = `Temporary ID`. If supported, re-import updates instead of duplicating.
5. Back up the CSV and record its checksum.

### Pass 1 — Epics

1. Import only rows where `Issue Type = Epic` (7 rows).
2. Map `Summary` to Summary and, if the importer requires it, to **Epic Name**.
3. Leave `Parent` unmapped/empty.
4. Import and verify 7 epics exist.
5. Export a mapping sheet: `FE-EPIC-01 → <real key>`, … `FE-EPIC-07 → <real key>`.

### Pass 2 — Tasks

1. In a copy of the CSV, replace every `Parent` value `FE-EPIC-0x` with the real epic key from Pass 1.
2. Import rows where `Issue Type = Task` (26 rows).
3. Map `Parent` to Parent (team-managed) or Epic Link (company-managed), depending on the project.
4. Verify each task is linked to the correct epic; spot-check at least FE-006 (Security epic), FE-012 (Testing epic), and FE-019 (Deployment epic).
5. Export the task mapping: `FE-001 → <real key>`, etc.

### Pass 3 — Sub-tasks

1. Replace `Parent` values `FE-006` and `FE-012` with the real task keys.
2. Import rows where `Issue Type = Sub-task` (5 rows).
3. Verify each sub-task sits under the correct parent and that the parent's sub-task count is 3 (FE-006) and 2 (FE-012).
4. Do not import sub-tasks before their parents exist.

### Pass 4 — Verify

| Check | Expected |
|---|---|
| Total issues | 38 |
| Epics | 7 |
| Tasks | 26 |
| Sub-tasks | 5 |
| Tasks without an epic | 0 |
| Sub-tasks without a parent | 0 |
| Duplicate summaries | 0 |
| Invalid priorities | 0 |
| Empty descriptions | 0 |
| Temporary IDs preserved | 38 |

If the importer created duplicates, delete the sandbox issues and re-import using External Issue ID; do not manually merge duplicates on a shared board.

---

## 4. Labels

The CSV uses these label sets (comma-separated inside the quoted field):

- Every row: `frontend`, `production-readiness`
- Epic/theme labels: `code-quality`, `build`, `security`, `auth`, `testing`, `qa`, `performance`, `bundle`, `deployment`, `devops`, `accessibility`, `responsive`, `monitoring`, `release`
- Task-specific: `environment`, `api`, `routing`, `session`, `xss`, `secrets`, `dependencies`, `vitest`, `rtl`, `e2e`, `staging`, `smoke`, `rollback`, `error-handling`, `observability`, `images`, `react`, `i18n`, `locale`, `browser`, `a11y`

**Rules:** lowercase, hyphenated, no spaces, no priority labels (priority is a field), no personal names. If the project uses a controlled label vocabulary, map or drop labels rather than creating near-duplicates.

**Filter for the release board:**

```
project = <KEY> AND labels = "production-readiness" ORDER BY Rank ASC
```

Add `AND labels = "frontend"` only if the project contains non-frontend work.

---

## 5. Dependency linking

The full graph is in `frontend-epics-and-tasks.md`. Jira does not import links from this CSV; create them after import using the `Blocks` / `Is blocked by` link types. At minimum, create the critical-path links:

| Blocking issue | Blocked issue |
|---|---|
| FE-001 | FE-002 |
| FE-001 | FE-012 |
| FE-001 | FE-019 |
| FE-001 | FE-020 |
| FE-001 | FE-026 |
| FE-002 | FE-006 |
| FE-002 | FE-012 |
| FE-006 | FE-007 |
| FE-006 | FE-008 |
| FE-006 | FE-019 |
| FE-007 | FE-008 |
| FE-007 | FE-013 |
| FE-008 | FE-009 |
| FE-008 | FE-013 |
| FE-009 | FE-014 |
| FE-012 | FE-013 |
| FE-012 | FE-014 |
| FE-012 | FE-015 |
| FE-013 | FE-014 |
| FE-013 | FE-020 |
| FE-014 | FE-020 |
| FE-015 | FE-014 |
| FE-019 | FE-020 |
| FE-019 | FE-021 |
| FE-020 | FE-026 |
| FE-021 | FE-026 |

Also link non-blocking relationships as `Relates to`: FE-005 ↔ FE-016/FE-025, FE-010 ↔ FE-019 (CSP), FE-011 ↔ FE-025, FE-016 ↔ FE-017/FE-018/FE-023, FE-022 ↔ FE-023, FE-024 ↔ FE-014.

**Do not** create circular `Blocks` links. If two tasks genuinely need each other, split the dependency or mark one as `Relates to` and document the sequencing in the description.

---

## 6. Board, filter, and milestone setup

### 6.1 Board

| Setting | Proposal |
|---|---|
| Board type | Scrum or Kanban; Kanban is simpler for a release-readiness push |
| Filter | `project = <KEY> AND labels = "production-readiness"` |
| Columns | Backlog · Ready · In Progress · Code Review · CI · QA/Staging · Release Approval · Done |
| Swimlanes | Epic |
| Card fields | Priority, Release Gate, Temporary ID, Assignee |
| WIP limits | 2 per developer; 1 in Code Review per reviewer |
| Definition of Ready/Done | Link to `frontend-roles-and-workflow.md` in the board description |

### 6.2 Milestones

Create five milestones (or fixVersions) matching the plan: `M0 Decisions`, `M1 Reproducible Build`, `M2 Security & Config`, `M3 Test Safety Net`, `M4 Staging RC`, `M5 Go/No-Go`. Do not assign dates until the assumptions in `frontend-priorities-and-dependencies.md` are confirmed.

### 6.3 Components (optional)

`Build`, `Auth`, `API`, `Routing`, `Testing`, `Deployment`, `Accessibility`, `Monitoring`, `Performance`. Use components only if the team reports by area; otherwise labels are sufficient and less maintenance.

### 6.4 Automation (optional)

- When a PR is opened with `FE-###` in the title, transition the issue to **Code Review**.
- When CI fails on the linked branch, add a comment with the run URL.
- When an issue moves to **Done**, require the Evidence field to be non-empty.
- Do not auto-close issues from merge alone; Done requires QA/evidence.

---

## 7. Assignment and scheduling cautions

- The CSV intentionally contains **no assignees**. Assign after capacity is confirmed; auto-assignment hides overload.
- Do not set sprint or due date from this plan. Milestones are relative and depend on external contracts.
- Do not mark any imported issue as Done or "ready for production". The current release verdict is **NO-GO**.
- Do not import the planning documents as attachments to every issue; link the folder or the relevant section instead.
- Do not put real user data, tokens, or production URLs with credentials in descriptions or attachments.

---

## 8. Re-import and idempotency

| Scenario | Action |
|---|---|
| First import into sandbox | Use `Temporary ID` as External Issue ID if available |
| Re-import after editing descriptions | Match on External Issue ID; review the diff before applying |
| Importer does not support External Issue ID | Do not re-import; update issues manually or via API with a script reviewed by the Jira admin |
| Duplicates created | Delete in sandbox; on a shared board, ask the Jira admin to merge, never bulk-delete |
| Parent mapping changed | Update the mapping sheet and re-link; do not recreate issues |

---

## 9. Post-import validation checklist

- [ ] 38 issues created: 7 epics, 26 tasks, 5 sub-tasks.
- [ ] Every task has the intended epic.
- [ ] Every sub-task has the intended parent.
- [ ] Priority values match P0–P3 mapping.
- [ ] Temporary IDs are searchable and unique.
- [ ] Descriptions contain problem, scope, AC summary, and evidence expectation.
- [ ] Critical-path `Blocks` links created and acyclic.
- [ ] Board filter returns exactly the imported issues.
- [ ] Milestones exist; no dates committed prematurely.
- [ ] Definition of Ready/Done linked.
- [ ] No assignee, sprint, or Done state set by default.
- [ ] No secrets, PII, or real customer data in any field.
- [ ] Sandbox test issues deleted before the shared import.

---

## 10. Known limitations

1. **No Jira integration is configured.** These steps are manual and have not been executed.
2. **Field names differ by project type and Jira version.** Verify in sandbox; the mapping above is a guide, not a guarantee.
3. **CSV descriptions are plain text.** Formatting, checklists, and links will not render as rich Jira content unless converted after import.
4. **Estimates are ranges in person-days**, not story points. Do not force them into a numeric field without an agreed conversion.
5. **Dependencies are not in the CSV.** They must be created after import; the critical-path list in section 5 is the minimum.
6. **No real issue keys are claimed.** Any reference to `FE-###` in a PR or document is temporary until the import mapping is recorded.
7. **The import does not imply approval.** The release remains blocked until the evidence gates in `frontend-release-approval.md` are satisfied.
