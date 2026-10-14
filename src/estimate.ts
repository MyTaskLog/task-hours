// One estimate input used everywhere (⏱️ click, ✏️ dialog, add-task form):
// a number, an h / min switch, a preview of what will be saved, and quick picks.

import { App, Modal, Setting } from "obsidian";
import { toHalfWidth } from "./dates";
import { t as tr } from "./i18n";
import { formatDuration, parseDuration } from "./parse";
import { durationValue } from "./shorthand";

export type Unit = "h" | "m";

const QUICK = [15, 30, 45, 60, 90, 120, 180, 240, 480];
const MAX_MINUTES = 9999 * 60;

/**
 * Read what was typed. A plain number uses the chosen unit ("50" + min → 50 min);
 * text with its own unit is read as written ("1h30m", "90分").
 * Returns null for empty, undefined when it can't be read.
 */
export function readEstimate(text: string, unit: Unit): number | null | undefined {
	const s = toHalfWidth(text).trim().toLowerCase().replace(/\s+/g, "");
	if (!s) return null;
	let min: number | null;
	if (/^\d+(\.\d+)?$/.test(s)) min = Math.round(parseFloat(s) * (unit === "h" ? 60 : 1));
	else min = parseDuration(/(h|hrs?|hours?|時間)\d+$/.test(s) ? s + "m" : s);
	if (min === null || min <= 0 || min > MAX_MINUTES) return undefined;
	return min;
}

/** The unit a plain number most likely means, as for "+" (10 or more → minutes) */
export function guessUnit(text: string): Unit {
	const n = parseFloat(toHalfWidth(text));
	return !isNaN(n) && n >= 10 && !text.includes(".") ? "m" : "h";
}

export class EstimatePicker {
	private input: HTMLInputElement;
	private unit: Unit = "h";
	private unitTouched = false;
	private unitBtns: Record<Unit, HTMLButtonElement>;
	private preview: HTMLElement;

	constructor(
		parent: HTMLElement,
		initial: number | null,
		private opts: { onEnter?: () => void; onQuick?: (minutes: number) => void; autofocus?: boolean } = {}
	) {
		const wrap = parent.createDiv({ cls: "task-hours-estpicker" });
		const row = wrap.createDiv({ cls: "task-hours-estpicker-row" });
		this.input = row.createEl("input", { type: "text", cls: "task-hours-estpicker-input", attr: { inputmode: "decimal" } });
		this.input.placeholder = "50";
		const seg = row.createDiv({ cls: "task-hours-estpicker-units", attr: { role: "group" } });
		this.unitBtns = {
			h: seg.createEl("button", { text: tr("est.h"), cls: "task-hours-estpicker-unit" }),
			m: seg.createEl("button", { text: tr("est.min"), cls: "task-hours-estpicker-unit" }),
		};
		for (const u of ["h", "m"] as Unit[])
			this.unitBtns[u].addEventListener("click", (e) => {
				e.preventDefault();
				this.unitTouched = true;
				this.setUnit(u);
				this.input.focus();
			});
		this.preview = row.createSpan({ cls: "task-hours-estpicker-preview" });

		const quick = wrap.createDiv({ cls: "task-hours-estpicker-quick" });
		for (const q of QUICK) {
			const b = quick.createEl("button", { text: formatDuration(q), cls: "task-hours-estpicker-chip" });
			b.addEventListener("click", (e) => {
				e.preventDefault();
				this.set(q);
				this.opts.onQuick?.(q);
			});
		}

		this.set(initial);
		this.input.addEventListener("input", () => {
			if (!this.input.value.trim()) this.unitTouched = false; // cleared: guess the unit again
			if (!this.unitTouched && /^\s*[\d０-９.．]+\s*$/.test(this.input.value)) this.setUnit(guessUnit(this.input.value));
			this.update();
		});
		this.input.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.isComposing) {
				e.preventDefault();
				e.stopPropagation(); // the dialog's own Enter handler must not run a second time
				this.opts.onEnter?.();
			}
		});
		if (opts.autofocus)
			window.setTimeout(() => {
				this.input.focus();
				this.input.select();
			}, 0);
	}

	/** Show a value: whole hours as h, everything else as min */
	set(minutes: number | null) {
		if (minutes === null) {
			this.input.value = "";
			this.setUnit("h");
		} else if (minutes % 60 === 0) {
			this.input.value = String(minutes / 60);
			this.setUnit("h");
		} else {
			this.input.value = String(minutes);
			this.setUnit("m");
		}
		this.unitTouched = minutes !== null;
		this.update();
	}

	/** minutes, null when empty, undefined when it can't be read */
	get minutes(): number | null | undefined {
		return readEstimate(this.input.value, this.unit);
	}

	/** The text written after ⏱️ (e.g. "50m", "2h", "1h30m"), null when empty */
	get value(): string | null | undefined {
		const m = this.minutes;
		return m === null || m === undefined ? m : durationValue(m);
	}

	private setUnit(u: Unit) {
		this.unit = u;
		this.unitBtns.h.toggleClass("is-active", u === "h");
		this.unitBtns.m.toggleClass("is-active", u === "m");
		this.update();
	}

	private update() {
		const m = this.minutes;
		this.preview.setText(m === undefined ? tr("est.unreadable") : m === null ? "" : `= ${formatDuration(m)}`);
		this.preview.toggleClass("is-error", m === undefined);
	}
}

/** Small dialog opened by clicking ⏱️ */
export class EstimateModal extends Modal {
	private picker!: EstimatePicker;

	constructor(
		app: App,
		private name: string,
		private initial: number | null,
		private onSave: (value: string | null) => void
	) {
		super(app);
	}

	onOpen() {
		this.setTitle(tr("add.estimate"));
		this.contentEl.addClass("task-hours-estmodal");
		this.contentEl.createDiv({ cls: "task-hours-edit-name", text: this.name });
		this.picker = new EstimatePicker(this.contentEl, this.initial, {
			autofocus: true,
			onEnter: () => this.save(),
			onQuick: () => this.save(),
		});
		const s = new Setting(this.contentEl);
		if (this.initial !== null)
			s.addButton((b) =>
				b
					.setButtonText(tr("est.remove"))
					.onClick(() => {
						this.onSave(null);
						this.close();
					})
			);
		s.addButton((b) => b.setButtonText(tr("edit.cancel")).onClick(() => this.close()));
		s.addButton((b) =>
			b
				.setButtonText(tr("edit.save"))
				.setCta()
				.onClick(() => this.save())
		);
	}

	private save() {
		const v = this.picker.value;
		if (v === undefined) return; // preview already says it can't be read
		this.onSave(v);
		this.close();
	}

	onClose() {
		this.contentEl.empty();
	}
}
