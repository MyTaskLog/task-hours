// Code block names: typing ```t suggests "tasks" and "task-hours", like a code editor.
// Choosing one also writes the closing ``` when the block has none, with the cursor inside.

import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian";
import { t as tr } from "./i18n";
import { markBigSuggest } from "./editor";
import type TaskHoursPlugin from "./main";

interface BlockItem {
	name: string;
	desc: string;
}

/** An opening/closing fence line: optional indent or quote marks, then ``` or ~~~, then the info string */
const FENCE = /^(\s*(?:>\s*)*)(`{3,}|~{3,})(.*)$/;

interface Fence {
	char: string;
	len: number;
}

function closes(line: string, open: Fence): boolean {
	const m = line.match(FENCE);
	return !!m && m[2][0] === open.char && m[2].length >= open.len && !m[3].trim();
}

/** Which query block line `ln` is inside: "tasks", "task-hours", or null (outside, or another kind of block) */
export function blockKindAt(lines: string[], ln: number): "tasks" | "task-hours" | null {
	let open: (Fence & { info: string }) | null = null;
	for (let i = 0; i < ln; i++) {
		const line = lines[i];
		if (open) {
			if (closes(line, open)) open = null;
			continue;
		}
		const m = line.match(FENCE);
		if (m && !(m[2][0] === "`" && m[3].includes("`")))
			open = { char: m[2][0], len: m[2].length, info: m[3].trim().split(/\s+/)[0].toLowerCase() };
	}
	if (!open) return null;
	const name = open.info.replace(/[-_]/g, "");
	return name === "tasks" ? "tasks" : name === "taskhours" ? "task-hours" : null;
}

/**
 * Look at the code blocks around line `ln`.
 * opener: the fence on `ln` starts a block (it is not the end of one above).
 * closed: a matching closing fence follows before any other block starts.
 */
export function fenceState(lines: string[], ln: number, fence: Fence): { opener: boolean; closed: boolean } {
	let open: Fence | null = null;
	for (let i = 0; i < ln; i++) {
		const line = lines[i];
		if (open) {
			if (closes(line, open)) open = null;
			continue;
		}
		const m = line.match(FENCE);
		if (m && !(m[2][0] === "`" && m[3].includes("`"))) open = { char: m[2][0], len: m[2].length };
	}
	if (open) return { opener: false, closed: false };
	for (let i = ln + 1; i < lines.length; i++) {
		const m = lines[i].match(FENCE);
		if (!m) continue;
		// A bare fence closes ours; a fence with a name is the next block, so ours has no end yet
		return { opener: true, closed: closes(lines[i], fence) };
	}
	return { opener: true, closed: false };
}

/** Which names to offer for what was typed after the fence (needs at least one letter) */
export function blockCandidates(typed: string): string[] {
	const q = typed.toLowerCase();
	if (!q) return [];
	return ["tasks", "task-hours"].filter((n) => n.startsWith(q));
}

export class CodeBlockSuggest extends EditorSuggest<BlockItem> {
	constructor(
		app: App,
		private plugin: TaskHoursPlugin
	) {
		super(app);
		markBigSuggest(this);
		this.setInstructions([
			{ command: "↑↓", purpose: tr("sug.select") },
			{ command: "↵", purpose: tr("sug.confirm") },
			{ command: "esc", purpose: tr("sug.close") },
		]);
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
		if (!this.plugin.settings.blockSuggest) return null;
		const line = editor.getLine(cursor.line);
		const before = line.slice(0, cursor.ch);
		const after = line.slice(cursor.ch);
		const m = before.match(/^(\s*(?:>\s*)*)(`{3,}|~{3,})([A-Za-z][\w-]*)$/);
		// Allow backticks after the cursor, in case the editor paired them automatically
		if (!m || !/^[`~]*\s*$/.test(after)) return null;
		if (!blockCandidates(m[3]).length) return null;
		const lines = editor.getValue().split("\n");
		if (!fenceState(lines, cursor.line, { char: m[2][0], len: m[2].length }).opener) return null;
		return {
			start: { line: cursor.line, ch: m[1].length + m[2].length },
			end: cursor,
			query: m[3],
		};
	}

	getSuggestions(ctx: EditorSuggestContext): BlockItem[] {
		return blockCandidates(ctx.query).map((name) => ({
			name,
			desc: tr(name === "tasks" ? "block.tasks" : "block.taskHours"),
		}));
	}

	renderSuggestion(item: BlockItem, el: HTMLElement): void {
		el.addClass("task-hours-blocksug");
		el.closest(".suggestion-container")?.addClass("task-hours-bigsuggest"); // in case suggestEl was not available
		el.createDiv({ cls: "task-hours-blocksug-name", text: item.name });
		el.createDiv({ cls: "task-hours-blocksug-desc", text: item.desc });
	}

	selectSuggestion(item: BlockItem, _evt: MouseEvent | KeyboardEvent): void {
		const ctx = this.context;
		if (!ctx) return;
		const ed = ctx.editor;
		const ln = ctx.start.line;
		const line = ed.getLine(ln);
		const m = line.match(FENCE);
		if (!m) return;
		const indent = m[1];
		const fence = line.slice(indent.length, ctx.start.ch); // backticks paired after the cursor are dropped
		const opening = indent + fence + item.name;
		const lineEnd = { line: ln, ch: line.length };
		const { closed } = fenceState(ed.getValue().split("\n"), ln, { char: fence[0], len: fence.length });
		if (!closed) {
			// No end yet: write it, and put the cursor on the empty line in between
			ed.replaceRange(`${opening}\n${indent}\n${indent}${fence}`, { line: ln, ch: 0 }, lineEnd);
		} else if (closes(ed.getLine(ln + 1) ?? "", { char: fence[0], len: fence.length })) {
			// Empty block: open a line inside it
			ed.replaceRange(`${opening}\n${indent}`, { line: ln, ch: 0 }, lineEnd);
		} else {
			ed.replaceRange(opening, { line: ln, ch: 0 }, lineEnd);
		}
		ed.setCursor({ line: ln + 1, ch: ed.getLine(ln + 1).length });
		this.close();
	}
}
