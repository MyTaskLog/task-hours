// Task list rendering and editing from the list (done, start, due, estimate)

import { App, MarkdownView, Notice, TFile } from "obsidian";
import { headerDate, labelDate } from "./dates";
import { t as tr } from "./i18n";
import { Field, Task, estimateText, fmt, formatDuration, parseDuration, setLineField, totalMinutes } from "./parse";

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
		input.placeholder = "1h30m";
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

function renderItems(app: App, parent: HTMLElement, tasks: Task[], opt: ListOptions) {
	const today = fmt(new Date());
	const ul = parent.createEl("ul", { cls: "task-hours-list" });
	for (const t of tasks) {
		const li = ul.createEl("li", { cls: "task-hours-item" });
		if (t.done) li.addClass("is-done");
		const cb = li.createEl("input", { type: "checkbox", cls: "task-list-item-checkbox" });
		cb.checked = t.done;
		cb.addEventListener("click", (e) => {
			stop(e);
			toggleDone(app, t);
		});
		const name = li.createEl("a", { cls: "task-hours-name", text: t.name, attr: { "aria-label": tr("list.open") } });
		name.addEventListener("click", (e) => {
			stop(e);
			openTask(app, t);
		});
		const meta = li.createSpan({ cls: "task-hours-fields" });
		estimateChip(meta, t, (v) => setField(app, t, "estimate", v));
		dateChip(meta, "🛫", t.start, "task-hours-start", (v) => setField(app, t, "start", v));
		dateChip(
			meta,
			"📅",
			t.due,
			"task-hours-due" + (!t.done && t.due && t.due < today ? " is-overdue" : ""),
			(v) => setField(app, t, "due", v)
		);
		if (opt.showFile) {
			meta.createSpan({ cls: "task-hours-file", text: t.path.replace(/\.md$/, "").split("/").pop() ?? "" });
		}
	}
}
