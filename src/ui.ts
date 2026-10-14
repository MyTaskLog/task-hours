// Task list rendering and editing from the list (done, start, due, estimate)

import { App, MarkdownView, Menu, Modal, Notice, Setting, TFile, setIcon } from "obsidian";
import { headerDate, labelDate } from "./dates";
import { t as tr } from "./i18n";
import {
	Field,
	PRIORITY_EMOJI,
	PRIORITY_ORDER,
	Priority,
	Task,
	TasksField,
	fmt,
	formatDuration,
	replaceTasksField,
	setLineField,
	totalMinutes,
} from "./parse";
import { EstimateModal, EstimatePicker } from "./estimate";
import { durationValue } from "./shorthand";
import { TGroup, filenameOf, urgency } from "./tquery";

// The App for chips created deep inside lists (set once by the plugin on load)
let currentApp: App | null = null;
export function setUiApp(app: App) {
	currentApp = app;
}
function appOf(_el: HTMLElement): App {
	if (!currentApp) throw new Error("Task Hours: app not set");
	return currentApp;
}

export type GroupBy = "none" | "start" | "due" | "file";

export async function collectTasks(app: App, files: TFile[], parse: (c: string, p: string) => Task[]): Promise<Task[]> {
	const out: Task[] = [];
	for (const f of files) {
		const items = app.metadataCache.getFileCache(f)?.listItems;
		if (items !== undefined && !items.some((li) => li.task !== undefined)) continue;
		out.push(...parse(await app.vault.cachedRead(f), f.path));
	}
	return out;
}

export function filesInFolder(app: App, folder: string): TFile[] {
	const p = folder.replace(/^\/+|\/+$/g, "");
	return app.vault.getMarkdownFiles().filter((f) => p === "" || f.path.startsWith(p + "/"));
}

/** Rewrite one line; do nothing if it changed since it was read */
async function rewrite(app: App, t: Task, fn: (line: string) => string): Promise<boolean> {
	const file = app.vault.getAbstractFileByPath(t.path);
	if (!(file instanceof TFile)) return false;
	let ok = false;
	await app.vault.process(file, (data) => {
		const lines = data.split("\n");
		const cur = lines[t.line]?.replace(/\r$/, "");
		if (cur !== t.raw.replace(/\r$/, "")) return data;
		const cr = lines[t.line].endsWith("\r") ? "\r" : "";
		lines[t.line] = fn(cur) + cr;
		ok = true;
		return lines.join("\n");
	});
	if (!ok) new Notice(tr("list.changed"));
	return ok;
}

export function setField(app: App, t: Task, field: Field, value: string | null) {
	return rewrite(app, t, (l) => setLineField(l, field, value));
}

export function setTasksField(app: App, t: Task, field: TasksField, value: string | null) {
	return rewrite(app, t, (l) => replaceTasksField(l, field, value));
}

/** Set several fields in one write (used by the edit dialog) */
export function setFields(
	app: App,
	t: Task,
	values: Partial<Record<Field, string | null>>,
	tasksValues: Partial<Record<TasksField, string | null>> = {}
) {
	return rewrite(app, t, (l) => {
		for (const f of ["estimate", "start", "due"] as Field[]) if (f in values) l = setLineField(l, f, values[f] ?? null);
		for (const [f, v] of Object.entries(tasksValues) as [TasksField, string | null][]) l = replaceTasksField(l, f, v);
		return l;
	});
}

/** ✏️ dialog: estimate, start date and due date (the only fields Task Hours edits) */
export class EditTaskModal extends Modal {
	private picker!: EstimatePicker;
	private start: string;
	private due: string;
	// Fields Tasks added — editable only when the task already has them
	private extra: Partial<Record<TasksField, string>> = {};

