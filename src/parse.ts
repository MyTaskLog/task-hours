// Pure logic (no Obsidian API)

import { t as tr } from "./i18n";

export type Priority = "highest" | "high" | "medium" | "none" | "low" | "lowest";
export type StatusType = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface Task {
	path: string;
	line: number;
	raw: string;
	status: string; // the character inside [ ]
	statusType: StatusType;
	done: boolean;
	name: string; // description without the Tasks fields (tags kept)
	minutes: number | null; // estimate in minutes
	start: string | null; // 🛫, or ⏳ when there is no 🛫 (used by the dashboard)
	due: string | null; // YYYY-MM-DD
	// Tasks plugin fields, as written
	startDate: string | null; // 🛫 only
	scheduled: string | null; // ⏳
	created: string | null; // ➕
	doneDate: string | null; // ✅
	cancelled: string | null; // ❌
	priority: Priority;
	recurrence: string | null; // 🔁 every week …
	onCompletion: string | null; // 🏁 keep / delete
	id: string | null; // 🆔
	dependsOn: string[]; // ⛔
	tags: string[];
	heading: string | null;
}

/** highest first (Tasks' order) */
export const PRIORITY_ORDER: Priority[] = ["highest", "high", "medium", "none", "low", "lowest"];
export const PRIORITY_EMOJI: Record<Priority, string> = { highest: "🔺", high: "⏫", medium: "🔼", none: "", low: "🔽", lowest: "⏬" };

export const TASK_RE = /^\s*(?:[-*+]|\d+[.)])\s+\[(.)\]\s+(.*)$/;
const DATE = "(\\d{4}-\\d{2}-\\d{2})";
const dateRe = (emoji: string) => new RegExp(emoji + "\\uFE0F?\\s*" + DATE, "u");
const START_RE = dateRe("🛫");
const SCHEDULED_RE = dateRe("⏳");
const DUE_RE = dateRe("📅");
const CREATED_RE = dateRe("➕");
const DONE_RE = dateRe("✅");
const CANCELLED_RE = dateRe("❌");
// Characters that start a Tasks field (used to find where a free-text field ends)
const FIELD_START = "🛫⏳📅✅➕❌⏱🔺⏫🔼🔽⏬🔁🏁🆔⛔";
const RECURRENCE_RE = new RegExp("🔁\\uFE0F?\\s*([^" + FIELD_START + "^]*)", "u");
const ON_COMPLETION_RE = /🏁\uFE0F?\s*([A-Za-z]+)/u;
const ID_RE = /🆔\uFE0F?\s*([A-Za-z0-9_-]+)/u;
const DEPENDS_RE = /⛔\uFE0F?\s*([A-Za-z0-9_,\s-]+)/u;
const TAG_RE = /(?:^|\s)(#[^\s#,.;:!?'"()[\]{}]+)/gu;
const BLOCK_ID_RE = /\s\^[A-Za-z0-9-]+\s*$/;
// Units are listed longest first. With the short ones (m, h) first,
// "30min" would match as "30m" and leave "in" behind in the task name.
const UNIT_H = "(?:hours?|hrs?|h|時間|時)";
const UNIT_M = "(?:minutes?|mins?|m|分)";
const NUM = "\\d+(?:\\.\\d+)?";
// Don't match when letters/digits follow the unit ("30minx" is not "30m" + "inx")
const END = "(?![A-Za-z0-9.])";
// Estimate forms: 1h30m / 1h 30min / 2h / 90m / 1時間30分 / 2 (= hours)
export const DURATION =
	"(?:" + NUM + "\\s*" + UNIT_H + "(?:\\s*" + NUM + "\\s*" + UNIT_M + ")?" + "|" + NUM + "\\s*" + UNIT_M + "|" + NUM + ")" + END;
const EST_RE = new RegExp("⏱\\uFE0F?\\s*(" + DURATION + ")", "iu");
// Tasks plugin fields stripped from the displayed name
const STRIP_RES = [
	EST_RE,
	/[🛫⏳📅✅➕❌]\uFE0F?\s*\d{4}-\d{2}-\d{2}/gu,
	new RegExp("🔁\\uFE0F?[^" + FIELD_START + "^]*", "gu"),
	/🏁\uFE0F?\s*[A-Za-z]+/gu,
	/🆔\uFE0F?\s*[A-Za-z0-9_-]+/gu,
	/⛔\uFE0F?\s*[A-Za-z0-9_,\s-]+/gu,
	/[🔺⏫🔼🔽⏬]\uFE0F?/gu,
	BLOCK_ID_RE,
];

/** The estimate as written in the line (e.g. "1h30m"), or null */
export function estimateText(line: string): string | null {
	const m = line.match(EST_RE);
	return m ? m[1].trim() : null;
}

export const DONE_STATUSES = ["x", "X", "-"];

/** "2h" "1.5h" "90m" "1h30m" "2時間" "30分" "1時間30分" "2" (= hours) → minutes */
export type PlainUnit = "h" | "m" | "auto";
let plainUnit: PlainUnit = "h";
/** What a plain number written after ⏱️ in a note means (setting) */
export function setPlainUnit(u: PlainUnit) {
	if (u === plainUnit) return;
	plainUnit = u;
	for (const fn of plainUnitListeners) fn();
}
const plainUnitListeners = new Set<() => void>();
/** Re-render when the setting changes; returns a function that stops listening */
export function onPlainUnitChange(fn: () => void): () => void {
	plainUnitListeners.add(fn);
	return () => plainUnitListeners.delete(fn);
}

/** The value after ⏱️: like parseDuration, but a plain number follows the setting */
export function parseEstimateField(text: string): number | null {
	const s = text.trim();
	if (/^\d+(?:\.\d+)?$/.test(s)) {
		const n = parseFloat(s);
		const asMin = plainUnit === "m" || (plainUnit === "auto" && n >= 10 && !s.includes("."));
		return Math.round(asMin ? n : n * 60);
	}
	return parseDuration(s);
}

export function parseDuration(text: string): number | null {
	const s = text.trim();
	if (!s) return null;
	const full = new RegExp("^(?:(" + NUM + ")\\s*" + UNIT_H + ")?\\s*(?:(" + NUM + ")\\s*" + UNIT_M + ")?$", "i");
	const m = s.match(full);
	if (m && (m[1] || m[2])) {
		const h = m[1] ? parseFloat(m[1]) : 0;
		const min = m[2] ? parseFloat(m[2]) : 0;
		return Math.round(h * 60 + min);
	}
	if (/^\d+(?:\.\d+)?$/.test(s)) return Math.round(parseFloat(s) * 60);
	return null;
}

export function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h && m) return tr("dur.hm", { h, m });
	if (h) return tr("dur.h", { h });
	return tr("dur.m", { m });
}

