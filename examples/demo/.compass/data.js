window.COMPASS = {
  "goal": {
    "north_star": "One dashboard that answers \"why is it like this?\" without asking anyone.",
    "milestone": "v1 - init pipeline + auto-sync",
    "progress": 65,
    "next_steps": [
      "Run init against a real repo and count how much of the vault survives the import",
      "Watch one week of Stop-hook syncs - if it records noise, tighten the six-month filter",
      "Decide whether /compass:decide is needed or auto-sync is enough"
    ],
    "updated": "2026-08-18"
  },
  "decisions": [
    {
      "file": "0001-files-are-truth.md",
      "id": "0001",
      "title": "Plain files in the repo are the source of truth",
      "title_ar": "الملفات العادية في المستودع هي مصدر الحقيقة",
      "date": "2026-07-11",
      "status": "accepted",
      "module": "data-layer",
      "tags": [
        "storage",
        "git"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "",
      "links": [
        "docs/SCHEMA.md"
      ],
      "sections": [
        {
          "heading": "Context",
          "body": "The records have to survive the tool. They also have to be readable by a model at\nsession start, reviewable in a diff, and editable without launching anything."
        },
        {
          "heading": "Decision",
          "body": "Markdown + frontmatter under `.compass/`, committed with the code. The dashboard\nis a generated view and can be deleted at any time without losing anything."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- SQLite - binary, unreviewable in a PR, needs a driver.\n- A hosted service - the records outlive any subscription, and an offline repo\n  should still explain itself.\n- Keeping it in the Obsidian vault only - fine for a human, invisible to a session\n  opened in the repo."
        },
        {
          "heading": "Consequences",
          "body": "Parsing cost on every build. Frontmatter stays flat forever - the parser is 30\nlines and nested YAML will be silently dropped."
        }
      ],
      "search": "plain files in the repo are the source of truth context the records have to survive the tool. they also have to be readable by a model at\nsession start, reviewable in a diff, and editable without launching anything. decision markdown + frontmatter under `.compass/`, committed with the code. the dashboard\nis a generated view and can be deleted at any time without losing anything. alternatives rejected - sqlite - binary, unreviewable in a pr, needs a driver.\n- a hosted service - the records outlive any subscription, and an offline repo\n  should still explain itself.\n- keeping it in the obsidian vault only - fine for a human, invisible to a session\n  opened in the repo. consequences parsing cost on every build. frontmatter stays flat forever - the parser is 30\nlines and nested yaml will be silently dropped."
    },
    {
      "file": "0002-data-js-not-fetch.md",
      "id": "0002",
      "title": "The dashboard reads data.js, never fetch()",
      "title_ar": "اللوحة تقرأ data.js ولا تستخدم fetch",
      "date": "2026-07-13",
      "status": "accepted",
      "module": "dashboard",
      "tags": [
        "html",
        "file-protocol"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "The page has to open by double-clicking it. Over `file://`, `fetch('./data.json')`\nis blocked by CORS in every browser."
        },
        {
          "heading": "Decision",
          "body": "The build writes `window.COMPASS = {...}` into `.compass/data.js`, loaded by a plain\n`<script src>`. `index.html` is copied once and never regenerated."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Inline the JSON into the HTML - every sync rewrites the whole page, so the diff\n  is useless for review.\n- Require `npx serve` - infrastructure for a page that shows twenty records."
        },
        {
          "heading": "Consequences",
          "body": "`data.js` is a build artifact but is committed anyway, so a fresh clone opens.\nAnyone hand-editing `data.js` loses it on the next build."
        }
      ],
      "search": "the dashboard reads data.js, never fetch() context the page has to open by double-clicking it. over `file://`, `fetch('./data.json')`\nis blocked by cors in every browser. decision the build writes `window.compass = {...}` into `.compass/data.js`, loaded by a plain\n`<script src>`. `index.html` is copied once and never regenerated. alternatives rejected - inline the json into the html - every sync rewrites the whole page, so the diff\n  is useless for review.\n- require `npx serve` - infrastructure for a page that shows twenty records. consequences `data.js` is a build artifact but is committed anyway, so a fresh clone opens.\nanyone hand-editing `data.js` loses it on the next build."
    },
    {
      "file": "0003-stop-hook-blocks-once.md",
      "id": "0003",
      "title": "Stop hook blocks once per session instead of spawning a headless run",
      "title_ar": "خطاف Stop يعترض مرة واحدة بدل تشغيل جلسة منفصلة",
      "date": "2026-07-21",
      "status": "accepted",
      "module": "capture",
      "tags": [
        "hooks",
        "cost"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "",
      "links": [
        "hooks/stop.mjs"
      ],
      "sections": [
        {
          "heading": "Context",
          "body": "Capture has to be automatic, and it has to happen while the reasoning is still in\ncontext. A hook is a shell command and cannot reason on its own."
        },
        {
          "heading": "Decision",
          "body": "The Stop hook returns `decision: \"block\"` once per session with a pointer to\n`docs/SYNC.md`. The same session writes the records, with full context, at no extra\nprocess cost. A marker file in the temp dir plus `stop_hook_active` prevents loops."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- `claude -p` subprocess on SessionEnd - pays for a second model run that can only\n  read the transcript, not the live reasoning.\n- Model-discipline only (SessionStart instructions) - best-effort, and the sessions\n  that most need a record are the long ones where it gets forgotten."
        },
        {
          "heading": "Consequences",
          "body": "Every session in an opted-in project ends with one extra short turn. If that ever\ngrates, the fix is a stricter filter in SYNC.md, not a quieter hook."
        }
      ],
      "search": "stop hook blocks once per session instead of spawning a headless run context capture has to be automatic, and it has to happen while the reasoning is still in\ncontext. a hook is a shell command and cannot reason on its own. decision the stop hook returns `decision: \"block\"` once per session with a pointer to\n`docs/sync.md`. the same session writes the records, with full context, at no extra\nprocess cost. a marker file in the temp dir plus `stop_hook_active` prevents loops. alternatives rejected - `claude -p` subprocess on sessionend - pays for a second model run that can only\n  read the transcript, not the live reasoning.\n- model-discipline only (sessionstart instructions) - best-effort, and the sessions\n  that most need a record are the long ones where it gets forgotten. consequences every session in an opted-in project ends with one extra short turn. if that ever\ngrates, the fix is a stricter filter in sync.md, not a quieter hook."
    },
    {
      "file": "0004-silent-until-opt-in.md",
      "id": "0004",
      "title": "Compass stays silent in folders with no .compass/",
      "title_ar": "Compass يصمت في المجلدات بلا ‎.compass/",
      "date": "2026-07-21",
      "status": "accepted",
      "module": "capture",
      "tags": [
        "ux"
      ],
      "provenance": "mcq-answer",
      "review_date": "",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "The plugin is installed once, globally, and most folders opened in a day are\nscratch dirs, other people's repos, or one-off client work."
        },
        {
          "heading": "Decision",
          "body": "The hook exits 0 immediately when `.compass/` is absent. Projects opt in exactly\nonce, by running `/compass:init`."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Ask once per unknown folder - a prompt in every throwaway dir, and the answer has\n  to be remembered somewhere outside the project.\n- Auto-init any git repo - creates `.compass/` in repos that are not ours."
        },
        {
          "heading": "Consequences",
          "body": "A project you forgot to init records nothing, silently. That is the accepted trade."
        }
      ],
      "search": "compass stays silent in folders with no .compass/ context the plugin is installed once, globally, and most folders opened in a day are\nscratch dirs, other people's repos, or one-off client work. decision the hook exits 0 immediately when `.compass/` is absent. projects opt in exactly\nonce, by running `/compass:init`. alternatives rejected - ask once per unknown folder - a prompt in every throwaway dir, and the answer has\n  to be remembered somewhere outside the project.\n- auto-init any git repo - creates `.compass/` in repos that are not ours. consequences a project you forgot to init records nothing, silently. that is the accepted trade."
    },
    {
      "file": "0005-inferred-is-proposed.md",
      "id": "0005",
      "title": "Inferred records land as proposed, never accepted",
      "title_ar": "القرارات المستنتجة تبقى مقترحة ولا تُقبل تلقائياً",
      "date": "2026-07-29",
      "status": "accepted",
      "module": "capture",
      "tags": [
        "provenance",
        "trust"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "Stage 2 of init reads dependencies, structure and commit messages. That yields\nplausible decisions, and plausible is exactly the failure mode - a confident record\nof a reason nobody ever had is worse than no record."
        },
        {
          "heading": "Decision",
          "body": "Anything mined from code is written with `status: proposed` and\n`provenance: inferred-from-code`. Only a human answer promotes it to `accepted`."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Write them as accepted and let the user delete the wrong ones - nobody audits a\n  list of forty records, so the wrong ones become history.\n- Do not mine at all - loses the cheapest source of coverage on day one."
        },
        {
          "heading": "Consequences",
          "body": "A fresh init looks half-finished on purpose. The provenance filter on the dashboard\nexists mainly to work through that backlog."
        }
      ],
      "search": "inferred records land as proposed, never accepted context stage 2 of init reads dependencies, structure and commit messages. that yields\nplausible decisions, and plausible is exactly the failure mode - a confident record\nof a reason nobody ever had is worse than no record. decision anything mined from code is written with `status: proposed` and\n`provenance: inferred-from-code`. only a human answer promotes it to `accepted`. alternatives rejected - write them as accepted and let the user delete the wrong ones - nobody audits a\n  list of forty records, so the wrong ones become history.\n- do not mine at all - loses the cheapest source of coverage on day one. consequences a fresh init looks half-finished on purpose. the provenance filter on the dashboard\nexists mainly to work through that backlog."
    },
    {
      "file": "0006-shortcuts-expire.md",
      "id": "0006",
      "title": "Deliberate shortcuts carry a review_date",
      "title_ar": "الاختصارات المتعمدة تحمل تاريخ مراجعة",
      "date": "2026-04-22",
      "status": "accepted",
      "module": "data-layer",
      "tags": [
        "debt"
      ],
      "provenance": "human",
      "review_date": "2026-08-17",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "\"Temporary\" is how permanent architecture gets built. A shortcut with a known\nceiling should resurface on its own instead of waiting to be rediscovered."
        },
        {
          "heading": "Decision",
          "body": "Any record for an accepted shortcut sets `review_date`. Once that date passes, the\nrecord is pushed to the top of the dashboard and into `/compass:status`."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- A TODO in the code - invisible six months later, and carries no rationale.\n- A calendar reminder - detached from the record it is about."
        },
        {
          "heading": "Consequences",
          "body": "This record is itself overdue, which is the point - the alert strip above is real,\nnot a mock."
        }
      ],
      "search": "deliberate shortcuts carry a review_date context \"temporary\" is how permanent architecture gets built. a shortcut with a known\nceiling should resurface on its own instead of waiting to be rediscovered. decision any record for an accepted shortcut sets `review_date`. once that date passes, the\nrecord is pushed to the top of the dashboard and into `/compass:status`. alternatives rejected - a todo in the code - invisible six months later, and carries no rationale.\n- a calendar reminder - detached from the record it is about. consequences this record is itself overdue, which is the point - the alert strip above is real,\nnot a mock."
    },
    {
      "file": "0007-six-month-filter.md",
      "id": "0007",
      "title": "Sessions record nothing by default",
      "title_ar": "الجلسات لا تسجّل شيئاً افتراضياً",
      "date": "2026-08-06",
      "status": "accepted",
      "module": "capture",
      "tags": [
        "noise",
        "filter"
      ],
      "provenance": "ai-suggested",
      "review_date": "",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "A ledger that records every session becomes a log, and a log is not read. The tool\ndies the moment it feels like a chore."
        },
        {
          "heading": "Decision",
          "body": "Record only what someone would ask \"why did we do this?\" about in six months.\nZero records for a session is the normal, correct outcome."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- One summary per session - recreates the daily-note pattern that already exists in\n  the vault, and buries the load-bearing choices.\n- A record per commit - activity, not intent."
        },
        {
          "heading": "Consequences",
          "body": "Some real decisions are missed. Accepted: a small trustworthy ledger beats a large\none nobody reads."
        }
      ],
      "search": "sessions record nothing by default context a ledger that records every session becomes a log, and a log is not read. the tool\ndies the moment it feels like a chore. decision record only what someone would ask \"why did we do this?\" about in six months.\nzero records for a session is the normal, correct outcome. alternatives rejected - one summary per session - recreates the daily-note pattern that already exists in\n  the vault, and buries the load-bearing choices.\n- a record per commit - activity, not intent. consequences some real decisions are missed. accepted: a small trustworthy ledger beats a large\none nobody reads."
    },
    {
      "file": "0008-node-cli.md",
      "id": "0008",
      "title": "Bundle a Node CLI for init and sync",
      "title_ar": "شحن أداة Node لأوامر init وsync",
      "date": "2026-07-06",
      "status": "superseded",
      "module": "capture",
      "tags": [
        "tooling"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "0009",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "Early assumption that commands should be real code for determinism and tests."
        },
        {
          "heading": "Decision",
          "body": "Ship `compass init|sync|status` as an installable Node package; the plugin only\nshells out to it."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Prose-only commands - looked untestable at the time."
        },
        {
          "heading": "Consequences",
          "body": "Superseded once it was clear that the parts worth automating were mechanical and\ntiny, and everything else needed the model anyway."
        }
      ],
      "search": "bundle a node cli for init and sync context early assumption that commands should be real code for determinism and tests. decision ship `compass init|sync|status` as an installable node package; the plugin only\nshells out to it. alternatives rejected - prose-only commands - looked untestable at the time. consequences superseded once it was clear that the parts worth automating were mechanical and\ntiny, and everything else needed the model anyway."
    },
    {
      "file": "0009-prose-plus-build-script.md",
      "id": "0009",
      "title": "Only the mechanical half is code",
      "title_ar": "الجزء الآلي فقط يُكتب كشيفرة",
      "date": "2026-07-07",
      "status": "accepted",
      "module": "capture",
      "tags": [
        "tooling"
      ],
      "provenance": "human",
      "review_date": "",
      "superseded_by": "",
      "links": [
        "0008"
      ],
      "sections": [
        {
          "heading": "Context",
          "body": "Supersedes 0008. Splitting the work showed a clean line: judgment (what counts as a\ndecision, gap-filling questions, reading a codebase) versus mechanics (parse\nfrontmatter, write data.js)."
        },
        {
          "heading": "Decision",
          "body": "Judgment lives in command markdown the model reads. Mechanics live in one\ndependency-free `build.mjs`. Nothing to install, nothing to version separately."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Full CLI (see 0008) - most of it would have been a wrapper around prose.\n- No script at all, model writes data.js - hand-patching a JSON array is fragile and\n  costs tokens on every sync."
        },
        {
          "heading": "Consequences",
          "body": "The record format is now load-bearing for a 30-line parser. If frontmatter ever\nneeds nesting, the parser gets replaced before the format changes."
        }
      ],
      "search": "only the mechanical half is code context supersedes 0008. splitting the work showed a clean line: judgment (what counts as a\ndecision, gap-filling questions, reading a codebase) versus mechanics (parse\nfrontmatter, write data.js). decision judgment lives in command markdown the model reads. mechanics live in one\ndependency-free `build.mjs`. nothing to install, nothing to version separately. alternatives rejected - full cli (see 0008) - most of it would have been a wrapper around prose.\n- no script at all, model writes data.js - hand-patching a json array is fragile and\n  costs tokens on every sync. consequences the record format is now load-bearing for a 30-line parser. if frontmatter ever\nneeds nesting, the parser gets replaced before the format changes."
    },
    {
      "file": "0010-mcp-server.md",
      "id": "0010",
      "title": "Serve the dashboard from a local MCP server",
      "title_ar": "تقديم اللوحة عبر خادم MCP محلي",
      "date": "2026-08-15",
      "status": "proposed",
      "module": "dashboard",
      "tags": [
        "v2",
        "mcp"
      ],
      "provenance": "inferred-from-code",
      "review_date": "",
      "superseded_by": "",
      "links": [],
      "sections": [
        {
          "heading": "Context",
          "body": "Inferred from the roadmap notes, not yet decided. A live server would give a real\nURL, cross-project view, and tools any Claude surface could call."
        },
        {
          "heading": "Decision",
          "body": "Proposed only. Not built."
        },
        {
          "heading": "Alternatives rejected",
          "body": "- Nothing evaluated yet."
        },
        {
          "heading": "Consequences",
          "body": "Left as `proposed` deliberately, as an example of what init leaves behind for you\nto confirm or drop."
        }
      ],
      "search": "serve the dashboard from a local mcp server context inferred from the roadmap notes, not yet decided. a live server would give a real\nurl, cross-project view, and tools any claude surface could call. decision proposed only. not built. alternatives rejected - nothing evaluated yet. consequences left as `proposed` deliberately, as an example of what init leaves behind for you\nto confirm or drop."
    }
  ],
  "modules": [
    {
      "file": "capture.md",
      "name": "capture",
      "title": "Capture",
      "title_ar": "الالتقاط",
      "source": "",
      "body": "How a decision gets from a session into a file: the Stop hook, `docs/SYNC.md`, and\nthe init pipeline.\n\n## Hard constraints\n- Silent in folders without `.compass/`.\n- At most one block per session.\n- Never invent a rationale. No evidence, no record.\n\n## Open questions\n- Is `/compass:decide` needed, or does end-of-session capture cover it?"
    },
    {
      "file": "dashboard.md",
      "name": "dashboard",
      "title": "Dashboard",
      "title_ar": "اللوحة",
      "source": "",
      "body": "The static page: goal header, overdue-review strip, decisions table with search,\nfilters, sort and pagination, and module docs.\n\n## Hard constraints\n- No build step, no dependencies, no network. It must open over `file://`.\n- `index.html` is copied once per project. The build never overwrites it, so local\n  tweaks survive.\n\n## Open questions\n- Cross-project index page - one screen for every project's goal and overdue reviews."
    },
    {
      "file": "data-layer.md",
      "name": "data-layer",
      "title": "Data layer",
      "title_ar": "طبقة البيانات",
      "source": "imported from vault/modules/data-layer.md",
      "body": "Everything under `.compass/`: the goal file, decision records, module docs, and the\ngenerated `data.js`.\n\n## Hard constraints\n- Frontmatter stays flat. The parser will not read nested YAML.\n- Append-only. A reversed decision gets a new record; the old one is marked\n  `superseded`, never rewritten.\n- `data.js` is generated. Hand edits are lost on the next build.\n\n## Open questions\n- Should `links` become structured (type + target) instead of free strings?"
    }
  ],
  "generated": "2026-08-20T09:20:49.131Z"
};
