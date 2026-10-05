// Editor helpers: date and estimate suggestions, and converting shorthand when the cursor leaves a line

import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, Modal, Setting, TFile } from "obsidian";
import { DatePreset, datePresets, labelDate, parseDateWord, toHalfWidth } from "./dates";
import { t as tr } from "./i18n";
import type TaskHoursPlugin from "./main";
import { Field, TASK_RE, formatDuration, setLineField } from "./parse";
import { convertShorthand, durationValue, estimateCandidates, isInFence } from "./shorthand";

interface DateItem {
	label: string;
	date: string | null; // null = open the date picker
}

const FIELD_ICON: Record<Field, string> = { estimate: "⏱️", start: "🛫", due: "📅" };

/**
 * Put a field (date or estimate) into the line and return where the cursor should go:
 * right after the value, followed by a space so the next entry can be typed straight away.
 */
export function insertDateField(
	line: string,
	field: Field,
	date: string,
	convert?: (line: string) => string | null
): { text: string; ch: number } {
	let text = setLineField(line, field, date);
	// Also convert any other shorthand already on the line (e.g. "40min"), so the
	// line is complete right away instead of waiting for the cursor to leave it.
	if (convert) text = convert(text) ?? text;
	const token = `${FIELD_ICON[field]} ${date}`;
	const idx = text.indexOf(token);
	if (idx < 0) return { text, ch: text.length };
	const after = idx + token.length;
	if (after === text.length) text += " ";
	return { text, ch: after + 1 };
}

/** Typing @ or ! in a task line shows date suggestions */
export class DateSuggest extends EditorSuggest<DateItem> {
	private field: Field = "start";

	constructor(app: App, private plugin: TaskHoursPlugin) {
		super(app);
		this.limit = 15;
		this.setInstructions([
			{ command: "↑↓", purpose: tr("sug.select") },
			{ command: "↵", purpose: tr("sug.confirm") },
			{ command: "esc", purpose: tr("sug.close") },
		]);
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
		const s = this.plugin.settings;
		if (!s.dateSuggest) return null;
		const line = editor.getLine(cursor.line);
		const tm = line.match(TASK_RE);
		if (!tm) return null;
		const bodyStart = line.length - tm[2].length;
		const before = toHalfWidth(line.slice(0, cursor.ch));
		const triggers: [string, Field][] = [
			[toHalfWidth(s.startChar), "start"],
			[toHalfWidth(s.dueChar), "due"],
		];
		let best: { idx: number; field: Field; len: number } | null = null;
		for (const [ch, field] of triggers) {
			if (!ch) continue;
			const idx = before.lastIndexOf(ch);
			if (idx < bodyStart || idx < 0) continue;
			if (idx > 0 && /[A-Za-z0-9._%+-]/.test(before[idx - 1])) continue;
			if (/\s/.test(before.slice(idx + ch.length))) continue; // a space ends the token
			if (!best || idx > best.idx) best = { idx, field, len: ch.length };
		}
		if (!best) return null;
		this.field = best.field;
		return {
			start: { line: cursor.line, ch: best.idx },
			end: cursor,
			query: line.slice(best.idx + best.len, cursor.ch),
		};
	}

	getSuggestions(ctx: EditorSuggestContext): DateItem[] {
		const today = new Date();
		const q = toHalfWidth(ctx.query).trim().toLowerCase();
		const presets = datePresets(today);
		const items: DateItem[] = [];
		const seen = new Set<string>();
		const push = (label: string, date: string | null) => {
			const key = label + date;
			if (seen.has(key)) return;
			seen.add(key);
			items.push({ label, date });
		};
		if (q) {
			const d = parseDateWord(q, today, this.plugin.settings.dayFirst);
			if (d) push(ctx.query, d);
			presets
				.filter((p: DatePreset) => p.keys.some((k) => k.toLowerCase().startsWith(q)))
				.forEach((p) => push(p.label, p.date));
			if (!items.length) return [];
		} else {
			presets.forEach((p) => push(p.label, p.date));
		}
		push(tr("sug.calendar"), null);
		return items;
	}

