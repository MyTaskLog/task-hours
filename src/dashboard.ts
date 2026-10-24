// Sidebar dashboard: pick a folder, see estimate totals by start date

import { AbstractInputSuggest, App, ItemView, TFolder, WorkspaceLeaf, debounce } from "obsidian";
import type TaskHoursPlugin from "./main";
import { t as tr } from "./i18n";
import { Task, fmt, formatDuration, onPlainUnitChange, parseTasks, totalMinutes } from "./parse";
import { GroupBy, collectTasks, renderTaskList } from "./ui";

export const DASHBOARD_VIEW = "task-hours-dashboard";
const rootLabel = () => tr("dash.root");

type Period = "carry" | "today" | "tomorrow" | "week" | "nostart";

const PERIOD_IDS: Period[] = ["carry", "today", "tomorrow", "week", "nostart"];
export const RANGE_DAYS = [7, 14, 30] as const;
export type RangeDays = (typeof RANGE_DAYS)[number];
const periods = (n: number) =>
	PERIOD_IDS.map((id) => ({ id, label: tr(`dash.${id}`, { n }), hint: tr(`dash.${id}Hint`, { n }) }));

function addDays(ymd: string, n: number): string {
	const [y, m, d] = ymd.split("-").map(Number);
	return fmt(new Date(y, m - 1, d + n));
}

function inPeriod(t: Task, p: Period, today: string, days: number): boolean {
	const s = t.start;
	switch (p) {
		case "carry":
			return !!s && s < today;
		case "today":
			return s === today;
		case "tomorrow":
			return s === addDays(today, 1);
		case "week":
			return !!s && s >= today && s <= addDays(today, days - 1);
		case "nostart":
			return !s;
	}
}

class FolderSuggest extends AbstractInputSuggest<string> {
	constructor(
		app: App,
		inputEl: HTMLInputElement,
		private withRoot: boolean,
		private taken: () => string[]
	) {
		super(app, inputEl);
	}
	getSuggestions(query: string): string[] {
		const q = query.toLowerCase().replace(/^\/+/, "");
		const taken = new Set(this.taken());
		const folders = this.app.vault
			.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder && !f.isRoot() && !taken.has(f.path))
			.map((f) => f.path)
			.sort((a, b) => a.localeCompare(b));
		const hits = folders.filter((p) => p.toLowerCase().includes(q));
		const root = this.withRoot && !taken.has("") && (!q || rootLabel().toLowerCase().includes(q));
		return root ? [rootLabel(), ...hits] : hits;
	}
	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}
}

const under = (path: string, folder: string) => folder === "" || path.startsWith(folder + "/");

export class DashboardView extends ItemView {
	private period: Period = "today";
	private bodyEl!: HTMLElement;
	private barEl!: HTMLElement;
	private showExclude = false;
	private refresh = debounce(() => this.renderBody(), 400, true);

	constructor(leaf: WorkspaceLeaf, private plugin: TaskHoursPlugin) {
		super(leaf);
	}
	getViewType() {
		return DASHBOARD_VIEW;
	}
	getDisplayText() {
		return tr("dash.title");
	}
	getIcon() {
		return "timer";
	}

