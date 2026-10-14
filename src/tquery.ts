// Tasks-compatible query language for ```task-hours blocks.
// Supports the Tasks plugin's filters, boolean combinations, sort / group / limit and
// hide / show, plus Task Hours extras (has estimate, estimate above 2h, sort by estimate …).
// https://publish.obsidian.md/tasks/Queries/About+Queries

import { Priority, PRIORITY_ORDER, Task, fmt, parseDuration } from "./parse";

// ---------- dates ----------

export interface Range {
	from: string; // inclusive YYYY-MM-DD
	to: string; // inclusive
}

function ymd(y: number, m: number, d: number): Date | null {
	const r = new Date(y, m - 1, d);
	return r.getFullYear() === y && r.getMonth() === m - 1 && r.getDate() === d ? r : null;
}
function add(d: Date, days: number): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}
function mondayOf(d: Date): Date {
	return add(d, -((d.getDay() + 6) % 7));
}
const one = (d: Date): Range => ({ from: fmt(d), to: fmt(d) });
const span = (a: Date, b: Date): Range => ({ from: fmt(a), to: fmt(b) });

const WEEKDAY: Record<string, number> = {
	monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3, thursday: 4, thu: 4, thurs: 4,
	friday: 5, fri: 5, saturday: 6, sat: 6, sunday: 0, sun: 0,
};
const MONTH: Record<string, number> = {
	january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
	july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
	november: 11, nov: 11, december: 12, dec: 12,
};
const NUMBER: Record<string, number> = {
	a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
	eleven: 11, twelve: 12, fourteen: 14, thirty: 30,
};
const num = (s: string) => (/^\d+$/.test(s) ? parseInt(s) : NUMBER[s] ?? NaN);

/** A date or date range as used after "due", "start" … Returns null if it can't be read. */
export function resolveDateExpr(input: string, now: Date): Range | null {
	const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const e = input.trim().toLowerCase().replace(/\s+/g, " ");
	let m: RegExpMatchArray | null;

	// two absolute dates: 2026-10-01 2026-10-07
	if ((m = e.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{4})-(\d{2})-(\d{2})$/))) {
		const a = ymd(+m[1], +m[2], +m[3]);
		const b = ymd(+m[4], +m[5], +m[6]);
		if (a && b) return a <= b ? span(a, b) : span(b, a);
		if (a) return one(a);
		return null;
	}
	if ((m = e.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
		const d = ymd(+m[1], +m[2], +m[3]);
		return d ? one(d) : null;
	}
	if (e === "today") return one(t);
	if (e === "tomorrow") return one(add(t, 1));
	if (e === "yesterday") return one(add(t, -1));

	// last / this / next  week | month | quarter | year
	if ((m = e.match(/^(last|this|next) (week|month|quarter|year)$/))) {
		const k = m[1] === "last" ? -1 : m[1] === "next" ? 1 : 0;
		const y = t.getFullYear();
		const mo = t.getMonth();
		switch (m[2]) {
			case "week": {
				const a = add(mondayOf(t), 7 * k);
				return span(a, add(a, 6));
			}
			case "month":
				return span(new Date(y, mo + k, 1), new Date(y, mo + k + 1, 0));
			case "quarter": {
				const q = Math.floor(mo / 3) + k;
				return span(new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 0));
			}
			case "year":
				return span(new Date(y + k, 0, 1), new Date(y + k, 11, 31));
		}
	}
	// numbered ranges: 2026-W42, 2026-10, 2026-Q4, 2026
	if ((m = e.match(/^(\d{4})-w(\d{1,2})$/))) {
		const jan4 = new Date(+m[1], 0, 4);
		const a = add(mondayOf(jan4), 7 * (+m[2] - 1));
		return span(a, add(a, 6));
	}
	if ((m = e.match(/^(\d{4})-(\d{2})$/))) return span(new Date(+m[1], +m[2] - 1, 1), new Date(+m[1], +m[2], 0));
	if ((m = e.match(/^(\d{4})-q([1-4])$/))) {
		const q = +m[2] - 1;
		return span(new Date(+m[1], q * 3, 1), new Date(+m[1], q * 3 + 3, 0));
	}
	if ((m = e.match(/^(\d{4})$/))) return span(new Date(+m[1], 0, 1), new Date(+m[1], 11, 31));

	// 14 days ago / in two weeks / in 3 months
	if ((m = e.match(/^(\w+) (day|week|month|year)s? ago$/))) {
		const n = num(m[1]);
		if (!isNaN(n)) return one(shift(t, -n, m[2]));
	}
	if ((m = e.match(/^in (\w+) (day|week|month|year)s?$/))) {
		const n = num(m[1]);
		if (!isNaN(n)) return one(shift(t, n, m[2]));
	}
	// next monday / last friday / monday
	if ((m = e.match(/^(next|last|this)? ?([a-z]+)$/)) && m[2] in WEEKDAY) {
		const target = WEEKDAY[m[2]];
		const cur = t.getDay();
		if (m[1] === "next") return one(add(t, ((target - cur + 7) % 7) || 7));
		if (m[1] === "last") return one(add(t, -(((cur - target + 7) % 7) || 7)));
		if (m[1] === "this") return one(add(mondayOf(t), (target + 6) % 7));
		return one(add(t, -((cur - target + 7) % 7))); // most recent, today included
	}
	// 14 october / october 14 / oct 14 2026 / may
	if ((m = e.match(/^(\d{1,2})(?:st|nd|rd|th)? ([a-z]+)(?: (\d{4}))?$/)) && m[2] in MONTH) {
		const d = ymd(m[3] ? +m[3] : t.getFullYear(), MONTH[m[2]], +m[1]);
		return d ? one(d) : null;
	}
	if ((m = e.match(/^([a-z]+) (\d{1,2})(?:st|nd|rd|th)?(?:,? (\d{4}))?$/)) && m[1] in MONTH) {
		const d = ymd(m[3] ? +m[3] : t.getFullYear(), MONTH[m[1]], +m[2]);
		return d ? one(d) : null;
	}
	if (e in MONTH) return one(new Date(t.getFullYear(), MONTH[e] - 1, 1));
	return null;
}

