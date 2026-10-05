// Natural date words → YYYY-MM-DD
// English: today, tomorrow, fri, next fri, oct 7, 10/7, +3, 3d, 2w, eom …
// 日本語: 今日, 明日, 金曜, 来週金曜, 10/7, 10月7日, 3日後, 月末 …

import { longDate, shortDate, t as tr, weekdayName } from "./i18n";
import { fmt } from "./parse";

/** Full-width ASCII and ideographic space → half-width (string length unchanged) */
export function toHalfWidth(s: string): string {
	return s.replace(/[\uFF01-\uFF5E\u3000]/g, (c) =>
		c === "\u3000" ? " " : String.fromCharCode(c.charCodeAt(0) - 0xfee0)
	);
}

function addDays(d: Date, n: number): Date {
	const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	r.setDate(r.getDate() + n);
	return r;
}
function mondayOf(d: Date): Date {
	return addDays(d, -((d.getDay() + 6) % 7));
}
function validYmd(y: number, m: number, d: number): Date | null {
	const r = new Date(y, m - 1, d);
	return r.getFullYear() === y && r.getMonth() === m - 1 && r.getDate() === d ? r : null;
}
function today0(today: Date): Date {
	return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}
/** Month/day with no year: this year, or next year if it has already passed */
function upcoming(t: Date, m: number, d: number): Date | null {
	let r = validYmd(t.getFullYear(), m, d);
	if (r && r < t) r = validYmd(t.getFullYear() + 1, m, d);
	return r;
}

// Monday = 0 … Sunday = 6
const WEEKDAYS: Record<string, number> = {
	月: 0, 火: 1, 水: 2, 木: 3, 金: 4, 土: 5, 日: 6,
	mon: 0, monday: 0, tue: 1, tues: 1, tuesday: 1, wed: 2, weds: 2, wednesday: 2,
	thu: 3, thur: 3, thurs: 3, thursday: 3, fri: 4, friday: 4, sat: 5, saturday: 5, sun: 6, sunday: 6,
};
const MONTHS: Record<string, number> = {
	jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
	jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
	nov: 11, november: 11, dec: 12, december: 12,
};

const FIXED: Record<string, number> = {
	today: 0, tod: 0, now: 0, 今日: 0, きょう: 0, 本日: 0,
	tomorrow: 1, tmr: 1, tmrw: 1, tomo: 1, 明日: 1, あした: 1, あす: 1,
	明後日: 2, あさって: 2,
	yesterday: -1, 昨日: -1, きのう: -1,
};

/** Read one date word. Returns null if it isn't a date. */
export function parseDateWord(input: string, today: Date, dayFirst = false): string | null {
	const t = today0(today);
	const w = toHalfWidth(input).trim().toLowerCase();
	if (!w) return null;
	let m: RegExpMatchArray | null;

	if (w in FIXED) return fmt(addDays(t, FIXED[w]));

	// 2026-10-07 / 2026/10/7
	if ((m = w.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) {
		const d = validYmd(+m[1], +m[2], +m[3]);
		return d ? fmt(d) : null;
	}
	// 10/7 (M/D, or D/M when dayFirst) / 10月7日
	if ((m = w.match(/^(\d{1,2})[/.](\d{1,2})$/))) {
		const [mo, da] = dayFirst ? [+m[2], +m[1]] : [+m[1], +m[2]];
		const d = upcoming(t, mo, da);
		return d ? fmt(d) : null;
	}
	if ((m = w.match(/^(\d{1,2})月(\d{1,2})日?$/))) {
		const d = upcoming(t, +m[1], +m[2]);
		return d ? fmt(d) : null;
	}
	// oct7 / oct-7 / october 7 / 7oct / 7-oct
	if ((m = w.match(/^([a-z]+)[\s.-]*(\d{1,2})(?:st|nd|rd|th)?$/)) && m[1] in MONTHS) {
		const d = upcoming(t, MONTHS[m[1]], +m[2]);
		return d ? fmt(d) : null;
	}
	if ((m = w.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s.-]*([a-z]+)$/)) && m[2] in MONTHS) {
		const d = upcoming(t, MONTHS[m[2]], +m[1]);
		return d ? fmt(d) : null;
	}
	// +3 / +3d / 3d / in3d / 3日後
	if ((m = w.match(/^(?:\+|in\s*)?(\d{1,3})\s*(?:d|days?)$/)) || (m = w.match(/^\+(\d{1,3})$/)) || (m = w.match(/^(\d{1,3})日後$/)))
		return fmt(addDays(t, +m[1]));
	// +2w / 2w / 2週間後
	if ((m = w.match(/^(?:\+|in\s*)?(\d{1,2})\s*(?:w|wks?|weeks?)$/)) || (m = w.match(/^(\d{1,2})週間?後$/)))
		return fmt(addDays(t, 7 * +m[1]));
	// 7日 = the 7th of this month (next month if it has passed)
	if ((m = w.match(/^(\d{1,2})日$/))) {
		let d = validYmd(t.getFullYear(), t.getMonth() + 1, +m[1]);
		if (d && d < t) {
			const nm = new Date(t.getFullYear(), t.getMonth() + 1, 1);
			d = validYmd(nm.getFullYear(), nm.getMonth() + 1, +m[1]);
		}
		return d ? fmt(d) : null;
	}
	if (w === "月末" || w === "eom") return fmt(new Date(t.getFullYear(), t.getMonth() + 1, 0));
	if (w === "来月末") return fmt(new Date(t.getFullYear(), t.getMonth() + 2, 0));
	if (w === "来月" || /^next[\s-]*month$/.test(w)) return fmt(new Date(t.getFullYear(), t.getMonth() + 1, 1));
	if (w === "来週" || /^next[\s-]*week$/.test(w)) return fmt(addDays(mondayOf(t), 7));
	if (w === "週末" || w === "今週末" || w === "weekend" || w === "eow") return fmt(addDays(mondayOf(t), 5));

	// 金 / 金曜 / 金曜日 / 来週金曜 / 今週月 / 再来週水 / fri / friday / next fri / this fri
	m = w.match(/^(今週|来週|再来週|next[\s-]*|this[\s-]*)?(月|火|水|木|金|土|日|[a-z]+?)(曜日|曜)?$/);
	if (m && m[2] in WEEKDAYS) {
		const idx = WEEKDAYS[m[2]];
		const pre = (m[1] ?? "").replace(/[\s-]/g, "");
		if (pre === "今週" || pre === "this") return fmt(addDays(mondayOf(t), idx));
		if (pre === "来週" || pre === "next") return fmt(addDays(mondayOf(t), 7 + idx));
		if (pre === "再来週") return fmt(addDays(mondayOf(t), 14 + idx));
		const cur = (t.getDay() + 6) % 7;
		return fmt(addDays(t, (idx - cur + 7) % 7)); // the next one, today included
	}
	return null;
}

