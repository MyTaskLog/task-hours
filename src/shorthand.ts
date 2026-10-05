// Shorthand: "- [ ] Lunch 2h @tomorrow !fri" → "- [ ] Lunch ⏱️ 2h 🛫 2026-10-06 📅 2026-10-09"

import { parseDatePrefix, toHalfWidth } from "./dates";
import { Field, parseDuration, setLineField } from "./parse";

export interface ShorthandOptions {
	startChar: string; // default "@"
	dueChar: string; // default "!"
	estimateChar: string; // default "+"
	bareEstimate: boolean; // read a lone "2h" / "30m" as an estimate
	dayFirst: boolean; // read 10/7 as 10 July
}

export const DEFAULT_SHORTHAND: ShorthandOptions = {
	startChar: "@",
	dueChar: "!",
	estimateChar: "+",
	bareEstimate: true,
	dayFirst: false,
};

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

/** Minutes → the value written after ⏱️: 30m, 2h, 1h30m */
export function durationValue(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h && m ? `${h}h${m}m` : h ? `${h}h` : `${m}m`;
}

const EST_PRESETS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 480];

/**
 * What a "+" entry could mean, best guess first (minutes).
 * ""      → common estimates
 * "40"    → 40 min, 40 h        (10 or more: minutes first)
 * "2"     → 2 h, 2 min          (under 10: hours first)
 * "1.5"   → 1 h 30 min
 * "2h"    → 2 h, then 2 h 15 / 30 / 45
 * "1h30"  → 1 h 30 min (still typing the unit)
 * "40m" / "40分" / "2時間"
 */
export function estimateCandidates(query: string): number[] {
	let q = toHalfWidth(query).replace(/\s+/g, "").toLowerCase();
	if (!q) return EST_PRESETS;
	const out: number[] = [];
	const add = (n: number | null) => {
		if (n !== null && n > 0 && n <= 24 * 60 * 7 && !out.includes(n)) out.push(Math.round(n));
	};
	if (/^\d+(\.\d+)?$/.test(q)) {
		const n = parseFloat(q);
		const asHours = n * 60;
		if (q.includes(".") || n < 10) {
			add(asHours);
			if (Number.isInteger(n)) add(n);
		} else {
			add(n);
			if (n <= 24) add(asHours);
		}
		return out;
	}
	if (/(h|hrs?|hours?|時間)\d+$/.test(q)) q += q.includes("時間") ? "分" : "m"; // "1h30" while typing
	const minutes = parseDuration(q);
	if (minutes === null) return [];
	add(minutes);
	if (minutes % 60 === 0 && /^\d+(h|hrs?|hours?|時間)$/.test(q)) for (const x of [15, 30, 45]) add(minutes + x);
	return out;
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
	const symbols = [opt.startChar, opt.dueChar, opt.estimateChar].map(toHalfWidth).filter(Boolean).map(esc).join("");
	const lead = `(^|[^A-Za-z0-9._%+\\-${symbols}])`;
	for (const [ch, field] of triggers) {
		if (!ch) continue;
		const re = new RegExp(`${lead}${esc(ch)}(\\S+)`, "g");
		let r: RegExpExecArray | null;
		while ((r = re.exec(norm))) {
			const wordStart = r.index + r[1].length + ch.length;
			const p = parseDatePrefix(norm.slice(wordStart, wordStart + r[2].length), today, opt.dayFirst);
			if (p) hits.push({ from: r.index + r[1].length, to: wordStart + p.length, field, value: p.date });
		}
	}

	// Estimate: +40 / +2h / (2h) always; a lone "2h" only when the task has no estimate yet
	const hasEstimate = /⏱/u.test(body);
	let est: Hit | null = null;
	let r: RegExpExecArray | null;
	const ech = toHalfWidth(opt.estimateChar);
	if (ech) {
		const re = new RegExp(`${lead}${esc(ech)}([0-9.]+(?:hours?|hrs?|h|時間|minutes?|mins?|m|分)?(?:[0-9]+(?:minutes?|mins?|m|分)?)?)(?=\\s|$)`, "gi");
		while ((r = re.exec(norm))) {
			const best = estimateCandidates(r[2])[0];
			if (best) est = { from: r.index + r[1].length, to: r.index + r[0].length, field: "estimate", value: durationValue(best) };
		}
	}
	PAREN_EST.lastIndex = 0;
	if (!est) while ((r = PAREN_EST.exec(norm))) est = { from: r.index, to: r.index + r[0].length, field: "estimate", value: r[1].replace(/\s+/g, "") };
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