function shift(d: Date, n: number, unit: string): Date {
	if (unit === "day") return add(d, n);
	if (unit === "week") return add(d, 7 * n);
	if (unit === "month") return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
	return new Date(d.getFullYear() + n, d.getMonth(), d.getDate());
}

// ---------- tasks helpers ----------

type DateField = "due" | "start" | "scheduled" | "created" | "done" | "cancelled" | "happens";

function datesOf(t: Task, f: DateField): string[] {
	const pick = (v: string | null) => (v ? [v] : []);
	switch (f) {
		case "due":
			return pick(t.due);
		case "start":
			return pick(t.startDate);
		case "scheduled":
			return pick(t.scheduled);
		case "created":
			return pick(t.created);
		case "done":
			return pick(t.doneDate);
		case "cancelled":
			return pick(t.cancelled);
		case "happens":
			return [t.startDate, t.scheduled, t.due].filter((x): x is string => !!x);
	}
}

export function folderOf(path: string): string {
	const i = path.lastIndexOf("/");
	return i < 0 ? "/" : path.slice(0, i + 1);
}
function rootOf(path: string): string {
	const i = path.indexOf("/");
	return i < 0 ? "/" : path.slice(0, i + 1);
}
export function filenameOf(path: string): string {
	return path.slice(path.lastIndexOf("/") + 1);
}
const statusName = (t: Task) =>
	({ TODO: "Todo", IN_PROGRESS: "In Progress", DONE: "Done", CANCELLED: "Cancelled" })[t.statusType];

