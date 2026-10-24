// Suggestions while writing a query inside a ```tasks or ```task-hours block, like a code editor.
// Each step suggests what can come next: "gr" → "group by" → "folder", "due" → "before" → "today".
// In a tasks block only the Tasks plugin's own instructions are offered; a task-hours block
// adds the estimate ones (has estimate, sort by estimate, show estimate total …).

import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile, TFolder } from "obsidian";
import { blockKindAt } from "./fence";
import { lang, t as tr } from "./i18n";
import type TaskHoursPlugin from "./main";

/** One step of the grammar. `end`: a complete line can stop here; `free`: free text follows (no suggestions) */
interface Node {
	end?: boolean;
	free?: boolean;
	values?: ValueKind; // free text, with the vault's folders / files offered as suggestions
	kids?: [string, Node][];
}

export type ValueKind = "folders" | "roots" | "files" | "paths";
/** Gives the folder / file names to suggest (folders end with "/", as Tasks writes them) */
export type ValueSource = (kind: ValueKind) => string[];

export interface QItem {
	text: string; // what is inserted
	from: number; // where on the line the replaced word starts
	desc: string;
	more: boolean; // something follows, so a space is added
	th: boolean; // Task Hours only
}

/** Short explanations for the first word(s), so the list also teaches what each instruction does */
const DESC: Record<string, [string, string]> = {
	"not done": ["Tasks that aren't done", "未完了のタスク"],
	done: ["Done tasks, or done date (done today)", "完了したタスク／完了日（done today など）"],
	due: ["Due date: due today, due before next week…", "納期：due today、due before next week など"],
	starts: ["Start date (also matches tasks with none)", "開始日（開始日のないタスクも含む）"],
	scheduled: ["Scheduled date ⏳", "予定日 ⏳"],
	happens: ["Any of start, scheduled or due date", "開始日・予定日・納期のどれか"],
	created: ["Created date ➕", "作成日 ➕"],
	cancelled: ["Cancelled date ❌", "キャンセル日 ❌"],
	"has due date": ["Has a 📅 due date", "納期があるタスク"],
	"no due date": ["No 📅 due date", "納期がないタスク"],
	"has start date": ["Has a 🛫 start date", "開始日があるタスク"],
	"no start date": ["No 🛫 start date", "開始日がないタスク"],
	"has scheduled date": ["Has a ⏳ scheduled date", "予定日があるタスク"],
	"no scheduled date": ["No ⏳ scheduled date", "予定日がないタスク"],
	"has estimate": ["Has a ⏱️ estimate", "見積があるタスク"],
	"no estimate": ["No ⏱️ estimate", "見積がないタスク"],
	estimate: ["Estimate: estimate above 2h…", "見積：estimate above 2h など"],
	priority: ["Priority: priority is high…", "優先度：priority is high など"],
	"status.type": ["Status type: TODO, DONE, IN_PROGRESS…", "状態の種類：TODO・DONE・IN_PROGRESS など"],
	"status.name": ["Status name contains…", "状態の名前で絞り込む"],
	description: ["Task text contains…", "タスク名で絞り込む"],
	path: ["File path contains…", "ファイルのパスで絞り込む"],
	folder: ["Folder contains…", "フォルダで絞り込む"],
	filename: ["File name contains…", "ファイル名で絞り込む"],
	heading: ["Heading above the task contains…", "見出しで絞り込む"],
	root: ["Top-level folder contains…", "最上位フォルダで絞り込む"],
	"has tags": ["Has tags", "タグがあるタスク"],
	"no tags": ["No tags", "タグがないタスク"],
	"tags include": ["Has a tag containing…", "タグで絞り込む"],
	"tags do not include": ["Has no tag containing…", "そのタグがないタスク"],
	"is recurring": ["Repeating tasks 🔁", "繰り返しタスク 🔁"],
	"is not recurring": ["Tasks that don't repeat", "繰り返しでないタスク"],
	"recurrence includes": ["Recurrence rule contains…", "繰り返しのルールで絞り込む"],
	"is blocked": ["Waiting on another task ⛔", "他のタスク待ち ⛔"],
	"is not blocked": ["Not waiting on another task", "他のタスク待ちでない"],
	"is blocking": ["Another task waits on it", "他のタスクが待っている"],
	"is not blocking": ["No task waits on it", "他のタスクが待っていない"],
	"has id": ["Has an 🆔 id", "🆔 があるタスク"],
	"has depends on": ["Has ⛔ depends on", "⛔ があるタスク"],
	"exclude sub-items": ["Leave out indented sub-tasks", "字下げしたサブタスクを除く"],
	"sort by": ["Order of the list", "並び順"],
	"group by": ["Group under headings", "見出しでグループ分け"],
	limit: ["Show at most N tasks", "表示する件数の上限"],
	hide: ["Hide part of the display", "表示の一部を隠す"],
	show: ["Show part of the display", "表示の一部を出す"],
	"short mode": ["Show fields as icons only", "項目をアイコンだけで表示"],
	explain: ["Explain how the query was read", "クエリの解釈を表示"],
	"ignore global query": ["Skip the Tasks global query", "Tasks のグローバルクエリを使わない"],
	"(": ["Combine filters: (A) AND (B), (A) OR (B)", "条件の組み合わせ：(A) AND (B)、(A) OR (B)"],
};

