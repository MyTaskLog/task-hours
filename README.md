# Task Hours

Add time estimates to your tasks and see how many hours you've planned — per note, per folder, and per day you've scheduled them.

It uses the same format as the [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plugin (⏳ scheduled date, 🛫 start date, 📅 due date) and adds ⏱️ for the estimate:

```markdown
- [ ] Draft the proposal ⏱️ 1h30m ⏳ 2026-10-06 📅 2026-10-09
```

Tasks is not required, but the two work well together.

**Three dates, as in Tasks.** ⏳ *scheduled* is the day you plan to work on a task, 🛫 *start* the day it becomes possible to start, 📅 *due* the deadline. Each has its own quick-entry symbol — `@` scheduled, `$` start, `!` due — and the dashboard can total by any of them (⏳ by default). If you used Task Hours before 1.4.0, nothing changes for you: `@` still writes 🛫 start, ⏳ scheduled gets `$`, and the dashboard stays on 🛫 — swap them in settings whenever you like.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/dashboard.png?v=1.4.0" alt="Tasks with estimates, and the dashboard totalling them by scheduled date">

[日本語の説明はこちら](README.ja.md)

## Quick entry

You don't need to type emoji. In a task, type `+` for the estimate, `@` for the start date and `!` for the due date. Each one opens a list of suggestions — pick one with ↑↓ and Enter and it's written in the right format straight away:

```markdown
- [ ] Lunch with Sam +2h @tomorrow !fri
```

becomes

```markdown
- [ ] Lunch with Sam ⏱️ 2h ⏳ 2026-10-06 📅 2026-10-09
```

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/quick-entry.gif?v=1.4.0" alt="Typing + @ $ ! in a task line and picking from the suggestions" width="800">

| Type | Means |
|---|---|
| `+` | Estimate. `+` alone lists 15m, 30m, 1h, 2h…; `+40` → 40 min; `+2` → 2 h; `+1.5` → 1 h 30 min; `+2h` `+1h30m` `+40m` as written |
| `@tomorrow` | Scheduled date ⏳ |
| `$mon` | Start date 🛫 |
| `!fri` | Due date 📅 |

- `@` and `!` suggest dates; you can also choose **Pick from calendar…**.
- You can skip the list and just keep typing: `+40 @tomorrow` is converted when you press Enter or move to another line. A plain `2h`, `30m` or `(2h)` also counts as an estimate there.
- Add `@nextmon` to a task that already has a start date to move it (handy for rescheduling).
- If something gets converted by mistake, undo with Ctrl/Cmd+Z.

### Date words

| You type | Result (if today is Mon, Oct 5) |
|---|---|
| `today` `tomorrow` (`tmr`, `tmrw`) | Oct 5, Oct 6 |
| `fri` `friday` | the next Friday, today included → Oct 9 |
| `nextfri` `thisfri` `nextweek` | Oct 16, Oct 9, Mon Oct 12 |
| `oct7` `7oct` `10/7` `2026-10-07` | Oct 7 (a past month/day means next year) |
| `+3` `3d` `2w` | Oct 8, Oct 8, Oct 19 |
| `eom` `weekend` `nextmonth` | Oct 31, Sat Oct 10, Nov 1 |

`10/7` is read as month/day. If you write day/month, turn on **Read short dates as day/month** in settings.

### What is *not* converted

- `@` or `!` right after a letter or digit, such as `bob@example.com`.
- Words that only start with a date word: `@monica`, `@tom`, `@sunny` stay as they are.
- A lone `2h` when the task already has ⏱️. Use `(3h)` to replace it.
- Anything inside a code block.

In settings you can turn off automatic conversion or suggestions, change the `@` / `$` / `!` / `+` symbols, or require parentheses for estimates.

### Code block names

Type ```` ``` ```` and then `t` to get **tasks** and **task-hours** as suggestions, so you can pick the plugin each block is for. Choosing one also writes the closing ```` ``` ```` and puts the cursor inside. Turn this off in settings with **Suggest code block names**.

There's also a form for adding tasks (task name, estimate, start, due), available from the ribbon. It's handy on mobile.

## Dashboard

Click the timer icon in the ribbon to open the dashboard in the right sidebar.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/dashboard.gif?v=1.4.0" alt="Choosing a folder, switching tiles and ranges in the dashboard" width="900">

1. Choose a folder at the top. Pick **/ (entire vault)** to include every note. You can add more folders — each one shows as a chip, and × removes it. Use **+ Leave out a folder** to skip folders inside them (an archive, for example).
2. You'll see the total hours and number of open tasks for **Carry-over · Today · Tomorrow · Next 14 days · No scheduled date**. The switch above them chooses the date they total by: **⏳ Scheduled · 🛫 Start · 📅 Due** (with 📅, *Carry-over* becomes *Overdue*).
3. Click a tile to list its tasks. The *next days* tile is grouped by day with subtotals, and a **7 / 14 / 30 days** switch above the list changes its range (remembered for next time).

The folders are remembered, so next time it's one click.

**Carry-over** shows tasks whose scheduled date has passed but aren't done yet. Reschedule them to bring them into today's total.

### Edit right from the list

- Click **⏳ scheduled**, **🛫 start** or **📅 due** to pick a new date on a large calendar (with Today / Tomorrow / Remove date buttons). The task line in the note is updated.
- Click **⏱️** to change the estimate: type a number, choose **h** or **min** (a number of 10 or more is assumed to be minutes, as with `+`), or click one of the quick picks.

  <img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/estimate-editor.png?v=1.4.0" alt="The estimate editor: a number, an h / min switch, a preview and quick picks" width="600">

- Use the checkbox to complete or reopen a task.
- Click a task name to jump to it in its note.

## Queries (Tasks syntax)

A `task-hours` code block takes the same query language as the [Tasks](https://publish.obsidian.md/tasks/Queries/About+Queries) plugin — a query that works in a `tasks` block works here too — and shows the estimates (⏱️) with each task:

````markdown
```task-hours
not done
has start date
due before next week
group by folder
```
````

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query.png" alt="Query results grouped by start date, with estimate subtotals next to each heading" width="800">

It searches the whole vault, like Tasks — an empty block lists every task, just as an empty `tasks` block does. The block name works in any case: `task-hours`, `Task-Hours`, `TASK-HOURS`, `taskhours`. (A space, as in `Task Hours`, isn't possible — Markdown only reads the first word as the block name.)

### Suggestions while you type

You don't need to remember the instructions. Inside a `task-hours` block — and inside `tasks` blocks too — start typing and the next possible words are suggested, each with a short explanation: `gr` → **group by** → **folder**, `due` → **before** → **next week**. After `folder includes`, `path includes`, `filename includes` or `root includes`, your vault's folders and files are listed and narrowed as you type. In a `tasks` block only Tasks' own instructions are offered; a `task-hours` block also offers the estimate ones (marked **Task Hours**). Turn this off with **Suggest query instructions** in settings.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-suggest.gif" alt="Writing a task-hours query with suggestions" width="860">

Supported instructions:

| | |
|---|---|
| Status | `done` · `not done` · `status.type is TODO` · `status.name includes …` |
| Dates | `due` `starts` `scheduled` `created` `done` `cancelled` `happens` with `on` / `before` / `after` / `on or before` / `on or after` / `in` + a date or range: `today`, `2026-10-20`, `2026-10-01 2026-10-07`, `next week`, `this month`, `last quarter`, `2026-W42`, `2026-10`, `2026-Q4`, `in two weeks`, `14 days ago`, `next monday` … · `has due date` · `no start date`. As in Tasks, `starts …` also matches tasks with no start date — add `(has start date)` to leave them out |
| Priority | `priority is high` · `priority is above medium` · `priority is not none` |
| Recurrence | `is recurring` · `is not recurring` · `recurrence includes week` |
| Text | `description` `path` `folder` `filename` `heading` `root` + `includes` / `does not include` / `regex matches /…/` |
| Tags | `has tags` · `no tags` · `tags include #work` · `tag does not include #home` |
| Dependencies | `is blocked` · `is blocking` · `has id` · `has depends on` |
| Boolean | `(due today) OR (start today)` · `(tags include work) AND NOT (priority is high)` — XOR too; put each filter in parentheses |
| **Estimates** (Task Hours) | `has estimate` · `no estimate` · `estimate above 2h` · `estimate below 30m` |
| Sort | `sort by due` `start` `scheduled` `priority` `urgency` `description` `path` `filename` `heading` `tag` `status` `done` `created` `happens` `random`, **`sort by estimate`** (longest first) — add `reverse` to flip |
| Group | `group by due` `start` `scheduled` `happens` `priority` `folder` `filename` `path` `root` `heading` `backlink` `tags` `status` `recurring` `urgency`, **`group by estimate`** — several levels allowed |
| Limit | `limit 10` · `limit to 10 tasks` · `limit groups 3` |
| Totals (Task Hours) | `show estimate total` — total estimate above the list and a subtotal on each group heading |
| Display | `hide edit button` `hide backlink` `hide task count` `hide priority` `hide start date` `hide due date` `hide scheduled date` `hide created date` `hide done date` `hide recurrence rule` `hide tags` · `show group count` · `show urgency` · `explain` |
| Placeholders | `{{query.file.path}}` `{{query.file.folder}}` `{{query.file.filename}}` … (for example `path includes {{query.file.path}}` for this note only) |

Not supported: `filter by function`, `sort by function`, `group by function` (custom JavaScript). If a query has a line Task Hours can't read, it shows a red error box with the problem line instead of results, like Tasks. The task count at the bottom reads `1 task` / `3 tasks` (or `3 of 10 tasks` with a limit).

Each task is shown like in Tasks: the description, its fields, and a link to the note it's in — `(note > heading)` — that jumps to the task.

Everything shown can be changed right there: click ⏱️ / 🛫 / 📅 / ⏳ / ➕ / ✅ / ❌ to pick a new date (or estimate), click the priority to choose another, click 🔁 to edit the recurrence rule. The ✏️ pencil opens all of them at once.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-edit.gif?v=1.4.0" alt="Changing dates, priority, recurrence and estimates in query results; totals update straight away" width="900">
 Task Hours can **add** only the estimate, ⏳ scheduled, 🛫 start and 📅 due dates; the other fields can be changed or removed when the task already has them (add them with Tasks).

### Older syntax

Blocks written as `key: value` keep working and look at **this note** by default. The command **Show estimate total at top of note** adds one of these:

````markdown
```task-hours
show: summary
```
````

| Key | Values | Default |
|---|---|---|
| `scope` | `this` (this note) / `all` (whole vault) | `this` |
| `folder` | folder path, subfolders included (`/` = whole vault) | — |
| `start` / `due` | `today`, `this week`, `next 7 days`, `2026-10-01..2026-10-07`, `before today`, `none`, `any` … | — |
| `status` | `open` / `done` / `all` | `open` |
| `group` | `none` / `start` / `due` / `file` | `none` |
| `sort` | `start` / `due` / `estimate` / `file` | `start` |
| `show` | `list` / `summary` (total only) | `list` |
| `limit` | max tasks shown (totals still count all) | — |

## Details

- `[x]`, `[X]` and `[-]` (cancelled) count as done. `[/]` and other statuses count as open.
- The dashboard and older-style blocks total by the date chosen in **Total by** (⏳ by default).  A task without that date is listed under *No … date*. Tasks-syntax queries always mean exactly what Tasks means (`scheduled`, `starts`).
- Estimate units: `h` `hr` `hrs` `hour(s)` `m` `min` `mins` `minute(s)`, also `時間` `分`. A plain number typed directly after ⏱️ in a note (`⏱️ 50`) means hours by default; change this in settings under **Plain number after ⏱️** to minutes, or to *Auto* (10 or more = minutes, as with `+`). In the estimate editor you choose h or min.
- When used with Tasks, ⏱️ must come before 🛫, ⏳ and 📅. Quick entry, the form, and list edits all place it there for you.
- The interface follows Obsidian's language (English or Japanese). You can override it in settings.

## Privacy

Task Hours works entirely inside your vault. It makes no network requests and sends nothing anywhere.

To total tasks across a folder or the whole vault, it lists the Markdown files in your vault and reads the ones that contain tasks. It only changes a note when you ask it to: converting quick-entry text on a task line, or editing a date, estimate or checkbox from a Task Hours list.

## Installation

From **Settings → Community plugins → Browse**, search for “Task Hours”.

Manual install: copy `main.js`, `manifest.json` and `styles.css` from the latest release into `<vault>/.obsidian/plugins/task-hours/`, then enable the plugin.

## Development

```
npm install
npm run dev     # watch
npm run build   # production build
```

## License

MIT