	renderSuggestion(item: DateItem, el: HTMLElement) {
		el.addClass("task-hours-suggest");
		const icon = this.field === "start" ? "🛫" : "📅";
		el.createSpan({ cls: "task-hours-suggest-label", text: `${icon} ${item.label}` });
		if (item.date) el.createSpan({ cls: "task-hours-suggest-date", text: labelDate(item.date) });
		el.createSpan({ cls: "task-hours-suggest-kind", text: tr(this.field === "start" ? "sug.start" : "sug.due") });
	}

	selectSuggestion(item: DateItem, _evt: MouseEvent | KeyboardEvent) {
		const ctx = this.context;
		if (!ctx) return;
		const { editor, start, end } = ctx;
		const field = this.field;
		const apply = (date: string) => {
			const line = editor.getLine(start.line);
			const removed = line.slice(0, start.ch) + line.slice(end.ch);
			const s = this.plugin.settings;
			const convert = s.autoConvert ? (l: string) => convertShorthand(l, s, new Date()) : undefined;
			const { text, ch } = insertDateField(removed, field, date, convert);
			editor.replaceRange(text, { line: start.line, ch: 0 }, { line: start.line, ch: line.length });
			editor.setCursor({ line: start.line, ch });
			editor.focus();
		};
		this.close();
		if (item.date) apply(item.date);
		else new DatePickerModal(this.app, field, apply).open();
	}
}

interface EstimateItem {
	minutes: number;
}

/** Typing + in a task line suggests estimates (+, +40, +2h, +1h30 …) */
export class EstimateSuggest extends EditorSuggest<EstimateItem> {
	constructor(
		app: App,
		private plugin: TaskHoursPlugin
	) {
		super(app);
		this.limit = 10;
		this.setInstructions([
			{ command: "↑↓", purpose: tr("sug.select") },
			{ command: "↵", purpose: tr("sug.confirm") },
			{ command: "esc", purpose: tr("sug.close") },
		]);
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
		const s = this.plugin.settings;
		if (!s.dateSuggest) return null;
		const ch = toHalfWidth(s.estimateChar);
		if (!ch) return null;
		const line = editor.getLine(cursor.line);
		const tm = line.match(TASK_RE);
		if (!tm) return null;
		const bodyStart = line.length - tm[2].length;
		const before = toHalfWidth(line.slice(0, cursor.ch));
		const idx = before.lastIndexOf(ch);
		if (idx < bodyStart || idx < 0) return null;
		if (idx > 0 && !triggerBoundary(before[idx - 1], s)) return null;
		const query = before.slice(idx + ch.length);
		if (/\s/.test(query)) return null;
		return { start: { line: cursor.line, ch: idx }, end: cursor, query: line.slice(idx + ch.length, cursor.ch) };
	}

	getSuggestions(ctx: EditorSuggestContext): EstimateItem[] {
		return estimateCandidates(ctx.query).map((minutes) => ({ minutes }));
	}

	renderSuggestion(item: EstimateItem, el: HTMLElement) {
		el.addClass("task-hours-suggest");
		el.createSpan({ cls: "task-hours-suggest-label", text: `⏱️ ${formatDuration(item.minutes)}` });
		el.createSpan({ cls: "task-hours-suggest-kind", text: tr("sug.estimate") });
	}

	selectSuggestion(item: EstimateItem, _evt: MouseEvent | KeyboardEvent) {
		const ctx = this.context;
		if (!ctx) return;
		const { editor, start, end } = ctx;
		this.close();
		const line = editor.getLine(start.line);
		const removed = line.slice(0, start.ch) + line.slice(end.ch);
		const s = this.plugin.settings;
		const convert = s.autoConvert ? (l: string) => convertShorthand(l, s, new Date()) : undefined;
		const { text, ch } = insertDateField(removed, "estimate", durationValue(item.minutes), convert);
		editor.replaceRange(text, { line: start.line, ch: 0 }, { line: start.line, ch: line.length });
		editor.setCursor({ line: start.line, ch });
		editor.focus();
	}
}