const TH_ONLY = new Set(["has estimate", "no estimate", "estimate", "estimate total"]);

function today(): string {
	const d = new Date();
	const p = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const END: Node = { end: true };
const FREE: Node = { free: true };
const node = (kids: [string, Node][], end = false): Node => ({ kids, end });

function grammar(th: boolean): Node {
	const dates = node(
		[
			"today", "tomorrow", "yesterday", "this week", "next week", "last week", "this month", "next month",
			"last month", "this quarter", "next quarter", "this year", "next year", "in 2 weeks", "7 days ago",
			"next monday", today(),
		].map((d) => [d, END])
	);
	const dateField = node([
		["before", dates],
		["after", dates],
		["on", dates],
		["on or before", dates],
		["on or after", dates],
		["in", dates],
		...(dates.kids ?? []),
	]);
	const text = node(["includes", "does not include", "regex matches", "regex does not match"].map((o) => [o, FREE]));
	// path / folder / filename / root: suggest what is in the vault after includes / does not include
	const textOf = (values: ValueKind) =>
		node([
			["includes", { free: true, values }],
			["does not include", { free: true, values }],
			["regex matches", FREE],
			["regex does not match", FREE],
		]);
	const levels: [string, Node][] = ["highest", "high", "medium", "none", "low", "lowest"].map((l) => [l, END]);
	const rev = node([["reverse", END]], true);
	const sortKeys = [
		"due", "start", "scheduled", "happens", "priority", "urgency", "description", "path", "filename", "heading",
		"tag", "status", "status.type", "done", "created", "cancelled", "recurring", "id", "random",
		...(th ? ["estimate"] : []),
	];
	const groupKeys = [
		"due", "start", "scheduled", "happens", "priority", "folder", "filename", "path", "root", "heading", "backlink",
		"tags", "status", "status.type", "done", "created", "cancelled", "recurring", "recurrence", "urgency", "id",
		...(th ? ["estimate"] : []),
	];
	const parts = [
		"edit button", "postpone button", "backlink", "task count", "tree", "priority", "start date", "due date",
		"scheduled date", "created date", "done date", "cancelled date", "recurrence rule", "tags", "id",
		"depends on", "on completion", "urgency", ...(th ? ["estimate"] : []),
	];
	const est = node(["30m", "1h", "2h", "4h", "8h"].map((v) => [v, END]));
	const kids: [string, Node][] = [
		["not done", END],
		["done", dateField],
		["due", dateField],
		["starts", dateField],
		["scheduled", dateField],
		["happens", dateField],
		["created", dateField],
		["cancelled", dateField],
		...["due", "start", "scheduled", "created", "done", "cancelled", "happens"].flatMap((f): [string, Node][] => [
			[`has ${f} date`, END],
			[`no ${f} date`, END],
		]),
		...((th
			? [
					["has estimate", END],
					["no estimate", END],
					["estimate", node([["above", est], ["below", est]])],
				]
			: []) as [string, Node][]),
		["priority", node([["is", node([["above", node(levels)], ["below", node(levels)], ["not", node(levels)], ...levels])]])],
		["status.type", node(["is", "is not"].map((o) => [o, node(["TODO", "DONE", "IN_PROGRESS", "CANCELLED", "ON_HOLD", "NON_TASK"].map((v) => [v, END]))]))],
		["status.name", text],
		["description", text],
		["path", textOf("paths")],
		["folder", textOf("folders")],
		["filename", textOf("files")],
		["heading", text],
		["root", textOf("roots")],
		["has tags", END],
		["no tags", END],
		["tags include", FREE],
		["tags do not include", FREE],
		["is recurring", END],
		["is not recurring", END],
		["recurrence includes", FREE],
		["is blocked", END],
		["is not blocked", END],
		["is blocking", END],
		["is not blocking", END],
		["has id", END],
		["has depends on", END],
		["exclude sub-items", END],
		["sort by", node(sortKeys.map((k) => [k, rev]))],
		["group by", node(groupKeys.map((k) => [k, rev]))],
		["limit", node([["10", END], ["to 10 tasks", END], ["groups 3", END]])],
		["hide", node(parts.map((p) => [p, END]))],
		["show", node([...parts.map((p): [string, Node] => [p, END]), ["group count", END], ...((th ? [["estimate total", END]] : []) as [string, Node][])])],
		["short mode", END],
		["explain", END],
		["ignore global query", END],
	];
	return { kids };
}

/**
 * Suggestions for what is typed on a query line (up to the cursor).
 * Returns where the replaced word starts (offset in `typed`) and the items, or null.
 */
export function querySuggestions(typed: string, th: boolean, source?: ValueSource): { from: number; items: QItem[] } | null {
	if (/^\s*#/.test(typed)) return null; // a comment line
	// Inside a boolean combination, suggest for the part after the last "("
	let base = typed.search(/\S/);
	if (base < 0) return null;
	const paren = typed.lastIndexOf("(");
	if (paren >= 0) base = paren + 1 + (typed.slice(paren + 1).search(/\S|$/));
	// After ")" offer the boolean operators
	const tail = typed.slice(base);
	const afterParen = typed.match(/\)\s+([A-Za-z]*)$/);
	if (afterParen && typed.lastIndexOf(")") > paren) {
		const q = afterParen[1].toUpperCase();
		const ops = ["AND", "OR", "AND NOT", "OR NOT", "XOR"].filter((o) => o.startsWith(q) && o !== q);
		if (!ops.length) return null;
		const from = typed.length - afterParen[1].length;
		return { from, items: ops.map((o) => ({ text: o, from, desc: "", more: true, th: false })) };
	}
	if (!tail && paren < 0) return null;

	const out: { from: number; items: QItem[] } = { from: typed.length, items: [] };
	const seen = new Set<string>();
	const walk = (n: Node, rest: string, at: number, depth: number) => {
		if (n.values && source) {
			// Narrow the vault's folders / files by what has been typed so far (anywhere in the name)
			const q = rest.toLowerCase();
			for (const v of source(n.values)) {
				const low = v.toLowerCase();
				if (!low.includes(q) || low === q || seen.has(v)) continue;
				seen.add(v);
				out.from = Math.min(out.from, at);
				out.items.push({ text: v, from: at, desc: "", more: false, th: false });
				if (out.items.length >= 50) break;
			}
			return;
		}
		for (const [tok, kid] of n.kids ?? []) {
			const low = rest.toLowerCase();
			const t = tok.toLowerCase();
			if (low.startsWith(t + " ")) {
				const next = rest.slice(tok.length + 1).replace(/^\s+/, "");
				walk(kid, next, typed.length - next.length, depth + 1);
			} else if (t.startsWith(low) && t !== low && !seen.has(tok)) {
				seen.add(tok);
				out.from = Math.min(out.from, at);
				const descPair = depth === 0 ? DESC[tok] : undefined;
				out.items.push({
					text: tok,
					from: at,
					desc: descPair ? descPair[lang() === "ja" ? 1 : 0] : "",
					more: !!kid.kids?.length || !!kid.free,
					th: TH_ONLY.has(tok) || (th && tok === "estimate"),
				});
			}
		}
	};
	walk(grammar(th), tail, base, 0);
	return out.items.length ? out : null;
}

function vaultValues(app: App, kind: ValueKind): string[] {
	const folders = app.vault
		.getAllLoadedFiles()
		.filter((f): f is TFolder => f instanceof TFolder && !f.isRoot())
		.map((f) => f.path + "/")
		.sort((a, b) => a.localeCompare(b));
	if (kind === "folders") return folders;
	if (kind === "roots") return folders.filter((f) => f.indexOf("/") === f.length - 1);
	const files = app.vault.getMarkdownFiles().sort((a, b) => a.path.localeCompare(b.path));
	if (kind === "files") return [...new Set(files.map((f) => f.name))];
	return [...folders, ...files.map((f) => f.path)];
}

export class QuerySuggest extends EditorSuggest<QItem> {
	private items: QItem[] = [];

	constructor(
		app: App,
		private plugin: TaskHoursPlugin
	) {
		super(app);
		this.limit = 30;
		this.setInstructions([
			{ command: "↑↓", purpose: tr("sug.select") },
			{ command: "↵", purpose: tr("sug.confirm") },
			{ command: "esc", purpose: tr("sug.close") },
		]);
	}

	onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
		if (!this.plugin.settings.querySuggest) return null;
		const before = editor.getLine(cursor.line).slice(0, cursor.ch);
		if (!before.trim()) return null; // an empty line: Enter must still make a new line
		const kind = blockKindAt(editor.getValue().split("\n"), cursor.line);
		if (!kind) return null;
		const r = querySuggestions(before, kind === "task-hours", (k) => vaultValues(this.app, k));
		if (!r) return null;
		this.items = r.items;
		return { start: { line: cursor.line, ch: r.from }, end: cursor, query: before.slice(r.from) };
	}

	getSuggestions(_ctx: EditorSuggestContext): QItem[] {
		return this.items;
	}

	renderSuggestion(item: QItem, el: HTMLElement): void {
		el.addClass("task-hours-qsug");
		const top = el.createDiv({ cls: "task-hours-qsug-main" });
		top.createSpan({ cls: "task-hours-qsug-text", text: item.text });
		if (item.th) top.createSpan({ cls: "task-hours-qsug-badge", text: "Task Hours" });
		if (item.desc) el.createDiv({ cls: "task-hours-qsug-desc", text: item.desc });
	}

	selectSuggestion(item: QItem, _evt: MouseEvent | KeyboardEvent): void {
		const ctx = this.context;
		if (!ctx) return;
		const text = item.text + (item.more ? " " : "");
		const start = { line: ctx.start.line, ch: item.from };
		// Close first, so the edit below can open the next suggestions instead of being closed by us
		this.close();
		ctx.editor.replaceRange(text, start, ctx.end);
		ctx.editor.setCursor({ line: start.line, ch: item.from + text.length });
		// Something follows (e.g. "path includes " → the vault's folders): show the next suggestions straight away.
		// Obsidian only re-checks suggestions on typing, so ask it to check again now.
		if (item.more) {
			const editor = ctx.editor;
			const file = ctx.file;
			window.setTimeout(() => (this as unknown as Retrigger).trigger?.(editor, file, true), 0);
		}
	}
}

/** EditorSuggest's own (undocumented) re-check; used only if present */
interface Retrigger {
	trigger?: (editor: Editor, file: TFile | null, openIfClosed: boolean) => void;
}
