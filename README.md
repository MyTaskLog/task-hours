# Task Hours

Add time estimates (⏱️) to your tasks and see how many hours of work you have today, tomorrow and in the days ahead. It uses the same format as the [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plugin, so the two work together (Tasks isn't required).

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/hero.gif?v=1.5.0" alt="Tasks in a note, a query with estimate totals, and the dashboard in the sidebar">

[日本語の説明はこちら](README.ja.md)

## Quick entry

Type a symbol in a task line, pick from the suggestions, and it's written in the Tasks format — no emoji typing.

| Type | Adds |
|---|---|
| `+` | ⏱️ estimate |
| `@` | ⏳ scheduled date |
| `$` | 🛫 start date |
| `!` | 📅 due date |

The symbols can be changed in settings.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/quick-entry.gif?v=1.5.0" alt="Typing + @ $ ! and picking from the suggestions" width="860">

## Sidebar dashboard

Open it from the timer icon in the ribbon. Choose a folder to see estimate totals for **Carry-over · Today · Tomorrow · Next 7 / 14 / 30 days · No date**, totalled by ⏳ scheduled, 🛫 start or 📅 due date — switch with the buttons at the top. Dates, estimates and checkboxes can be changed right there.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/sidebar.png?v=1.5.0" alt="The dashboard in the sidebar" width="360">

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/dashboard.gif?v=1.5.0" alt="Choosing a folder, switching tiles and editing in the dashboard" width="900">

## Query blocks

A ` ```task-hours ` code block takes the same queries as Tasks, and **suggests what you can type next** — instructions and folder names — as you write. Task Hours adds estimate instructions such as `has estimate` and `show estimate total`. See the [Tasks documentation](https://publish.obsidian.md/tasks/Queries/About+Queries) for the query language.

Dates, estimates and priority can be changed in the results, and completing a repeating task creates its next occurrence.

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-suggest.gif?v=1.5.0" alt="Writing a query with suggestions" width="860">

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-edit.gif?v=1.5.0" alt="Editing in query results and completing a repeating task" width="900">

## Installation

From **Settings → Community plugins → Browse**, search for “Task Hours”.

Manual install: copy `main.js`, `manifest.json` and `styles.css` from the latest release into `<vault>/.obsidian/plugins/task-hours/` and enable the plugin.

## Privacy

Task Hours works entirely inside your vault and makes no network requests. It reads notes to total your tasks, and only changes a note when you convert quick entry or edit from a Task Hours list.

## License

MIT