	constructor(
		app: App,
		private task: Task
	) {
		super(app);
		this.start = task.startDate ?? "";
		this.due = task.due ?? "";
		if (task.scheduled) this.extra.scheduled = task.scheduled;
		if (task.created) this.extra.created = task.created;
		if (task.doneDate) this.extra.done = task.doneDate;
		if (task.cancelled) this.extra.cancelled = task.cancelled;
		if (task.priority !== "none") this.extra.priority = task.priority;
		if (task.recurrence) this.extra.recurrence = task.recurrence;
	}

	onOpen() {
		const { contentEl } = this;
		this.setTitle(tr("edit.title"));
		contentEl.createDiv({ cls: "task-hours-edit-name", text: this.task.name });
		const estRow = new Setting(contentEl).setName(tr("add.estimate"));
		estRow.settingEl.addClass("task-hours-estrow");
		this.picker = new EstimatePicker(estRow.controlEl, this.task.minutes, { autofocus: true, onEnter: () => void this.save() });
		new Setting(contentEl).setName(tr("add.start")).addText((t) => {
			t.inputEl.type = "date";
			t.setValue(this.start).onChange((v) => (this.start = v));
		});
		new Setting(contentEl).setName(tr("add.due")).addText((t) => {
			t.inputEl.type = "date";
			t.setValue(this.due).onChange((v) => (this.due = v));
		});
		const dates: [TasksField, string][] = [
			["scheduled", "⏳ " + tr("edit.scheduled")],
			["created", "➕ " + tr("edit.created")],
			["done", "✅ " + tr("edit.done")],
			["cancelled", "❌ " + tr("edit.cancelled")],
		];
		for (const [f, label] of dates) {
			if (this.extra[f] === undefined) continue;
			new Setting(contentEl).setName(label).addText((t) => {
				t.inputEl.type = "date";
				t.setValue(this.extra[f] ?? "").onChange((v) => (this.extra[f] = v));
			});
		}
		if (this.extra.priority !== undefined) {
			new Setting(contentEl).setName(tr("edit.priority")).addDropdown((d) => {
				for (const p of PRIORITY_ORDER) d.addOption(p, priorityLabel(p));
				d.setValue(this.extra.priority ?? "none").onChange((v) => (this.extra.priority = v));
			});
		}
		if (this.extra.recurrence !== undefined) {
			new Setting(contentEl).setName("🔁 " + tr("edit.recurrence")).addText((t) =>
				t.setValue(this.extra.recurrence ?? "").onChange((v) => (this.extra.recurrence = v))
			);
		}
		new Setting(contentEl)
			.addButton((b) => b.setButtonText(tr("edit.cancel")).onClick(() => this.close()))
			.addButton((b) =>
				b
					.setButtonText(tr("edit.save"))
					.setCta()
					.onClick(() => void this.save())
			);
		contentEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.isComposing && (e.target as HTMLElement).tagName === "INPUT") {
				e.preventDefault();
				void this.save();
			}
		});
	}

	private async save() {
		const est = this.picker.value;
		if (est === undefined) {
			new Notice(tr("add.badEstimate"));
			return;
		}
		if (this.start && this.due && this.start > this.due) {
			new Notice(tr("add.startAfterDue"));
			return;
		}
		const extra: Partial<Record<TasksField, string | null>> = {};
		for (const [f, v] of Object.entries(this.extra) as [TasksField, string][]) extra[f] = v.trim() && v !== "none" ? v.trim() : null;
		await setFields(this.app, this.task, { estimate: est, start: this.start || null, due: this.due || null }, extra);
		this.close();
	}

	onClose() {
		this.contentEl.empty();
	}
}

export function toggleDone(app: App, t: Task) {
	return rewrite(app, t, (line) =>
		t.done
			? line.replace(/\[(.)\]/, "[ ]").replace(/\s*✅️?\s*\d{4}-\d{2}-\d{2}/u, "")
			: line.replace(/\[(.)\]/, "[x]") + ` ✅ ${fmt(new Date())}`
	);
}

