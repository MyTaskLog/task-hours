// Shorthand: "- [ ] Lunch 2h @tomorrow !fri" → "- [ ] Lunch ⏱️ 2h 🛫 2026-10-06 📅 2026-10-09"

import { parseDatePrefix, toHalfWidth } from "./dates";
import { Field, setLineField } from "./parse";

export interface ShorthandOptions {
	startChar: string; // default "@"
	dueChar: string; // default "!"
	bareEstimate: boolean; // read a lone "2h" / "30m" as an estimate
	dayFirst: boolean; // read 10/7 as 10 July
}

export const DEFAULT_SHORTHAND: ShorthandOptions = { startChar: "@", dueChar: "!", bareEstimate: true, dayFirst: false };

// Shorthand estimates. No bare 時 so a clock time like 15時 isn't read as 15 hours
const SH_NUM = "\\d+(?:\\.\\d+)?";
const SH_H = "(?:hours?|hrs?|h|時間)";
const SH_M = "(?:minutes?|mins?|m|分)";
const SH_DUR = `(?:${SH_NUM}\\s*${SH_H}(?:\\s*${SH_NUM}\\s*${SH_M})?|${SH_NUM}\\s*${SH_M})`;
const PAREN_EST = new RegExp(`\\(\\s*(${SH_DUR})\\s*\\)`, "gi");
// Not preceded by a letter/digit, 時 or ":" (15時30分 / 10:30 / iPhone15), and followed by a space or end of line
const BARE_EST = new RegExp(`(^|[^A-Za-z0-9.:時])(${SH_DUR})(?=\\s|$)`, "gi");

const TASK_HEAD = /^(\s*(?:[-*+]|\d+[.)])\s+\[.\]\s+)(.*)$/;

function esc(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface Hit {
	from: number;
	to: number;
	field: Field;
	value: string;
}

/** Returns the line with shorthand converted to the full format, or null if there is none */
export function convertShorthand(line: string, opt: ShorthandOptions, today: Date): string | null {
	const m = line.match(TASK_HEAD);
	if (!m) return null;
	const head = m[1];
	const body = m[2];
	const norm = toHalfWidth(body); // accept full-width input (same length)
	const hits: Hit[] = [];

	// Dates: @tomorrow / !fri (ignored right after a letter/digit, e.g. a@b.com)
	const triggers: [string, Field][] = [
		[toHalfWidth(opt.startChar), "start"],
		[toHalfWidth(opt.dueChar), "due"],
	];
	for (const [ch, field] of triggers) {
		if (!ch) continue;
		const re = new RegExp(`(^|[^A-Za-z0-9._%+-])${esc(ch)}(\\S+)`, "g");
		let r: RegExpExecArray | null;
		while ((r = re.exec(norm))) {
			const wordStart = r.index + r[1].length + ch.length;
			const p = parseDatePrefix(norm.slice(wordStart, wordStart + r[2].length), today, opt.dayFirst);
			if (p) hits.push({ from: r.index + r[1].length, to: wordStart + p.length, field, value: p.date });
		}
	}

	// Estimate: (2h) always; a lone "2h" only when the task has no estimate yet
	const hasEstimate = /⏱/u.test(body);
	let est: Hit | null = null;
	let r: RegExpExecArray | null;
	PAREN_EST.lastIndex = 0;
	while ((r = PAREN_EST.exec(norm))) est = { from: r.index, to: r.index + r[0].length, field: "estimate", value: r[1].replace(/\s+/g, "") };
	if (!est && !hasEstimate && opt.bareEstimate) {
		BARE_EST.lastIndex = 0;
		while ((r = BARE_EST.exec(norm))) {
			const from = r.index + r[1].length;
			est = { from, to: from + r[2].length, field: "estimate", value: r[2].replace(/\s+/g, "") };
		}
	}
	if (est) hits.push(est);
	if (!hits.length) return null;

	// if the same field appears twice, the last one wins
	const chosen = new Map<Field, Hit>();
	for (const h of hits.sort((a, b) => a.from - b.from)) chosen.set(h.field, h);

	// remove the shorthand tokens from the text (from the end), leaving a single
	// space where each one was (also absorbing full-width spaces around it)
	let nb = body;
	for (const h of [...hits].sort((a, b) => b.from - a.from)) nb = nb.slice(0, h.from) + "\uE000" + nb.slice(h.to);
	nb = nb.replace(/[ \t\u3000]*\uE000[ \t\u3000\uE000]*/g, " ");
	let out = head + nb;
	for (const f of ["estimate", "start", "due"] as Field[]) {
		const h = chosen.get(f);
		if (h) out = setLineField(out, f, h.value);
	}
	return out === line ? null : out;
}

/** Is the line inside a fenced code block? */
export function isInFence(lines: (n: number) => string, lineNo: number): boolean {
	let inFence = false;
	for (let i = 0; i < lineNo; i++) if (/^\s*(```|~~~)/.test(lines(i))) inFence = !inFence;
	return inFence;
}