	async onOpen() {
		const root = this.contentEl;
		root.empty();
		root.addClass("task-hours-dashboard");

		this.barEl = root.createDiv({ cls: "task-hours-folders" });
		this.renderBar();

		this.bodyEl = root.createDiv();
		this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()));
		this.registerEvent(this.app.vault.on("delete", () => this.refresh()));
		this.registerEvent(this.app.vault.on("rename", () => this.refresh()));
		this.register(onPlainUnitChange(() => this.refresh()));
		this.registerInterval(window.setInterval(() => this.refresh(), 10 * 60 * 1000));
		await this.renderBody();
	}

	/** Folders to total (📁) and folders to leave out (🚫), each as removable chips with an input to add more */
	private renderBar() {
		const el = this.barEl;
		el.empty();
		const st = this.plugin.settings;
		this.renderFolderRow(el, "📁", st.dashboardFolders, true, tr(st.dashboardFolders.length ? "dash.addFolder" : "dash.pick"));
		if (st.dashboardFolders.length) {
			if (st.dashboardExclude.length || this.showExclude) this.renderFolderRow(el, "🚫", st.dashboardExclude, false, tr("dash.addExclude"));
			else {
				const b = el.createEl("button", { cls: "task-hours-exclude-btn", text: tr("dash.exclude") });
				b.addEventListener("click", () => {
					this.showExclude = true;
					this.renderBar();
					el.querySelector<HTMLInputElement>(".is-exclude input")?.focus();
				});
			}
		}
	}

	private renderFolderRow(parent: HTMLElement, icon: string, list: string[], include: boolean, placeholder: string) {
		const row = parent.createDiv({ cls: "task-hours-folder" + (include ? "" : " is-exclude") });
		row.createSpan({ text: icon, cls: "task-hours-folder-icon", attr: { "aria-label": tr(include ? "dash.included" : "dash.excluded") } });
		const chips = row.createDiv({ cls: "task-hours-chips" });
		for (const f of list) {
			const missing = f !== "" && !(this.app.vault.getAbstractFileByPath(f) instanceof TFolder);
			const chip = chips.createSpan({ cls: "task-hours-fchip" + (missing ? " is-missing" : ""), text: f === "" ? rootLabel() : f });
			if (missing) chip.setAttr("aria-label", tr("dash.notFound", { folder: f }));
			const x = chip.createSpan({ cls: "task-hours-fchip-x", text: "×", attr: { "aria-label": tr("dash.remove"), role: "button" } });
			x.addEventListener("click", () => void this.updateList(include, list.filter((v) => v !== f)));
		}
		const input = chips.createEl("input", { type: "text", cls: "task-hours-folder-input" });
		input.placeholder = placeholder;
		const add = (v: string) => {
			const value = v === rootLabel() || v === "/" ? "" : v.replace(/^\/+|\/+$/g, "");
			if (value !== "" && !(this.app.vault.getAbstractFileByPath(value) instanceof TFolder)) return;
			if (!include && value === "") return;
			if (list.includes(value)) return;
			void this.updateList(include, [...list, value]);
		};
		const sug = new FolderSuggest(this.app, input, include, () => list);
		sug.onSelect((v, _e) => {
			sug.close();
			add(v);
		});
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.isComposing && input.value.trim()) add(input.value.trim());
		});
	}

	private async updateList(include: boolean, list: string[]) {
		const st = this.plugin.settings;
		if (include) st.dashboardFolders = list;
		else st.dashboardExclude = list;
		if (!st.dashboardExclude.length) this.showExclude = false;
		await this.plugin.saveSettings();
		this.renderBar();
		await this.renderBody();
	}

	/** Markdown files in the chosen folders, minus the left-out ones */
	private targetFiles() {
		const st = this.plugin.settings;
		const inc = st.dashboardFolders.filter((f) => f === "" || this.app.vault.getAbstractFileByPath(f) instanceof TFolder);
		return this.app.vault
			.getMarkdownFiles()
			.filter((f) => inc.some((d) => under(f.path, d)) && !st.dashboardExclude.some((d) => under(f.path, d)));
	}

	async renderBody() {
		const el = this.bodyEl;
		if (!el) return;
		const folders = this.plugin.settings.dashboardFolders;
		el.empty();
		if (!folders.length) {
			el.createDiv({ cls: "task-hours-empty task-hours-wait", text: tr("dash.wait") });
			return;
		}
		for (const folder of folders)
			if (folder !== "" && !(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder))
				el.createDiv({ cls: "task-hours-error", text: tr("dash.notFound", { folder }) });

		const today = fmt(new Date());
		const days = this.plugin.settings.dashboardDays;
		const open = (await collectTasks(this.app, this.targetFiles(), parseTasks)).filter((t) => !t.done);
		const tiles = el.createDiv({ cls: "task-hours-tiles" });
		for (const p of periods(days)) {
			const ts = open.filter((t) => inPeriod(t, p.id, today, days));
			const tile = tiles.createDiv({ cls: "task-hours-tile", attr: { "aria-label": p.hint, tabindex: "0" } });
			if (p.id === this.period) tile.addClass("is-active");
			if (p.id === "carry" && ts.length) tile.addClass("is-alert");
			tile.createDiv({ cls: "task-hours-tile-label", text: p.label });
			tile.createDiv({ cls: "task-hours-tile-total", text: formatDuration(totalMinutes(ts)) });
			tile.createDiv({ cls: "task-hours-tile-count", text: tr("sum.count", { n: ts.length }) });
			const select = () => {
				this.period = p.id;
				void this.renderBody();
			};
			tile.addEventListener("click", select);
			tile.addEventListener("keydown", (e) => e.key === "Enter" && select());
		}

		const list = open
			.filter((t) => inPeriod(t, this.period, today, days))
			.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? "") || (a.due ?? "9").localeCompare(b.due ?? "9"));
		const info = periods(days).find((p) => p.id === this.period)!;
		if (this.period === "week") this.renderRangeSwitch(el, days);
		const head = el.createDiv({ cls: "task-hours-summary" });
		head.createSpan({ cls: "task-hours-total", text: `${info.label} ⏱️ ${formatDuration(totalMinutes(list))}` });
		const noEst = list.filter((t) => t.minutes === null).length;
		if (noEst) head.createSpan({ cls: "task-hours-warn", text: tr("sum.noEstimate", { n: noEst }) });

		if (!list.length) {
			el.createDiv({ cls: "task-hours-empty", text: tr("sum.empty") });
			return;
		}
		const group: GroupBy = this.period === "week" || this.period === "carry" ? "start" : "none";
		renderTaskList(this.app, el, list, { group, showFile: true });
		el.createDiv({ cls: "task-hours-tip", text: tr("dash.tip") });
	}

	/** 7 / 14 / 30 days, shown above the list when the range tile is selected */
	private renderRangeSwitch(parent: HTMLElement, current: number) {
		const bar = parent.createDiv({ cls: "task-hours-range", attr: { role: "group", "aria-label": tr("dash.range") } });
		for (const n of RANGE_DAYS) {
			const b = bar.createEl("button", { cls: "task-hours-range-btn", text: tr("dash.rangeDays", { n }) });
			if (n === current) b.addClass("is-active");
			b.addEventListener("click", () => {
				if (n === this.plugin.settings.dashboardDays) return;
				this.plugin.settings.dashboardDays = n;
				void this.plugin.saveSettings().then(() => this.renderBody());
			});
		}
	}

	async onClose() {
		this.contentEl.empty();
	}
}