export async function openTask(app: App, t: Task) {
	const file = app.vault.getAbstractFileByPath(t.path);
	if (!(file instanceof TFile)) return;
	const leaf = app.workspace.getLeaf(false);
	await leaf.openFile(file, { eState: { line: t.line } });
	const view = leaf.view;
	if (view instanceof MarkdownView) {
		const pos = { line: t.line, ch: 0 };
		view.editor.setCursor(pos);
		view.editor.scrollIntoView({ from: pos, to: pos }, true);
	}
}

// ---------- Editable chips ----------

function stop(e: Event) {
	e.preventDefault();
	e.stopPropagation();
}

function dateChip(
	parent: HTMLElement,
	icon: string,
	value: string | null,
	cls: string,
	onSet: (v: string | null) => void,
	fullDate = false
) {
	const chip = parent.createSpan({
		cls: "task-hours-chip " + cls + (value ? "" : " is-empty"),
		text: value ? `${icon} ${fullDate ? value : labelDate(value)}` : `${icon} +`,
		attr: { "aria-label": tr("list.clickToChange"), tabindex: "0" },
	});
	const edit = (e: Event) => {
		stop(e);
		const input = createEl("input", { type: "date", cls: "task-hours-input" });
		input.value = value ?? "";
		chip.replaceWith(input);
		input.focus();
		try {
			input.showPicker();
		} catch {
			/* older environments: type the date */
		}
		let finished = false;
		const finish = (commit: boolean) => {
			if (finished) return;
			finished = true;
			const v = input.value || null;
			input.replaceWith(chip);
			if (commit && v !== value) onSet(v);
		};
		input.addEventListener("change", () => finish(true));
		// some environments blur when the picker opens, so check a moment later
		input.addEventListener("blur", () => window.setTimeout(() => document.activeElement !== input && finish(true), 250));
		input.addEventListener("keydown", (ev) => {
			if (ev.key === "Escape") finish(false);
			if (ev.key === "Enter") finish(true);
		});
		input.addEventListener("click", stop);
	};
	chip.addEventListener("click", edit);
	chip.addEventListener("keydown", (e) => e.key === "Enter" && edit(e));
}

export function priorityLabel(p: Priority): string {
	return `${PRIORITY_EMOJI[p] || "—"} ${tr(`prio.${p}`)}`;
}

/** Priority that Tasks set: click to pick another one (or remove it) */
function priorityChip(app: App, parent: HTMLElement, t: Task) {
	const chip = parent.createSpan({
		cls: "task-hours-chip task-hours-prio",
		text: PRIORITY_EMOJI[t.priority],
		attr: { "aria-label": priorityLabel(t.priority), tabindex: "0" },
	});
	chip.addEventListener("click", (e) => {
		stop(e);
		const menu = new Menu();
		for (const p of PRIORITY_ORDER)
			menu.addItem((i) =>
				i
					.setTitle(priorityLabel(p))
					.setChecked(p === t.priority)
					.onClick(() => void setTasksField(app, t, "priority", p === "none" ? null : p))
			);
		menu.showAtMouseEvent(e);
	});
}

/** Recurrence rule that Tasks set: click to edit the text (empty removes it) */
function recurrenceChip(app: App, parent: HTMLElement, t: Task) {
	const chip = parent.createSpan({
		cls: "task-hours-chip",
		text: `🔁 ${t.recurrence}`,
		attr: { "aria-label": tr("list.clickToChange"), tabindex: "0" },
	});
	chip.addEventListener("click", (e) => {
		stop(e);
		const input = createEl("input", { type: "text", cls: "task-hours-input task-hours-input-rec" });
		input.value = t.recurrence ?? "";
		chip.replaceWith(input);
		input.focus();
		let done = false;
		const finish = (commit: boolean) => {
			if (done) return;
			done = true;
			input.replaceWith(chip);
			const v = input.value.trim();
			if (commit && v !== t.recurrence) void setTasksField(app, t, "recurrence", v || null);
		};
		input.addEventListener("keydown", (ev) => {
			if (ev.key === "Enter" && !ev.isComposing) finish(true);
			if (ev.key === "Escape") finish(false);
		});
		input.addEventListener("blur", () => finish(true));
		input.addEventListener("click", stop);
	});
}