/**
 * Find the longest leading part that reads as a date (「明日ご飯」→「明日」).
 * To avoid false hits it never splits inside an English word (“@monica” is not Monday)
 * or a number, and a single-kanji weekday must stand alone (the 金 in 金子 is not Friday).
 */
export function parseDatePrefix(input: string, today: Date, dayFirst = false): { date: string; length: number } | null {
	for (let len = Math.min(input.length, 16); len >= 1; len--) {
		const part = input.slice(0, len);
		const rest = input.slice(len);
		if (rest) {
			if (/^(今週|来週|再来週)?[月火水木金土日]$/.test(part)) continue;
			if (/[0-9０-９/／]$/.test(part) && /^[0-9０-９/／]/.test(rest)) continue;
			if (/[A-Za-zＡ-Ｚａ-ｚ]$/.test(part) && /^[A-Za-zＡ-Ｚａ-ｚ]/.test(rest)) continue;
		}
		const d = parseDateWord(part, today, dayFirst);
		if (d) return { date: d, length: len };
	}
	return null;
}

function ymdParts(ymd: string) {
	const [y, m, d] = ymd.split("-").map(Number);
	return { y, m, d, wd: (new Date(y, m - 1, d).getDay() + 6) % 7 };
}

/** Short label for chips: “Wed, Oct 7” / “10/7(水)” */
export function labelDate(ymd: string, today: Date = new Date()): string {
	const { y, m, d, wd } = ymdParts(ymd);
	return shortDate(y, m, d, wd, y !== today.getFullYear());
}

/** Group header label */
export function headerDate(ymd: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
	const { y, m, d, wd } = ymdParts(ymd);
	const s = longDate(y, m, d, wd);
	return ymd === fmt(new Date()) ? `${s} · ${tr("group.today")}` : s;
}

export interface DatePreset {
	label: string;
	keys: string[]; // typed prefixes that match this preset (both languages)
	date: string;
}

const WD_KEYS: string[][] = [
	["月", "monday"], ["火", "tuesday"], ["水", "wednesday"], ["木", "thursday"],
	["金", "friday"], ["土", "saturday"], ["日", "sunday"],
];

/** Suggestions shown when you type @ or ! */
export function datePresets(today: Date): DatePreset[] {
	const t = today0(today);
	const list: DatePreset[] = [
		{ label: tr("d.today"), keys: ["今日", "きょう", "today"], date: fmt(t) },
		{ label: tr("d.tomorrow"), keys: ["明日", "あした", "あす", "tomorrow", "tmr"], date: fmt(addDays(t, 1)) },
		{ label: tr("d.in2"), keys: ["明後日", "あさって", "+2", "2d"], date: fmt(addDays(t, 2)) },
	];
	for (let i = 3; i <= 7; i++) {
		const d = addDays(t, i);
		const wd = (d.getDay() + 6) % 7;
		const [jk, ek] = WD_KEYS[wd];
		list.push({ label: weekdayName(wd, true), keys: [`${jk}曜`, jk, ek], date: fmt(d) });
	}
	list.push({ label: tr("d.nextMon"), keys: ["来週", "らいしゅう", "next"], date: fmt(addDays(mondayOf(t), 7)) });
	list.push({ label: tr("d.eom"), keys: ["月末", "げつまつ", "eom", "end"], date: fmt(new Date(t.getFullYear(), t.getMonth() + 1, 0)) });
	return list;
}
