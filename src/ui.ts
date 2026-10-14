// Task list rendering and editing from the list (done, start, due, estimate)

import { App, MarkdownView, Modal, Notice, Setting, TFile, setIcon } from "obsidian";
import { headerDate, labelDate } from "./dates";
import { t as tr } from "./i18n";
import { Field, PRIORITY_EMOJI, Task, estimateText, fmt, formatDuration, parseDuration, setLineField, totalMinutes } from "./parse";
import { TGroup, filenameOf, urgency } from "./tquery";

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

/** Set several fields in one write (used by the edit dialog) */
export function setFields(app: App, t: Task, values: Partial<Record<Field, string | null>>) {
	return rewrite(app, t, (l) => {
		for (const f of ["estimate", "start", "due"] as Field[]) if (f in values) l = setLineField(l, f, values[f] ?? null);
		return l;
	});
}

/** ✏️ dialog: estimate, start date and due date (the only fields Task Hours edits) */
export class EditTaskModal extends Modal {
	private estimate: string;
	private start: string;
	private due: string;

	constructor(
		app: App,
		private task: Task
	) {
		super(app);
		this.estimate = task.minutes === null ? "" : (estimateText(task.raw) ?? "");
		this.start = task.startDate ?? "";
		this.due = task.due ?? "";
	}

	onOpen() {
		const { contentEl } = this;
		this.setTitle(tr("edit.title"));
		contentEl.createDiv({ cls: "task-hours-edit-name", text: this.task.name });
		new Setting(contentEl)
			.setName(tr("add.estimate"))
			.setDesc(tr("add.estimateDesc"))
			.addText((t) => {
				t.setPlaceholder(tr("add.estimatePh")).setValue(this.estimate).onChange((v) => (this.estimate = v));
				window.setTimeout(() => t.inputEl.focus(), 0);
			});
		new Setting(contentEl).setName(tr("add.start")).addText((t) => {
			t.inputEl.type = "date";
			t.setValue(this.start).onChange((v) => (this.start = v));
		});
		new Setting(contentEl).setName(tr("add.due")).addText((t) => {
			t.inputEl.type = "date";
			t.setValue(this.due).onChange((v) => (this.due = v));
		});
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
		const est = this.estimate.trim();
		if (est && parseDuration(est) === null) {
			new Notice(tr("add.badEstimate"));
			return;
		}
		if (this.start && this.due && this.start > this.due) {
			new Notice(tr("add.startAfterDue"));
			return;
		}
		await setFields(this.app, this.task, { estimate: est || null, start: this.start || null, due: this.due || null });
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

function dateChip(parent: HTMLElement, icon: string, value: string | null, cls: string, onSet: (v: string | null) => void) {
	const chip = parent.createSpan({
		cls: "task-hours-chip " + cls + (value ? "" : " is-empty"),
		text: value ? `${icon} ${labelDate(value)}` : `${icon} +`,
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

function estimateChip(parent: HTMLElement, t: Task, onSet: (v: string | null) => void) {
	const chip = parent.createSpan({
		cls: "task-hours-chip task-hours-est" + (t.minutes === null ? " is-missing" : ""),
		text: t.minutes === null ? "⏱️ ?" : `⏱️ ${formatDuration(t.minutes)}`,
		attr: { "aria-label": tr("list.clickToEstimate"), tabindex: "0" },
	});
	const edit = (e: Event) => {
		stop(e);
		const input = createEl("input", { type: "text", cls: "task-hours-input task-hours-input-est" });
		input.placeholder = tr("add.estimatePh");
		const orig = t.minutes === null ? "" : estimateText(t.raw) ?? "";
		input.value = orig;
		chip.replaceWith(input);
		input.focus();
		input.select();
		let finished = false;
		const finish = (commit: boolean) => {
			if (finished) return;
			const v = input.value.trim();
			if (commit && v && parseDuration(v) === null) {
				new Notice(tr("list.badEstimate"));
				return;
			}
			finished = true;
			input.replaceWith(chip);
			if (commit && v !== orig) onSet(v || null);
		};
		input.addEventListener("keydown", (ev) => {
			if (ev.key === "Enter" && !ev.isComposing) finish(true);
			if (ev.key === "Escape") {
				input.value = orig;
				finish(false);
			}
		});
		input.addEventListener("blur", () => {
			if (!finished) {
				const v = input.value.trim();
				if (v && parseDuration(v) === null) input.value = orig;
				finish(true);
			}
		});
		input.addEventListener("click", stop);
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
			head.createSpan({ text: h });
			const count = opt.show?.has("group count") ? tr("group.total", { dur: formatDuration(s.min), n: s.n }) : formatDuration(s.min);
			head.createSpan({ cls: "task-hours-group-total", text: count });
		});
		prev = g.headings;
		renderItems(app, el, g.tasks, opt);
	}
}

function renderItems(app: App, parent: HTMLElement, tasks: Task[], opt: ListOptions) {
	const today = fmt(new Date());
	const hide = opt.hide ?? new Set<string>();
	const tm = !!opt.tasksMode;
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