/** A trigger symbol only counts when it doesn't follow a letter/digit (a@b.com, C++) or another trigger */
function triggerBoundary(prev: string, s: TaskHoursPlugin["settings"]): boolean {
	if (/[A-Za-z0-9._%+-]/.test(prev)) return false;
	return ![s.startChar, s.dueChar, s.estimateChar].map(toHalfWidth).includes(prev);
}

class DatePickerModal extends Modal {
	constructor(app: App, private field: Field, private onPick: (d: string) => void) {
		super(app);
	}
	onOpen() {
		this.setTitle(tr(this.field === "start" ? "pick.start" : "pick.due"));
		let value = "";
		new Setting(this.contentEl)
			.addText((t) => {
				t.inputEl.type = "date";
				t.onChange((v) => (value = v));
				window.setTimeout(() => {
					t.inputEl.focus();
					try {
						t.inputEl.showPicker();
					} catch {
						/* noop */
					}
				}, 50);
			})
			.addButton((b) =>
				b
					.setButtonText(tr("pick.ok"))
					.setCta()
					.onClick(() => {
						if (value) this.onPick(value);
						this.close();
					})
			);
	}
	onClose() {
		this.contentEl.empty();
	}
}

/** When the cursor leaves a line (Enter, arrows, click), convert that line's shorthand */
export function shorthandExtension(plugin: TaskHoursPlugin) {
	return ViewPlugin.fromClass(
		class {
			private pos: number;
			constructor(view: EditorView) {
				this.pos = view.state.selection.main.head;
			}
			update(u: ViewUpdate) {
				const prev = u.docChanged ? u.changes.mapPos(this.pos, -1) : this.pos;
				const head = u.state.selection.main.head;
				this.pos = head;
				if (!plugin.settings.autoConvert) return;
				if (!u.docChanged && !u.selectionSet) return;
				const doc = u.state.doc;
				const prevLine = doc.lineAt(Math.min(prev, doc.length));
				if (prevLine.number === doc.lineAt(head).number) return;
				const view = u.view;
				const lineNo = prevLine.number;
				// Can't dispatch during an update, so do it right after
				window.setTimeout(() => convertLine(plugin, view, lineNo), 0);
			}
		}
	);
}

function convertLine(plugin: TaskHoursPlugin, view: EditorView, lineNo: number, tries = 0) {
	// An IME (e.g. Japanese input) may already be composing on the next line.
	// Editing the document then would disturb it, so wait until it finishes.
	// Some IMEs keep reporting "composing" for a long time, so only wait briefly:
	// the edit is on a different line from the composition anyway.
	if (view.composing && tries < 10) {
		window.setTimeout(() => convertLine(plugin, view, lineNo, tries + 1), 200);
		return;
	}
	const doc = view.state.doc;
	if (lineNo < 1 || lineNo > doc.lines) return;
	const line = doc.line(lineNo);
	if (doc.lineAt(view.state.selection.main.head).number === lineNo) return;
	if (!TASK_RE.test(line.text)) return;
	if (isInFence((i) => doc.line(i + 1).text, lineNo - 1)) return;
	const next = convertShorthand(line.text, plugin.settings, new Date());
	if (next === null) return;
	view.dispatch({ changes: { from: line.from, to: line.to, insert: next }, userEvent: "input.task-hours" });
}

/** For the command: convert the current line now */
export function convertCurrentLine(plugin: TaskHoursPlugin, editor: Editor) {
	const c = editor.getCursor();
	const text = editor.getLine(c.line);
	const next = convertShorthand(text, plugin.settings, new Date());
	if (next === null) return false;
	editor.setLine(c.line, next);
	editor.setCursor({ line: c.line, ch: next.length });
	return true;
}