function estimateChip(parent: HTMLElement, t: Task, onSet: (v: string | null) => void) {
	const chip = parent.createSpan({
		cls: "task-hours-chip task-hours-est" + (t.minutes === null ? " is-missing" : ""),
		text: t.minutes === null ? "⏱️ ?" : `⏱️ ${formatDuration(t.minutes)}`,
		attr: { "aria-label": tr("list.clickToEstimate"), tabindex: "0" },
	});
	const edit = (e: Event) => {
		stop(e);
		// a small dialog with a number, an h / min switch and quick picks
		new EstimateModal(appOf(chip), t.name, t.minutes, (v) => {
			const before = t.minutes === null ? null : durationValue(t.minutes);
			if (v !== before) onSet(v);
		}).open();
	};
	chip.addEventListener("click", edit);
	chip.addEventListener("keydown", (e) => e.key === "Enter" && edit(e));
}

// ---------- List ----------

const NONE = "\u0000none";

export interface ListOptions {
	group: GroupBy;
	showFile: boolean;
	limit?: number;
	/** Tasks-style query results: show the Tasks fields, 🛫 as written (not ⏳), and honour hide / show */
	tasksMode?: boolean;
	hide?: Set<string>;
	show?: Set<string>;
	/** show the estimate subtotal next to each group heading */
	subtotals?: boolean;
}

export function renderTaskList(app: App, el: HTMLElement, tasks: Task[], opt: ListOptions) {
	const shown = opt.limit ? tasks.slice(0, opt.limit) : tasks;
	if (opt.group === "none") {
		renderItems(app, el, shown, opt);
	} else {
		const groups = new Map<string, Task[]>();
		for (const t of shown) {
			const k = opt.group === "start" ? t.start ?? NONE : opt.group === "due" ? t.due ?? NONE : t.path;
			if (!groups.has(k)) groups.set(k, []);
			groups.get(k)!.push(t);
		}
		const keys = [...groups.keys()].sort((a, b) => {
			const na = a === NONE,
				nb = b === NONE;
			return na !== nb ? (na ? 1 : -1) : a.localeCompare(b);
		});
		for (const k of keys) {
			const g = groups.get(k)!;
			const h = el.createDiv({ cls: "task-hours-group" });
			const label =
				k === NONE
					? tr(opt.group === "start" ? "group.noStart" : "group.noDue")
					: opt.group === "file"
						? k.replace(/\.md$/, "")
						: headerDate(k);
			h.createSpan({ text: label });
			h.createSpan({ cls: "task-hours-group-total", text: tr("group.total", { dur: formatDuration(totalMinutes(g)), n: g.length }) });
			renderItems(app, el, g, opt);
		}
	}
	if (opt.limit && tasks.length > opt.limit) {
		el.createDiv({ cls: "task-hours-empty", text: tr("sum.more", { n: tasks.length - opt.limit }) });
	}
}

/** Results of a Tasks-style query: nested group headings, each with its estimate subtotal */
export function renderQueryGroups(app: App, el: HTMLElement, groups: TGroup[], opt: ListOptions) {
	const sums = new Map<string, { min: number; n: number }>();
	for (const g of groups)
		for (let i = 1; i <= g.headings.length; i++) {
			const k = g.headings.slice(0, i).join("\u0001");
			const s = sums.get(k) ?? { min: 0, n: 0 };
			s.min += totalMinutes(g.tasks);
			s.n += g.tasks.length;
			sums.set(k, s);
		}
	let prev: string[] = [];
	for (const g of groups) {
		g.headings.forEach((h, i) => {
			if (prev.slice(0, i + 1).join("\u0001") === g.headings.slice(0, i + 1).join("\u0001")) return;
			const s = sums.get(g.headings.slice(0, i + 1).join("\u0001"))!;
			const head = el.createDiv({ cls: `task-hours-group task-hours-group-l${Math.min(i + 1, 3)}` });
			const link = g.links[i];
			if (link) {
				// filename / backlink / path headings link to the note, as in Tasks
				const a = head.createEl("a", { cls: "internal-link", text: h });
				a.addEventListener("click", (e) => {
					stop(e);
					const f = app.vault.getAbstractFileByPath(link);
					if (f instanceof TFile) void app.workspace.getLeaf(false).openFile(f);
				});
			} else head.createSpan({ text: h });
			const parts: string[] = [];
			if (opt.subtotals) parts.push(formatDuration(s.min));
			if (opt.show?.has("group count")) parts.push(s.n === 1 ? "1 task" : `${s.n} tasks`);
			if (parts.length) head.createSpan({ cls: "task-hours-group-total", text: parts.join(" · ") });
		});
		prev = g.headings;
		renderItems(app, el, g.tasks, opt);
	}
}

