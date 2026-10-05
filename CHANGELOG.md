# Changelog

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