/** Tasks' urgency score (see the Tasks documentation on Urgency) */
export function urgency(t: Task, now: Date): number {
	const today = fmt(now);
	const days = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
	let u = 0;
	if (t.due) {
		const overdue = days(today, t.due); // > 0 when overdue
		if (overdue >= 7) u += 12;
		else if (overdue >= -14) u += 12 * (((overdue + 14) * 0.8) / 21 + 0.2);
		else u += 12 * 0.2;
	}
	u += { highest: 9, high: 6, medium: 3.9, none: 1.95, low: 0, lowest: -1.8 }[t.priority];
	if (t.scheduled && t.scheduled <= today) u += 5;
	if (t.startDate && t.startDate > today) u -= 3;
	return Math.round(u * 100) / 100;
}

// ---------- filters ----------

export interface Ctx {
	now: Date;
	all: Task[]; // every task in scope (for "is blocked" / "is blocking")
}
type Pred = (t: Task, c: Ctx) => boolean;

function textTest(op: string, arg: string): ((s: string) => boolean) | string {
	if (op === "includes" || op === "include") return (s) => s.toLowerCase().includes(arg.toLowerCase());
	if (op === "does not include" || op === "do not include") return (s) => !s.toLowerCase().includes(arg.toLowerCase());
	const neg = op === "regex does not match";
	if (op === "regex matches" || neg) {
		const m = arg.match(/^\/(.*)\/([a-z]*)$/s);
		if (!m) return `Regex must look like /pattern/: ${arg}`;
		let re: RegExp;
		try {
			re = new RegExp(m[1], m[2].replace(/g/g, ""));
		} catch {
			return `Invalid regex: ${arg}`;
		}
		return (s) => re.test(s) !== neg;
	}
	return `Unknown operator: ${op}`;
}

const TEXT_OPS = "(includes|does not include|regex matches|regex does not match)";

