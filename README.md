# Task Hours

Add time estimates to your tasks and see how many hours you've planned — per note, per folder, and per start date.

It uses the same format as the [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plugin (🛫 start date, 📅 due date) and adds ⏱️ for the estimate:

```markdown
- [ ] Draft the proposal ⏱️ 1h30m 🛫 2026-10-06 📅 2026-10-09
```

Tasks is not required, but the two work well together.

[日本語の説明はこちら](README.ja.md)

## Quick entry

You don't need to type emoji. In a task, type `+` for the estimate, `@` for the start date and `!` for the due date. Each one opens a list of suggestions — pick one with ↑↓ and Enter and it's written in the right format straight away:

```markdown
- [ ] Lunch with Sam +2h @tomorrow !fri
```

becomes

```markdown
- [ ] Lunch with Sam ⏱️ 2h 🛫 2026-10-06 📅 2026-10-09
```

| Type | Means |
|---|---|
| `+` | Estimate. `+` alone lists 15m, 30m, 1h, 2h…; `+40` → 40 min; `+2` → 2 h; `+1.5` → 1 h 30 min; `+2h` `+1h30m` `+40m` as written |
| `@tomorrow` | Start date |
| `!fri` | Due date |

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

In settings you can turn off automatic conversion or suggestions, change the `@` / `!` symbols, or require parentheses for estimates.

There's also a form for adding tasks (task name, estimate, start, due), available from the ribbon. It's handy on mobile.

## Dashboard

Click the timer icon in the ribbon to open the dashboard in the right sidebar.

1. Choose a folder at the top. Pick **/ (entire vault)** to include every note.
2. You'll see the total hours and number of open tasks for **Carry-over · Today · Tomorrow · Next 14 days · No start date**.
3. Click a tile to list its tasks. The *next days* tile is grouped by day with subtotals, and a **7 / 14 / 30 days** switch above the list changes its range (remembered for next time).

The folder is remembered, so next time it's one click.

**Carry-over** shows tasks whose start date has passed but aren't done yet. Change their start date to bring them into today's total.

### Edit right from the list

- Click **🛫 start** or **📅 due** to pick a new date. The task line in the note is updated.
- Click **⏱️** to type a new estimate and press Enter.
- Use the checkbox to complete or reopen a task.
- Click a task name to jump to it in its note.

## Queries (Tasks syntax)

A `task-hours` code block takes the same query language as the [Tasks](https://publish.obsidian.md/tasks/Queries/About+Queries) plugin, and adds the **estimate total** on top and a **subtotal for each group**:

````markdown
```task-hours
not done
has start date
due before next week
group by folder
```
````

It searches the whole vault, like Tasks. The block name works in any case: `task-hours`, `Task-Hours`, `TASK-HOURS`, `taskhours`. (A space, as in `Task Hours`, isn't possible — Markdown only reads the first word as the block name.)

Supported instructions:

| | |
|---|---|
| Status | `done` · `not done` · `status.type is TODO` · `status.name includes …` |
| Dates | `due` `start` `scheduled` `created` `done` `cancelled` `happens` with `on` / `before` / `after` / `on or before` / `on or after` / `in` + a date or range: `today`, `2026-10-20`, `2026-10-01 2026-10-07`, `next week`, `this month`, `last quarter`, `2026-W42`, `2026-10`, `2026-Q4`, `in two weeks`, `14 days ago`, `next monday` … · `has due date` · `no start date` |
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
| Display | `hide edit button` `hide backlink` `hide task count` `hide priority` `hide start date` `hide due date` `hide scheduled date` `hide created date` `hide done date` `hide recurrence rule` `hide tags` · `show group count` · `show urgency` · `explain` |
| Placeholders | `{{query.file.path}}` `{{query.file.folder}}` `{{query.file.filename}}` … (for example `path includes {{query.file.path}}` for this note only) |

Not supported: `filter by function`, `sort by function`, `group by function` (custom JavaScript). If a query has a line Task Hours can't read, it shows the error instead of results, like Tasks.

The results show the Tasks fields (priority, recurrence, created / scheduled / done dates, tags) as well. You can change the estimate, start date and due date — click the ⏱️ / 🛫 / 📅 value, or the ✏️ pencil to edit all three at once. Other fields are edited with Tasks or in the note itself.

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
- The start date is 🛫. If a task has no 🛫 but has ⏳ (Tasks' scheduled date), that is used instead.
- Estimate units: `h` `hr` `hrs` `hour(s)` `m` `min` `mins` `minute(s)`, also `時間` `分`. A bare number means hours.
- When used with Tasks, ⏱️ must come before 🛫 and 📅. Quick entry, the form, and list edits all place it there for you.
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
