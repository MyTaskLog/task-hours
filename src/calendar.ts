// A large month calendar used everywhere a date is picked (list chips, ✏️ dialog, add-task form,
// "Pick from calendar…"). The browser's own date picker can't be resized, so we draw our own.

import { App, Modal } from "obsidian";
import { fmt } from "./parse";
import { lang, t as tr, weekdayName } from "./i18n";

const MON_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parse(ymd: string | null): Date | null {
	const m = ymd?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

/** "2026-10-21 (水)" / "2026-10-21 (Wed)" */
export function dateLabel(ymd: string): string {
	const d = parse(ymd);
	return d ? `${ymd} (${weekdayName((d.getDay() + 6) % 7)})` : ymd;
}

export class CalendarPicker {
	private month: Date; // first day of the month on screen
	private el: HTMLElement;

	constructor(
		parent: HTMLElement,
		private value: string | null,
		private onPick: (date: string) => void
	) {
		const base = parse(value) ?? new Date();
		this.month = new Date(base.getFullYear(), base.getMonth(), 1);
		this.el = parent.createDiv({ cls: "task-hours-cal" });
		this.render();
	}

	private shift(n: number) {
		this.month = new Date(this.month.getFullYear(), this.month.getMonth() + n, 1);
		this.render();
	}

	private render() {
		const el = this.el;
		el.empty();
		const y = this.month.getFullYear();
		const m = this.month.getMonth();
		const head = el.createDiv({ cls: "task-hours-cal-head" });
		const prev = head.createEl("button", { cls: "task-hours-cal-nav", text: "‹", attr: { "aria-label": tr("cal.prev") } });
		head.createDiv({ cls: "task-hours-cal-title", text: lang() === "ja" ? `${y}年 ${m + 1}月` : `${MON_EN[m]} ${y}` });
		const next = head.createEl("button", { cls: "task-hours-cal-nav", text: "›", attr: { "aria-label": tr("cal.next") } });
		prev.addEventListener("click", (e) => {
			e.preventDefault();
			this.shift(-1);
		});
		next.addEventListener("click", (e) => {
			e.preventDefault();
			this.shift(1);
		});

		const grid = el.createDiv({ cls: "task-hours-cal-grid" });
		// Sunday first, as on most calendars in Japan and the US
		for (let i = 0; i < 7; i++) {
			const wd = grid.createDiv({ cls: "task-hours-cal-wd", text: weekdayName((i + 6) % 7) });
			if (i === 0) wd.addClass("is-sun");
			if (i === 6) wd.addClass("is-sat");
		}
		const today = fmt(new Date());
		const first = new Date(y, m, 1);
		const start = new Date(y, m, 1 - first.getDay());
		for (let i = 0; i < 42; i++) {
			const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
			const ymd = fmt(d);
			const b = grid.createEl("button", { cls: "task-hours-cal-day", text: String(d.getDate()) });
			if (d.getMonth() !== m) b.addClass("is-other");
			if (d.getDay() === 0) b.addClass("is-sun");
			if (d.getDay() === 6) b.addClass("is-sat");
			if (ymd === today) b.addClass("is-today");
			if (ymd === this.value) b.addClass("is-selected");
			b.addEventListener("click", (e) => {
				e.preventDefault();
				this.value = ymd;
				this.onPick(ymd);
			});
		}
	}
}

/** A dialog with the calendar; choosing a day saves straight away */
export class DateModal extends Modal {
	constructor(
		app: App,
		private title: string,
		private subtitle: string,
		private value: string | null,
		private onSave: (date: string | null) => void
	) {
		super(app);
	}

	onOpen() {
		this.setTitle(this.title);
		this.modalEl.addClass("task-hours-modal", "task-hours-datemodal");
		const { contentEl } = this;
		if (this.subtitle) contentEl.createDiv({ cls: "task-hours-edit-name", text: this.subtitle });
		const pick = (v: string | null) => {
			this.onSave(v);
			this.close();
		};
		new CalendarPicker(contentEl, this.value, (d) => pick(d));
		const quick = contentEl.createDiv({ cls: "task-hours-cal-quick" });
		const today = new Date();
		const btn = (label: string, fn: () => void, cls = "") => {
			const b = quick.createEl("button", { text: label, cls });
			b.addEventListener("click", fn);
		};
		btn(tr("cal.today"), () => pick(fmt(today)));
		btn(tr("cal.tomorrow"), () => pick(fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))));
		if (this.value) btn(tr("cal.clear"), () => pick(null), "mod-warning");
	}

	onClose() {
		this.contentEl.empty();
	}
}

/**
 * A date field for forms: shows the chosen date as a button; clicking opens the large calendar.
 * × clears it. Calls onChange with "" when cleared.
 */
export function dateField(app: App, parent: HTMLElement, title: string, value: string, onChange: (v: string) => void) {
	const wrap = parent.createDiv({ cls: "task-hours-datefield" });
	const show = (v: string) => {
		wrap.empty();
		const b = wrap.createEl("button", { cls: "task-hours-datefield-btn" + (v ? "" : " is-empty"), text: v ? `📅 ${dateLabel(v)}` : tr("cal.choose") });
		b.addEventListener("click", (e) => {
			e.preventDefault();
			new DateModal(app, title, "", v || null, (d) => {
				onChange(d ?? "");
				show(d ?? "");
			}).open();
		});
		if (v) {
			const x = wrap.createEl("button", { cls: "task-hours-datefield-clear", text: "×", attr: { "aria-label": tr("cal.clear") } });
			x.addEventListener("click", (e) => {
				e.preventDefault();
				onChange("");
				show("");
			});
		}
	};
	show(value);
}
