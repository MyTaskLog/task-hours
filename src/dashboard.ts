// Sidebar dashboard: pick a folder, see estimate totals by start date

import { AbstractInputSuggest, App, ItemView, TFolder, WorkspaceLeaf, debounce } from "obsidian";
import type TaskHoursPlugin from "./main";
import { t as tr } from "./i18n";
import { Task, fmt, formatDuration, parseTasks, totalMinutes } from "./parse";
import { GroupBy, collectTasks, filesInFolder, renderTaskList } from "./ui";

export const DASHBOARD_VIEW = "task-hours-dashboard";
const rootLabel = () => tr("dash.root");

type Period = "carry" | "today" | "tomorrow" | "week" | "nostart";

const PERIOD_IDS: Period[] = ["carry", "today", "tomorrow", "week", "nostart"];
const periods = () =>
	PERIOD_IDS.map((id) => ({ id, label: tr(`dash.${id}`), hint: tr(`dash.${id}Hint`) }));

function addDays(ymd: string, n: number): string {
	const [y, m, d] = ymd.split("-").map(Number);
	return fmt(new Date(y, m - 1, d + n));
}

function inPeriod(t: Task, p: Period, today: string): boolean {
	const s = t.start;
	switch (p) {
		case "carry":
			return !!s && s < today;
		case "today":
			return s === today;
		case "tomorrow":
			return s === addDays(today, 1);
		case "week":
			return !!s && s >= today && s <= addDays(today, 6);
		case "nostart":
			return !s;
	}
}

class FolderSuggest extends AbstractInputSuggest<string> {
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
	}
	getSuggestions(query: string): string[] {
		const q = query.toLowerCase().replace(/^\/+/, "");
		const folders = this.app.vault
			.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder && !f.isRoot())
			.map((f) => f.path)
			.sort((a, b) => a.localeCompare(b));
		const hits = folders.filter((p) => p.toLowerCase().includes(q));
		return q && !rootLabel().toLowerCase().includes(q) ? hits : [rootLabel(), ...hits];
	}
	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}
}

export class DashboardView extends ItemView {
	private period: Period = "today";
	private bodyEl!: HTMLElement;
	private input!: HTMLInputElement;
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

		const bar = root.createDiv({ cls: "task-hours-folder" });
		bar.createSpan({ text: "📁", cls: "task-hours-folder-icon" });
		this.input = bar.createEl("input", { type: "text", cls: "task-hours-folder-input" });
		this.input.placeholder = tr("dash.pick");
		const folder = this.plugin.settings.dashboardFolder;
		this.input.value = folder === null ? "" : folder === "" ? rootLabel() : folder;
		new FolderSuggest(this.app, this.input).onSelect((v, _e) => {
			this.input.value = v;
			this.input.blur();
			this.setFolder(v);
		});
		this.input.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.isComposing) this.commitTyped();
		});
		this.input.addEventListener("change", () => this.commitTyped());

		this.bodyEl = root.createDiv();
		this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()));
		this.registerEvent(this.app.vault.on("delete", () => this.refresh()));
		this.registerEvent(this.app.vault.on("rename", () => this.refresh()));
		this.registerInterval(window.setInterval(() => this.refresh(), 10 * 60 * 1000));
		await this.renderBody();
	}

	private commitTyped() {
		const v = this.input.value.trim();
		if (v === "" || v === rootLabel() || v === "/") return this.setFolder(v === "" ? null : rootLabel());
		const f = this.app.vault.getAbstractFileByPath(v.replace(/^\/+|\/+$/g, ""));
		if (f instanceof TFolder) this.setFolder(f.path);
	}

	private async setFolder(v: string | null) {
		this.plugin.settings.dashboardFolder = v === null ? null : v === rootLabel() ? "" : v;
		await this.plugin.saveSettings();
		await this.renderBody();
	}

	async renderBody() {
		const el = this.bodyEl;
		if (!el) return;
		const folder = this.plugin.settings.dashboardFolder;
		el.empty();
		if (folder === null) {
			el.createDiv({ cls: "task-hours-empty task-hours-wait", text: tr("dash.wait") });
			return;
		}
		if (folder !== "" && !(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder)) {
			el.createDiv({ cls: "task-hours-error", text: tr("dash.notFound", { folder }) });
			return;
		}

		const today = fmt(new Date());
		const open = (await collectTasks(this.app, filesInFolder(this.app, folder), parseTasks)).filter((t) => !t.done);
		const tiles = el.createDiv({ cls: "task-hours-tiles" });
		for (const p of periods()) {
			const ts = open.filter((t) => inPeriod(t, p.id, today));
			const tile = tiles.createDiv({ cls: "task-hours-tile", attr: { "aria-label": p.hint, tabindex: "0" } });
			if (p.id === this.period) tile.addClass("is-active");
			if (p.id === "carry" && ts.length) tile.addClass("is-alert");
			tile.createDiv({ cls: "task-hours-tile-label", text: p.label });
			tile.createDiv({ cls: "task-hours-tile-total", text: formatDuration(totalMinutes(ts)) });
			tile.createDiv({ cls: "task-hours-tile-count", text: tr("sum.count", { n: ts.length }) });
			const select = () => {
				this.period = p.id;
				this.renderBody();
			};
			tile.addEventListener("click", select);
			tile.addEventListener("keydown", (e) => e.key === "Enter" && select());
		}

		const list = open
			.filter((t) => inPeriod(t, this.period, today))
			.sort((a, b) => (a.start ?? "").localeCompare(b.start ?? "") || (a.due ?? "9").localeCompare(b.due ?? "9"));
		const info = periods().find((p) => p.id === this.period)!;
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

	async onClose() {
		this.contentEl.empty();
	}
}