/** One task in the style of the Tasks plugin: description, fields inline, (backlink), ✏️ */
function renderTasksStyleItem(app: App, ul: HTMLElement, t: Task, opt: ListOptions, today: string) {
	const hide = opt.hide ?? new Set<string>();
	const li = ul.createEl("li", { cls: "task-hours-titem" });
	if (t.done) li.addClass("is-done");
	const cb = li.createEl("input", { type: "checkbox", cls: "task-list-item-checkbox" });
	cb.checked = t.done;
	cb.addEventListener("click", (e) => {
		stop(e);
		void toggleDone(app, t);
	});
	li.createSpan({ cls: "task-hours-tdesc", text: t.name + " " });
	const f = li.createSpan({ cls: "task-hours-tfields" });
	const date = (emoji: string, value: string | null, key: string, field: TasksField) => {
		if (value && !hide.has(key)) dateChip(f, emoji, value, "", (v) => void setTasksField(app, t, field, v), true);
	};
	if (!hide.has("estimate")) estimateChip(f, t, (v) => void setField(app, t, "estimate", v));
	if (t.priority !== "none" && !hide.has("priority")) priorityChip(app, f, t);
	if (t.recurrence && !hide.has("recurrence rule")) recurrenceChip(app, f, t);
	date("➕", t.created, "created date", "created");
	// empty start / due aren't shown here (like Tasks) — add them with ✏️
	if (t.startDate && !hide.has("start date"))
		dateChip(f, "🛫", t.startDate, "task-hours-start", (v) => void setField(app, t, "start", v), true);
	date("⏳", t.scheduled, "scheduled date", "scheduled");
	if (t.due && !hide.has("due date"))
		dateChip(
			f,
			"📅",
			t.due,
			"task-hours-due" + (!t.done && t.due && t.due < today ? " is-overdue" : ""),
			(v) => void setField(app, t, "due", v),
			true
		);
	date("❌", t.cancelled, "cancelled date", "cancelled");
	date("✅", t.doneDate, "done date", "done");
	const ro = (text: string | null, key: string) => {
		if (text && !hide.has(key)) f.createSpan({ cls: "task-hours-ro", text });
	};
	ro(t.onCompletion && `🏁 ${t.onCompletion}`, "on completion");
	ro(t.id && `🆔 ${t.id}`, "id");
	ro(t.dependsOn.length ? `⛔ ${t.dependsOn.join(",")}` : null, "depends on");
	if (opt.show?.has("urgency")) ro(`⚡ ${urgency(t, new Date()).toFixed(2)}`, "urgency");
	if (!hide.has("backlink")) {
		const file = filenameOf(t.path).replace(/\.md$/, "");
		const wrap = li.createSpan({ cls: "task-hours-backlink" });
		wrap.appendText(" (");
		const a = wrap.createEl("a", { cls: "internal-link", text: t.heading ? `${file} > ${t.heading}` : file });
		a.addEventListener("click", (e) => {
			stop(e);
			void openTask(app, t);
		});
		wrap.appendText(")");
	}
	if (!hide.has("edit button")) {
		const pen = li.createSpan({ cls: "task-hours-edit clickable-icon", attr: { "aria-label": tr("edit.title"), tabindex: "0" } });
		setIcon(pen, "pencil");
		const open = (e: Event) => {
			stop(e);
			new EditTaskModal(app, t).open();
		};
		pen.addEventListener("click", open);
		pen.addEventListener("keydown", (e) => e.key === "Enter" && open(e));
	}
}

