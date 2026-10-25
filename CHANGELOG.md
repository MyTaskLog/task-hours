# Changelog

## 1.3.2

- The add-task form uses the same large text as the edit dialogs.
- The `+` (estimate) and `@` / `!` (date) suggestion lists in the editor use the same large text too.
- Priority and recurrence set by Tasks are now edited in large dialogs too: clicking the priority shows a big list to choose from, clicking 🔁 opens a dialog with the rule, example rules to pick, and **Remove recurrence**.

## 1.3.1

- Fix: after choosing a query word from the suggestions (for example `path includes`), the next suggestions (the vault's folders) did not appear until you typed a space. They now appear straight away.

## 1.3.0

- Dashboard: total several folders at once, and leave folders out. Add folders as chips at the top (× removes one); **+ Leave out a folder** adds folders to skip, such as an archive inside a project. Your current folder is kept.
- Queries: after `folder includes`, `path includes`, `filename includes` and `root includes` (and `does not include`), the vault's folders and files are suggested and narrowed as you type.
- Dates are picked on a large calendar of Task Hours' own (the browser's date picker can't be resized): when clicking 🛫 / 📅 / ⏳ … in a list, in the ✏️ dialog, in the add-task form and in **Pick from calendar…**. Today is outlined, the chosen day filled; **Today**, **Tomorrow** and **Remove date** buttons sit below.
- The ✏️ edit and ⏱️ estimate dialogs are larger and easier to read.

## 1.2.2

- Fix: links in a task's text (`[[note]]`, `[[note|alias]]`, `[text](url)`, plain URLs) were shown as raw text in Task Hours lists. They are now links you can click (and hover to preview), as in Tasks; `#tags` are shown as tags.

## 1.2.1

- Group headings and their estimate subtotals in query results are larger and easier to read, with the subtotal right next to the heading.

## 1.2.0

- New: typing ```` ``` ```` then `t` suggests **tasks** and **task-hours** as the block name; choosing one also adds the closing fence and puts the cursor inside.
- New setting **Suggest code block names** to turn this off.
- New: suggestions while writing a query, in `task-hours` and `tasks` blocks — the next possible words, with a short explanation (`gr` → `group by` → `folder`). Estimate instructions are offered only in `task-hours` blocks. Setting: **Suggest query instructions**.
- Changed: an empty `task-hours` block now lists every task in the vault, the same as an empty `tasks` block, without an estimate total.

## 1.1.0

- Estimates are now edited with a number plus an **h / min** switch, a preview and quick picks — from a ⏱️ click, the ✏️ dialog and the add-task form. A plain `50` is no longer saved as 50 h: like `+`, 10 or more is taken as minutes, and you can switch the unit.
- New setting **Plain number after ⏱️**: choose whether `⏱️ 50` typed directly in a note means hours (default, as before), minutes, or Auto (10 or more = minutes).
- New: `task-hours` blocks accept the Tasks plugin's query language — filters for status, dates (`due`, `starts`, `scheduled`, `created`, `done`, `cancelled`, `happens`, with Tasks' rule that `starts` also matches tasks without a start date), priority, recurrence, text, tags and dependencies, boolean combinations, `sort by`, `group by` (with Tasks' headings, file headings as links), `limit`, `hide` / `show`, `explain` and `{{query.file.*}}` placeholders. `show estimate total` adds the total and group subtotals.
- Unreadable query lines show a large red error box with the problem line, and the task count reads `1 task` / `3 tasks`, as in Tasks.
- New filters and options for estimates: `has estimate`, `no estimate`, `estimate above 2h`, `estimate below 30m`, `sort by estimate`, `group by estimate`.
- Results show the Tasks fields (priority, recurrence, created / scheduled / done / cancelled dates, 🏁, 🆔, ⛔) and the heading the task is under.
- Tasks-style rows: description, fields inline with full dates, and a `(note > heading)` link that jumps to the task.
- Everything shown can be edited in place: estimate, start and due (which Task Hours can also add), plus scheduled / created / done / cancelled dates, priority and recurrence when the task already has them.
- ✏️ pencil button on every task opens all of its editable fields at once.
- The block name works in any case (`task-hours`, `Task-Hours`, `TASK-HOURS`, `taskhours`).
- Fix: the Tasks fields 🏁 (on completion), 🆔 and ⛔ were shown as part of the task name.
- Blocks in the older `key: value` syntax keep working as before.

## 1.0.4

- Dashboard: the "next days" tile now covers 14 days by default, and you can switch between 7, 14 and 30 days right above its list. Your choice is remembered.
- Estimates can now be up to 9999 hours (for example `+400h` for a study plan). Before, anything over 168 hours didn't show up in the `+` suggestions and left a stray `+` behind.
- `+400` without a unit now offers both 400 minutes and 400 hours.

## 1.0.3

- New: type `+` in a task to pick an estimate, just like `@` and `!` for dates. `+` alone lists common estimates; `+40` → 40 min, `+2` → 2 h, `+1.5` → 1 h 30 min, `+2h` / `+1h30m` as written. The symbol can be changed in settings.
- Picking a date from the @ / ! suggestions now also converts the rest of the line's quick entry (for example `40min` → `⏱️ 40min`) straight away.
- Converting a line when the cursor leaves it now waits briefly for an input method (such as Japanese input) instead of skipping the line.
- Durations are always shown as h / m (for example `1h 30m`), also in the Japanese interface.
- No stray space is left behind when quick entry follows a full-width space.

## 1.0.2

- Settings now use Obsidian's declarative settings API (Obsidian 1.13+), so they show up in the settings search. Older Obsidian versions keep the previous settings screen.
- Fix the build setup: pin the Obsidian API and CodeMirror packages to matching versions and regenerate package-lock.json so a clean install works on every platform.
- Update esbuild (build tool) to 0.28.
- Code clean-up from the community directory's automated review (promise handling, whitespace).

## 1.0.1

- Fix the author link in the plugin manifest.
- Add the license and full source code to the repository.
- Release builds are now made by GitHub Actions with signed build provenance (artifact attestations).

## 1.0.0

- First release.
- Time estimates (⏱️) on tasks, using the same format as the Tasks plugin (🛫 start, 📅 due).
- Quick entry: `2h @tomorrow !fri` becomes `⏱️ 2h 🛫 date 📅 date` when you leave the line, with date suggestions after `@` and `!`.
- Dashboard: pick a folder and see estimate totals for carry-over, today, tomorrow, next 7 days and tasks without a start date. Change dates and estimates right from the list.
- `task-hours` code block for totals and filtered lists inside a note.
- English and Japanese interface.