function statusTypeOf(symbol: string): StatusType {
	if (symbol === "x" || symbol === "X") return "DONE";
	if (symbol === "-") return "CANCELLED";
	if (symbol === "/") return "IN_PROGRESS";
	return "TODO";
}

function priorityOf(body: string): Priority {
	if (body.includes("🔺")) return "highest";
	if (body.includes("⏫")) return "high";
	if (body.includes("🔼")) return "medium";
	if (body.includes("🔽")) return "low";
	if (body.includes("⏬")) return "lowest";
	return "none";
}

export function parseTaskLine(raw: string, path: string, line: number, heading: string | null = null): Task | null {
	const m = raw.replace(/\r$/, "").match(TASK_RE);
	if (!m) return null;
	const status = m[1];
	const body = m[2];
	const get = (re: RegExp) => body.match(re)?.[1] ?? null;
	const est = body.match(EST_RE);
	const startDate = get(START_RE);
	const scheduled = get(SCHEDULED_RE);
	let name = body;
	for (const re of STRIP_RES) name = name.replace(re, " ");
	name = name.replace(/\s+/g, " ").trim();
	const tags = Array.from(name.matchAll(TAG_RE), (x) => x[1]);
	const recurrence = get(RECURRENCE_RE)?.trim() || null;
	return {
		path,
		line,
		raw,
		status,
		statusType: statusTypeOf(status),
		done: DONE_STATUSES.includes(status),
		name: name || tr("untitled"),
		minutes: est ? parseEstimateField(est[1]) : null,
		start: startDate ?? scheduled,
		due: get(DUE_RE),
		startDate,
		scheduled,
		created: get(CREATED_RE),
		doneDate: get(DONE_RE),
		cancelled: get(CANCELLED_RE),
		priority: priorityOf(body),
		recurrence,
		onCompletion: get(ON_COMPLETION_RE),
		id: get(ID_RE),
		dependsOn: (get(DEPENDS_RE) ?? "").split(",").map((s) => s.trim()).filter(Boolean),
		tags,
		heading,
	};
}