/** One filter line (no boolean operators) → predicate, or an error message */
export function parseFilter(line: string): Pred | string {
	const l = line.trim();
	const low = l.toLowerCase();
	let m: RegExpMatchArray | null;

	if (low === "done") return (t) => t.done;
	if (low === "not done") return (t) => !t.done;
	if ((m = low.match(/^status\.type (is|is not) (todo|done|in_progress|cancelled|on_hold|non_task)$/))) {
		const want = m[2].toUpperCase();
		const neg = m[1] === "is not";
		return (t) => (t.statusType === want) !== neg;
	}
	if ((m = l.match(new RegExp(`^status\\.name ${TEXT_OPS} (.+)$`, "i")))) {
		const f = textTest(m[1].toLowerCase(), m[2]);
		return typeof f === "string" ? f : (t) => f(statusName(t));
	}

	// dates
	if ((m = low.match(/^(has|no) (due|start|scheduled|created|done|cancelled|happens) date$/))) {
		const has = m[1] === "has";
		const f = m[2] as DateField;
		return (t) => (datesOf(t, f).length > 0) === has;
	}
	if ((m = low.match(/^(due|start|scheduled|created|done|cancelled|happens) date is invalid$/))) return () => false;
	// Comparisons use Tasks' keywords: due, starts, scheduled, created, done, cancelled, happens
	if ((m = l.match(/^(due|starts|scheduled|created|done|cancelled|happens)\s+(.*)$/i))) {
		const kw = m[1].toLowerCase();
		const f = (kw === "starts" ? "start" : kw) as DateField;
		let rest = m[2].trim();
		let op = "on";
		const opm = rest.match(/^(on or before|on or after|in or before|in or after|before|after|on|in)\s+(.*)$/i);
		if (opm) {
			op = opm[1].toLowerCase();
			rest = opm[2];
		}
		const range = resolveDateExpr(rest, new Date());
		if (!range) return `Can't read this date: ${rest}`;
		// resolve "today" etc. at match time so long-open notes stay correct
		return (t, c) => {
			const r = resolveDateExpr(rest, c.now) ?? range;
			// Like Tasks: "starts …" also matches tasks that have no start date
			if (f === "start" && !t.startDate) return true;
			return datesOf(t, f).some((d) => {
				switch (op) {
					case "before":
						return d < r.from;
					case "after":
						return d > r.to;
					case "on or before":
					case "in or before":
						return d <= r.to;
					case "on or after":
					case "in or after":
						return d >= r.from;
					default:
						return d >= r.from && d <= r.to;
				}
			});
		};
	}

	// priority
	if ((m = low.match(/^priority is (?:(above|below|not) )?(highest|high|medium|none|low|lowest)$/))) {
		const target = PRIORITY_ORDER.indexOf(m[2] as Priority);
		const op = m[1];
		return (t) => {
			const p = PRIORITY_ORDER.indexOf(t.priority);
			if (op === "above") return p < target;
			if (op === "below") return p > target;
			if (op === "not") return p !== target;
			return p === target;
		};
	}

	// recurrence
	if (low === "is recurring") return (t) => !!t.recurrence;
	if (low === "is not recurring") return (t) => !t.recurrence;
	if ((m = l.match(new RegExp(`^recurrence ${TEXT_OPS} (.+)$`, "i")))) {
		const f = textTest(m[1].toLowerCase(), m[2]);
		return typeof f === "string" ? f : (t) => f(t.recurrence ?? "");
	}

	// dependencies
	if (low === "has id") return (t) => !!t.id;
	if (low === "no id") return (t) => !t.id;
	if (low === "has depends on") return (t) => t.dependsOn.length > 0;
	if (low === "no depends on") return (t) => t.dependsOn.length === 0;
	if ((m = l.match(new RegExp(`^id ${TEXT_OPS} (.+)$`, "i")))) {
		const f = textTest(m[1].toLowerCase(), m[2]);
		return typeof f === "string" ? f : (t) => f(t.id ?? "");
	}
	if ((m = low.match(/^is (not )?blocked$/))) {
		const neg = !!m[1];
		return (t, c) => {
			const blocked = !t.done && t.dependsOn.some((id) => c.all.some((o) => o.id === id && !o.done));
			return blocked !== neg;
		};
	}
	if ((m = low.match(/^is (not )?blocking$/))) {
		const neg = !!m[1];
		return (t, c) => {
			const blocking = !t.done && !!t.id && c.all.some((o) => !o.done && o.dependsOn.includes(t.id!));
			return blocking !== neg;
		};
	}

	// tags
	if (low === "has tags") return (t) => t.tags.length > 0;
	if (low === "no tags") return (t) => t.tags.length === 0;
	if ((m = l.match(/^tags? (include|includes|do not include|does not include|regex matches|regex does not match) (.+)$/i))) {
		const op = m[1].toLowerCase();
		const arg = op.startsWith("regex") ? m[2] : m[2].replace(/^#/, "");
		const f = textTest(op, arg);
		if (typeof f === "string") return f;
		const negative = op.includes("not");
		// "does not include": no tag contains it; others: some tag matches
		return negative
			? (t) => t.tags.every((tag) => f(tag.replace(/^#/, op.startsWith("regex") ? "#" : "")))
			: (t) => t.tags.some((tag) => f(op.startsWith("regex") ? tag : tag.replace(/^#/, "")));
	}

	// text properties
	if ((m = l.match(new RegExp(`^(description|path|folder|filename|heading|root) ${TEXT_OPS} (.+)$`, "i")))) {
		const field = m[1].toLowerCase();
		const f = textTest(m[2].toLowerCase(), m[3]);
		if (typeof f === "string") return f;
		const get = (t: Task): string => {
			switch (field) {
				case "description":
					return t.name;
				case "path":
					return t.path;
				case "folder":
					return folderOf(t.path);
				case "filename":
					return filenameOf(t.path);
				case "root":
					return rootOf(t.path);
				default:
					return t.heading ?? "";
			}
		};
		return (t) => f(get(t));
	}
	if (low === "exclude sub-items") return (t) => !/^\s+/.test(t.raw);

	// Task Hours: estimates
	if (low === "has estimate") return (t) => t.minutes !== null;
	if (low === "no estimate") return (t) => t.minutes === null;
	if ((m = low.match(/^estimate (?:is )?(above|below|is|not|over|under)?\s*(.+)$/))) {
		const min = parseDuration(m[2].replace(/\s+/g, ""));
		if (min === null) return `Can't read this estimate: ${m[2]}`;
		const op = m[1] ?? "is";
		return (t) => {
			if (t.minutes === null) return false;
			if (op === "above" || op === "over") return t.minutes > min;
			if (op === "below" || op === "under") return t.minutes < min;
			if (op === "not") return t.minutes !== min;
			return t.minutes === min;
		};
	}

	if (/^filter by function\b/i.test(l)) return "Not supported in Task Hours: filter by function";
	return `Problem line: "${l}"`;
}

// ---------- boolean combinations: (a) AND (b) OR NOT (c) ----------

interface Tok {
	k: "(" | ")" | "op" | "text";
	v: string;
}

function tokenize(s: string): Tok[] | string {
	const out: Tok[] = [];
	let i = 0;
	while (i < s.length) {
		const ch = s[i];
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		if (ch === "(") {
			// a filter in parentheses: find its matching ")" — the filter text itself may contain ( )
			let depth = 0;
			let j = i;
			for (; j < s.length; j++) {
				if (s[j] === "(") depth++;
				else if (s[j] === ")" && --depth === 0) break;
			}
			if (j >= s.length) return "Missing closing parenthesis";
			const inner = s.slice(i + 1, j).trim();
			if (/^\(|\)\s*(AND|OR|XOR)\b|^NOT\b/.test(inner) || /\)\s+(AND|OR|XOR|AND NOT|OR NOT)\s+\(/.test(inner)) {
				out.push({ k: "(", v: "(" }, ...(tokenize(inner) as Tok[]), { k: ")", v: ")" });
			} else out.push({ k: "text", v: inner });
			i = j + 1;
			continue;
		}
		const op = s.slice(i).match(/^(AND|OR|XOR|NOT)\b/);
		if (op) {
			out.push({ k: "op", v: op[1] });
			i += op[1].length;
			continue;
		}
		return `In boolean combinations, put each filter in parentheses: ${s}`;
	}
	return out;
}

function parseBoolean(line: string): Pred | string {
	const toks = tokenize(line);
	if (typeof toks === "string") return toks;
	let pos = 0;
	let err: string | null = null;
	const peek = () => toks[pos];
	const isOp = (v: string) => peek()?.k === "op" && peek().v === v;
	const primary = (): Pred => {
		const t = toks[pos++];
		if (!t) {
			err = "Incomplete boolean combination";
			return () => false;
		}
		if (t.k === "op" && t.v === "NOT") {
			const p = primary();
			return (x, c) => !p(x, c);
		}
		if (t.k === "(") {
			const p = orExpr();
			if (toks[pos]?.k !== ")") err = "Missing closing parenthesis";
			pos++;
			return p;
		}
		if (t.k === "text") {
			const p = parseFilter(t.v);
			if (typeof p === "string") {
				err = p;
				return () => false;
			}
			return p;
		}
		err = `Unexpected "${t.v}"`;
		return () => false;
	};
	const andExpr = (): Pred => {
		let l = primary();
		while (isOp("AND")) {
			pos++;
			const r = primary();
			const a = l;
			l = (x, c) => a(x, c) && r(x, c);
		}
		return l;
	};
	const xorExpr = (): Pred => {
		let l = andExpr();
		while (isOp("XOR")) {
			pos++;
			const r = andExpr();
			const a = l;
			l = (x, c) => a(x, c) !== r(x, c);
		}
		return l;
	};
	const orExpr = (): Pred => {
		let l = xorExpr();
		while (isOp("OR")) {
			pos++;
			const r = xorExpr();
			const a = l;
			l = (x, c) => a(x, c) || r(x, c);
		}
		return l;
	};
	const p = orExpr();
	if (pos < toks.length && !err) err = `Unexpected "${toks[pos].v}"`;
	return err ?? p;
}

// ---------- the whole query ----------

export type SortKey =
	| "status" | "status.name" | "status.type" | "done" | "due" | "scheduled" | "start" | "created" | "cancelled"
	| "happens" | "description" | "priority" | "urgency" | "recurring" | "tag" | "path" | "filename" | "heading"
	| "random" | "id" | "estimate";
export type GroupKey =
	| "status" | "status.name" | "status.type" | "due" | "done" | "scheduled" | "start" | "created" | "cancelled"
	| "happens" | "priority" | "urgency" | "recurring" | "recurrence" | "tags" | "path" | "root" | "folder"
	| "filename" | "backlink" | "heading" | "id" | "estimate";

const SORT_KEYS: SortKey[] = [
	"status.name", "status.type", "status", "done", "due", "scheduled", "start", "created", "cancelled", "happens",
	"description", "priority", "urgency", "recurring", "tag", "path", "filename", "heading", "random", "id", "estimate",
];
const GROUP_KEYS: GroupKey[] = [
	"status.name", "status.type", "status", "due", "done", "scheduled", "start", "created", "cancelled", "happens",
	"priority", "urgency", "recurring", "recurrence", "tags", "path", "root", "folder", "filename", "backlink",
	"heading", "id", "estimate",
];

export interface TQuery {
	filters: { text: string; pred: Pred }[];
	sorts: { key: SortKey; reverse: boolean; tagIndex: number }[];
	groups: { key: GroupKey; reverse: boolean }[];
	limit?: number;
	groupLimit?: number;
	hide: Set<string>;
	show: Set<string>;
	explain: boolean;
	errors: string[];
}

export interface QueryFileInfo {
	path: string; // path of the note containing the query
}

/** Replace {{query.file.*}} placeholders */
function placeholders(source: string, file: QueryFileInfo): string {
	const path = file.path;
	const filename = filenameOf(path);
	const vals: Record<string, string> = {
		"query.file.path": path,
		"query.file.pathWithoutExtension": path.replace(/\.md$/, ""),
		"query.file.root": rootOf(path),
		"query.file.folder": folderOf(path),
		"query.file.filename": filename,
		"query.file.filenameWithoutExtension": filename.replace(/\.md$/, ""),
	};
	return source.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (all, k: string) => vals[k] ?? all);
}

export function parseTQuery(source: string, file: QueryFileInfo): TQuery {
	const q: TQuery = { filters: [], sorts: [], groups: [], hide: new Set(), show: new Set(), explain: false, errors: [] };
	const text = placeholders(source, file).replace(/\\\n/g, " "); // "\" continues a line
	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		const low = line.toLowerCase().replace(/\s+/g, " ");
		let m: RegExpMatchArray | null;

		if ((m = low.match(/^sort by (.+?)( reverse)?$/))) {
			let key = m[1];
			let tagIndex = 1;
			const tm = key.match(/^tag (\d+)$/);
			if (tm) {
				key = "tag";
				tagIndex = +tm[1];
			}
			if (key.startsWith("function")) q.errors.push("Not supported in Task Hours: sort by function");
			else if ((SORT_KEYS as string[]).includes(key)) q.sorts.push({ key: key as SortKey, reverse: !!m[2], tagIndex });
			else q.errors.push(`Problem line: "${line}"`);
			continue;
		}
		if ((m = low.match(/^group by (.+?)( reverse)?$/))) {
			const key = m[1];
			if (key.startsWith("function")) q.errors.push("Not supported in Task Hours: group by function");
			else if ((GROUP_KEYS as string[]).includes(key)) q.groups.push({ key: key as GroupKey, reverse: !!m[2] });
			else q.errors.push(`Problem line: "${line}"`);
			continue;
		}
		if ((m = low.match(/^limit groups (?:to )?(\d+)(?: tasks?)?$/))) {
			q.groupLimit = +m[1];
			continue;
		}
		if ((m = low.match(/^limit (?:to )?(\d+)(?: tasks?)?$/))) {
			q.limit = +m[1];
			continue;
		}
		if ((m = low.match(/^(hide|show) (.+)$/))) {
			(m[1] === "hide" ? q.hide : q.show).add(m[2]);
			(m[1] === "hide" ? q.show : q.hide).delete(m[2]);
			continue;
		}
		if (low === "short mode" || low === "full mode" || low === "ignore global query") continue;
		if (low === "explain") {
			q.explain = true;
			continue;
		}
		const pred = /^\(|^NOT \(/.test(line) ? parseBoolean(line) : parseFilter(line);
		if (typeof pred === "string") q.errors.push(pred.startsWith("Problem line") ? pred : `${pred}\nProblem line: "${line}"`);
		else q.filters.push({ text: line, pred });
	}
	return q;
}

// ---------- running it ----------

export interface TGroup {
	headings: string[]; // one per "group by" level
	links: (string | null)[]; // per level: note path when the heading is a link (filename, backlink, path)
	tasks: Task[];
}

const NO = "\uFFFF"; // sorts "no date" last
const SORT_SEP = "\u0002"; // "<sort key>\u0002<label>": sort by the key, show the label

function sortValue(t: Task, key: SortKey, tagIndex: number, now: Date): string | number {
	switch (key) {
		case "status":
		case "status.type":
			return t.done ? 1 : 0;
		case "status.name":
			return statusName(t);
		case "done":
			return t.doneDate ?? NO;
		case "due":
			return t.due ?? NO;
		case "scheduled":
			return t.scheduled ?? NO;
		case "start":
			return t.startDate ?? NO;
		case "created":
			return t.created ?? NO;
		case "cancelled":
			return t.cancelled ?? NO;
		case "happens":
			return datesOf(t, "happens").sort()[0] ?? NO;
		case "description":
			return t.name.replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
		case "priority":
			return PRIORITY_ORDER.indexOf(t.priority);
		case "urgency":
			return -urgency(t, now);
		case "recurring":
			return t.recurrence ? 0 : 1;
		case "tag":
			return t.tags[tagIndex - 1]?.toLowerCase() ?? NO;
		case "path":
			return t.path.toLowerCase();
		case "filename":
			return filenameOf(t.path).toLowerCase();
		case "heading":
			return (t.heading ?? NO).toLowerCase();
		case "random":
			return hash(t.path + t.line + t.name);
		case "id":
			return t.id ?? NO;
		case "estimate":
			return t.minutes === null ? Number.MAX_SAFE_INTEGER : -t.minutes; // biggest first
	}
}

function hash(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
	return h;
}

function cmp(a: string | number, b: string | number): number {
	return a < b ? -1 : a > b ? 1 : 0;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function dateHeading(d: string | null | undefined, field: string): string {
	if (!d) return `${NO}No ${field} date`;
	const [y, m, day] = d.split("-").map(Number);
	return `${d} ${DAY_NAMES[new Date(y, m - 1, day).getDay()]}`;
}

/** Group headings for one task at one level (a task can appear in several, e.g. tags) */
function groupValues(t: Task, key: GroupKey, now: Date, formatMinutes: (m: number) => string): string[] {
	switch (key) {
		case "status":
			return [t.done ? "Done" : "Todo"];
		case "status.name":
			return [statusName(t)];
		case "status.type":
			return [t.statusType];
		case "due":
		case "scheduled":
		case "created":
		case "cancelled":
			return [dateHeading(key === "due" ? t.due : key === "scheduled" ? t.scheduled : key === "created" ? t.created : t.cancelled, key)];
		case "start":
			return [dateHeading(t.startDate, "start")];
		case "done":
			return [dateHeading(t.doneDate, "done")];
		case "happens":
			return [dateHeading(datesOf(t, "happens").sort()[0], "happens")];
		case "priority": {
			// Tasks' wording ("High priority"), ordered highest first via a hidden sort prefix
			const i = PRIORITY_ORDER.indexOf(t.priority);
			const label = t.priority === "none" ? "Normal" : t.priority[0].toUpperCase() + t.priority.slice(1);
			return [`${i}${SORT_SEP}${label} priority`];
		}
		case "urgency":
			return [`${urgency(t, now).toFixed(2)}`];
		case "recurring":
			return [t.recurrence ? "Recurring" : "Not Recurring"];
		case "recurrence":
			return [t.recurrence ?? `${NO}None`];
		case "tags":
			return t.tags.length ? t.tags : [`${NO}(No tags)`];
		case "path":
			return [t.path.replace(/\.md$/, "")];
		case "root":
			return [rootOf(t.path)];
		case "folder":
			return [folderOf(t.path)];
		case "filename":
			return [filenameOf(t.path).replace(/\.md$/, "")];
		case "backlink":
			return [filenameOf(t.path).replace(/\.md$/, "") + (t.heading ? ` > ${t.heading}` : "")];
		case "heading":
			return [t.heading ?? `${NO}(No heading)`];
		case "id":
			return [t.id ?? `${NO}(No id)`];
		case "estimate":
			return [t.minutes === null ? `${NO}No estimate` : formatMinutes(t.minutes)];
	}
}

export interface TResult {
	tasks: Task[]; // all matches (before limit) — totals use these
	groups: TGroup[]; // what to show (after limits)
	shown: number;
}

export function runTQuery(q: TQuery, all: Task[], now: Date, formatMinutes: (m: number) => string): TResult {
	const ctx: Ctx = { now, all };
	let tasks = all.filter((t) => q.filters.every((f) => f.pred(t, ctx)));

	// Tasks' default order: status, due date, path — after any explicit sorts
	const sorts = [...q.sorts, { key: "status" as SortKey, reverse: false, tagIndex: 1 }, { key: "due" as SortKey, reverse: false, tagIndex: 1 }, { key: "path" as SortKey, reverse: false, tagIndex: 1 }];
	tasks = [...tasks].sort((a, b) => {
		for (const s of sorts) {
			const r = cmp(sortValue(a, s.key, s.tagIndex, now), sortValue(b, s.key, s.tagIndex, now));
			if (r) return s.reverse ? -r : r;
		}
		return a.line - b.line;
	});
	const limited = q.limit !== undefined ? tasks.slice(0, q.limit) : tasks;

	if (!q.groups.length) return { tasks, groups: [{ headings: [], links: [], tasks: limited }], shown: limited.length };

	const map = new Map<string, TGroup>();
	for (const t of limited) {
		let paths: string[][] = [[]];
		for (const g of q.groups) {
			const vals = groupValues(t, g.key, now, formatMinutes);
			paths = paths.flatMap((p) => vals.map((v) => [...p, v]));
		}
		for (const p of paths) {
			const k = p.join("\u0001");
			if (!map.has(k))
				map.set(k, {
					headings: p,
					links: q.groups.map((g) => (["filename", "backlink", "path"].includes(g.key) ? t.path : null)),
					tasks: [],
				});
			map.get(k)!.tasks.push(t);
		}
	}
	const groups = [...map.values()].sort((a, b) => {
		for (let i = 0; i < q.groups.length; i++) {
			const r = cmp(a.headings[i], b.headings[i]);
			if (r) return q.groups[i].reverse ? -r : r;
		}
		return 0;
	});
	for (const g of groups) {
		g.headings = g.headings.map((h) => h.replace(NO, "").replace(new RegExp(`^.*${SORT_SEP}`), ""));
		if (q.groupLimit !== undefined) g.tasks = g.tasks.slice(0, q.groupLimit);
	}
	return { tasks, groups, shown: groups.reduce((n, g) => n + g.tasks.length, 0) };
}

/** Old Task Hours syntax ("start: this week") — kept working alongside the Tasks syntax */
export function isLegacyQuery(source: string): boolean {
	const lines = source.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
	// An empty block is a Tasks query too (all tasks in the vault), as in a tasks block
	if (!lines.length) return false;
	return lines.every((l) => /^(scope|範囲|folder|フォルダ|status|状態|start|開始|due|納期|group|グループ|sort|並び順|show|表示|limit)\s*:/i.test(l));
}