function renderItems(app: App, parent: HTMLElement, tasks: Task[], opt: ListOptions) {
	const today = fmt(new Date());
	const hide = opt.hide ?? new Set<string>();
	const tm = !!opt.tasksMode;
	if (tm) {
		const ul = parent.createEl("ul", { cls: "task-hours-tlist contains-task-list" });
		for (const t of tasks) renderTasksStyleItem(app, ul, t, opt, today);
		return;
	}
	const ul = parent.createEl("ul", { cls: "task-hours-list" });
	for (const t of tasks) {
		const li = ul.createEl("li", { cls: "task-hours-item" });
		if (t.done) li.addClass("is-done");
		const cb = li.createEl("input", { type: "checkbox", cls: "task-list-item-checkbox" });
		cb.checked = t.done;
		cb.addEventListener("click", (e) => {
			stop(e);
			void toggleDone(app, t);
		});
		const name = li.createEl("a", { cls: "task-hours-name", text: t.name, attr: { "aria-label": tr("list.open") } });
		name.addEventListener("click", (e) => {
			stop(e);
			void openTask(app, t);
		});
		const meta = li.createSpan({ cls: "task-hours-fields" });
		const ro = (icon: string, text: string | null, key: string) => {
			if (text && !hide.has(key)) meta.createSpan({ cls: "task-hours-ro", text: `${icon} ${text}` });
		};
		if (tm && t.priority !== "none" && !hide.has("priority")) meta.createSpan({ cls: "task-hours-ro", text: PRIORITY_EMOJI[t.priority] });
		if (tm) ro("🔁", t.recurrence, "recurrence rule");
		if (!hide.has("estimate")) estimateChip(meta, t, (v) => void setField(app, t, "estimate", v));
		if (tm) ro("➕", t.created && labelDate(t.created), "created date");
		if (!hide.has("start date")) dateChip(meta, "🛫", tm ? t.startDate : t.start, "task-hours-start", (v) => void setField(app, t, "start", v));
		if (tm) ro("⏳", t.scheduled && labelDate(t.scheduled), "scheduled date");
		if (!hide.has("due date"))
			dateChip(
				meta,
				"📅",
				t.due,
				"task-hours-due" + (!t.done && t.due && t.due < today ? " is-overdue" : ""),
				(v) => void setField(app, t, "due", v)
			);
		if (tm) ro("❌", t.cancelled && labelDate(t.cancelled), "cancelled date");
		if (tm) ro("✅", t.doneDate && labelDate(t.doneDate), "done date");
		if (tm) ro("🏁", t.onCompletion, "on completion");
		if (tm) ro("🆔", t.id, "id");
		if (tm) ro("⛔", t.dependsOn.join(","), "depends on");
		if (tm && opt.show?.has("urgency")) meta.createSpan({ cls: "task-hours-ro", text: `⚡ ${urgency(t, new Date()).toFixed(2)}` });
		if (opt.showFile && !hide.has("backlink")) {
			const file = filenameOf(t.path).replace(/\.md$/, "");
			meta.createSpan({ cls: "task-hours-file", text: tm && t.heading ? `${file} > ${t.heading}` : file });
		}
		if (!hide.has("edit button")) {
			const pen = meta.createSpan({ cls: "task-hours-edit clickable-icon", attr: { "aria-label": tr("edit.title"), tabindex: "0" } });
			setIcon(pen, "pencil");
			const open = (e: Event) => {
				stop(e);
				new EditTaskModal(app, t).open();
			};
			pen.addEventListener("click", open);
			pen.addEventListener("keydown", (e) => e.key === "Enter" && open(e));
		}
	}
}