export function parseTasks(content: string, path: string): Task[] {
	const out: Task[] = [];
	const lines = content.split("\n");
	let inFence = false;
	let inFrontmatter = lines[0]?.trim() === "---";
	let heading: string | null = null;
	lines.forEach((raw, i) => {
		if (inFrontmatter) {
			if (i > 0 && /^(---|\.\.\.)\s*$/.test(raw)) inFrontmatter = false;
			return;
		}
		if (/^\s*(```|~~~)/.test(raw)) inFence = !inFence;
		if (inFence) return;
		const h = raw.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
		if (h) {
			heading = h[1];
			return;
		}
		const t = parseTaskLine(raw, path, i, heading);
		if (t) out.push(t);
	});
	return out;
}

// ---------- Dates ----------

export function fmt(d: Date): string {
	const p = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(d: Date, n: number): Date {
	const r = new Date(d);
	r.setDate(r.getDate() + n);
	return r;
}
function parseYmd(s: string): Date {
	const [y, m, d] = s.split("-").map(Number);
	return new Date(y, m - 1, d);
}

export interface DateFilter {
	from?: string; // inclusive
	to?: string; // inclusive
	none?: boolean; // only tasks without the date
	any?: boolean; // only tasks with the date
}

/** One date expression → [from, to] */
function resolveRange(expr: string, today: Date): [string, string] | null {
	const e = expr.trim().toLowerCase();
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return [e, e];
	const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
	switch (e) {
		case "today":
		case "今日":
			return [fmt(today), fmt(today)];
		case "tomorrow":
		case "明日":
			return [fmt(addDays(today, 1)), fmt(addDays(today, 1))];
		case "yesterday":
		case "昨日":
			return [fmt(addDays(today, -1)), fmt(addDays(today, -1))];
		case "this week":
		case "今週": {
			const mo = mondayOf(today);
			return [fmt(mo), fmt(addDays(mo, 6))];
		}
		case "next week":
		case "来週": {
			const mo = addDays(mondayOf(today), 7);
			return [fmt(mo), fmt(addDays(mo, 6))];
		}
		case "last week":
		case "先週": {
			const mo = addDays(mondayOf(today), -7);
			return [fmt(mo), fmt(addDays(mo, 6))];
		}
		case "this month":
		case "今月": {
			const a = new Date(today.getFullYear(), today.getMonth(), 1);
			const b = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			return [fmt(a), fmt(b)];
		}
		case "next month":
		case "来月": {
			const a = new Date(today.getFullYear(), today.getMonth() + 1, 1);
			const b = new Date(today.getFullYear(), today.getMonth() + 2, 0);
			return [fmt(a), fmt(b)];
		}
	}
	const nd = e.match(/^(?:next\s+)?(\d+)\s*(?:days|日間?)$/);
	if (nd) return [fmt(today), fmt(addDays(today, parseInt(nd[1]) - 1))];
	return null;
}

export function parseDateFilter(expr: string, today: Date): DateFilter | null {
	const e = expr.trim();
	const low = e.toLowerCase();
	if (low === "none" || e === "なし") return { none: true };
	if (low === "any" || e === "あり") return { any: true };
	if (e.includes("..")) {
		const [a, b] = e.split("..");
		const f: DateFilter = {};
		if (a.trim()) {
			const r = resolveRange(a, today);
			if (!r) return null;
			f.from = r[0];
		}
		if (b.trim()) {
			const r = resolveRange(b, today);
			if (!r) return null;
			f.to = r[1];
		}
		return f;
	}
	let m: RegExpMatchArray | null;
	if ((m = e.match(/^(?:before|より前)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*より前$/))) {
		const r = resolveRange(m[1], today);
		return r ? { to: fmt(addDays(parseYmd(r[0]), -1)) } : null;
	}
	if ((m = e.match(/^(?:after|より後)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*より後$/))) {
		const r = resolveRange(m[1], today);
		return r ? { from: fmt(addDays(parseYmd(r[1]), 1)) } : null;
	}
	if ((m = e.match(/^(?:on or before|until|まで)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*まで$/))) {
		const r = resolveRange(m[1], today);
		return r ? { to: r[1] } : null;
	}
	if ((m = e.match(/^(?:on or after|from|から)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*から$/))) {
		const r = resolveRange(m[1], today);
		return r ? { from: r[0] } : null;
	}
	const r = resolveRange(e, today);
	return r ? { from: r[0], to: r[1] } : null;
}

export function matchDate(value: string | null, f: DateFilter): boolean {
	if (f.none) return value === null;
	if (value === null) return false;
	if (f.from && value < f.from) return false;
	if (f.to && value > f.to) return false;
	return true;
}

// ---------- Query ----------

export type Scope = { kind: "this" } | { kind: "all" } | { kind: "folder"; path: string };
export type GroupBy = "none" | "start" | "due" | "file";

export interface Query {
	scope: Scope;
	status: "open" | "done" | "all";
	start?: DateFilter;
	due?: DateFilter;
	group: GroupBy;
	sort: "start" | "due" | "estimate" | "file";
	show: "list" | "summary";
	limit?: number;
	errors: string[];
}

export function parseQuery(source: string, today: Date): Query {
	const q: Query = { scope: { kind: "this" }, status: "open", group: "none", sort: "start", show: "list", errors: [] };
	for (const rawLine of source.split("\n")) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const idx = line.indexOf(":");
		if (idx < 0) {
			q.errors.push(tr("q.badLine", { line }));
			continue;
		}
		const key = line.slice(0, idx).trim().toLowerCase();
		const val = line.slice(idx + 1).trim();
		switch (key) {
			case "scope":
			case "範囲":
				if (["this", "note", "このノート"].includes(val)) q.scope = { kind: "this" };
				else if (["all", "vault", "全体", "すべて"].includes(val)) q.scope = { kind: "all" };
				else q.errors.push(tr("q.badScope", { val }));
				break;
			case "folder":
			case "フォルダ":
				q.scope = { kind: "folder", path: val.replace(/^\/+|\/+$/g, "") };
				break;
			case "status":
			case "状態":
				if (["open", "未完了"].includes(val)) q.status = "open";
				else if (["done", "完了"].includes(val)) q.status = "done";
				else if (["all", "すべて"].includes(val)) q.status = "all";
				else q.errors.push(tr("q.badStatus", { val }));
				break;
			case "start":
			case "開始": {
				const f = parseDateFilter(val, today);
				if (f) q.start = f;
				else q.errors.push(tr("q.badDate", { val }));
				break;
			}
			case "due":
			case "納期": {
				const f = parseDateFilter(val, today);
				if (f) q.due = f;
				else q.errors.push(tr("q.badDate", { val }));
				break;
			}
			case "group":
			case "グループ":
				if (["none", "start", "due", "file"].includes(val)) q.group = val as GroupBy;
				else q.errors.push(tr("q.badGroup", { val }));
				break;
			case "sort":
			case "並び順":
				if (["start", "due", "estimate", "file"].includes(val)) q.sort = val as Query["sort"];
				else q.errors.push(tr("q.badSort", { val }));
				break;
			case "show":
			case "表示":
				if (["list", "summary"].includes(val)) q.show = val as Query["show"];
				else q.errors.push(tr("q.badShow", { val }));
				break;
			case "limit":
				q.limit = parseInt(val) || undefined;
				break;
			default:
				q.errors.push(tr("q.badKey", { key }));
		}
	}
	return q;
}

export function filterTasks(tasks: Task[], q: Query): Task[] {
	let r = tasks.filter((t) => {
		if (q.status === "open" && t.done) return false;
		if (q.status === "done" && !t.done) return false;
		if (q.start && !matchDate(t.start, q.start)) return false;
		if (q.due && !matchDate(t.due, q.due)) return false;
		return true;
	});
	const key = (t: Task): string => {
		switch (q.sort) {
			case "start":
				return (t.start ?? "9999") + (t.due ?? "9999");
			case "due":
				return (t.due ?? "9999") + (t.start ?? "9999");
			case "estimate":
				return String(100000 - (t.minutes ?? 0)).padStart(6, "0");
			case "file":
				return t.path + String(t.line).padStart(6, "0");
		}
	};
	r = r.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : a.path.localeCompare(b.path) || a.line - b.line));
	return r;
}

export function totalMinutes(tasks: Task[]): number {
	return tasks.reduce((s, t) => s + (t.minutes ?? 0), 0);
}

// ---------- Editing fields in a task line ----------

export type Field = "estimate" | "start" | "due";

const FIELD_RE: Record<Field, RegExp> = {
	estimate: new RegExp("⏱\\uFE0F?\\s*(?:" + DURATION + "|\\S*)", "u"),
	start: /🛫️?\s*\d{4}-\d{2}-\d{2}/u,
	due: /📅️?\s*\d{4}-\d{2}-\d{2}/u,
};
const FIELD_TEXT: Record<Field, (v: string) => string> = {
	estimate: (v) => `⏱️ ${v}`,
	start: (v) => `🛫 ${v}`,
	due: (v) => `📅 ${v}`,
};
// When inserting, place the field before these (matches the Tasks plugin's order)
const INSERT_BEFORE: Record<Field, RegExp> = {
	estimate: /[🔺⏫🔼🔽⏬🔁🏁➕🛫⏳📅✅❌🆔⛔]|\s\^[A-Za-z0-9-]+\s*$/u,
	start: /[⏳📅✅❌🆔⛔🏁]|\s\^[A-Za-z0-9-]+\s*$/u,
	due: /[✅❌🆔⛔🏁]|\s\^[A-Za-z0-9-]+\s*$/u,
};

function tidy(line: string): string {
	const m = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+\[.\]\s)(.*)$/);
	if (!m) return line.replace(/\s+$/, "");
	return m[1] + m[2].replace(/[ \t]{2,}/g, " ").trim();
}

/** Set the estimate / start / due in a task line (null removes it) */
export function setLineField(line: string, field: Field, value: string | null): string {
	const re = FIELD_RE[field];
	if (re.test(line)) {
		return tidy(line.replace(re, value ? FIELD_TEXT[field](value) : ""));
	}
	if (!value) return line;
	const head = line.match(/^\s*(?:[-*+]|\d+[.)])\s+\[.\]\s/);
	const offset = head ? head[0].length : 0;
	const body = line.slice(offset);
	const pos = body.search(INSERT_BEFORE[field]);
	const ins = FIELD_TEXT[field](value);
	const nb = pos < 0 ? `${body} ${ins}` : `${body.slice(0, pos)} ${ins} ${body.slice(pos)}`;
	return tidy(line.slice(0, offset) + nb);
}

// ---------- Editing fields that Tasks added (change or remove only, never add) ----------

export type TasksField = "scheduled" | "created" | "done" | "cancelled" | "priority" | "recurrence";

const TASKS_DATE_EMOJI: Record<"scheduled" | "created" | "done" | "cancelled", string> = {
	scheduled: "⏳",
	created: "➕",
	done: "✅",
	cancelled: "❌",
};

/**
 * Change or remove a Tasks field that the line already has.
 * Returns the line unchanged when the field isn't there — Task Hours only adds
 * the estimate, start date and due date.
 */
export function replaceTasksField(line: string, field: TasksField, value: string | null): string {
	if (field === "priority") {
		const re = /[🔺⏫🔼🔽⏬]\uFE0F?/u;
		if (!re.test(line)) return line;
		const emoji = value ? PRIORITY_EMOJI[value as Priority] ?? "" : "";
		return tidy(line.replace(re, emoji));
	}
	if (field === "recurrence") {
		const re = new RegExp("🔁\\uFE0F?\\s*[^" + FIELD_START + "^]*", "u");
		if (!re.test(line)) return line;
		const trimmed = value?.trim();
		return tidy(line.replace(re, trimmed ? `🔁 ${trimmed} ` : ""));
	}
	const re = new RegExp(TASKS_DATE_EMOJI[field] + "\\uFE0F?\\s*\\d{4}-\\d{2}-\\d{2}", "u");
	if (!re.test(line)) return line;
	return tidy(line.replace(re, value ? `${TASKS_DATE_EMOJI[field]} ${value}` : ""));
}

/** Build a task line (Tasks-compatible order: ⏱️ goes before the dates) */
export function buildTaskLine(name: string, estimate: string, start: string, due: string): string {
	let s = `- [ ] ${name.trim()}`;
	if (estimate.trim()) s += ` ⏱️ ${estimate.trim()}`;
	if (start) s += ` 🛫 ${start}`;
	if (due) s += ` 📅 ${due}`;
	return s;
}
