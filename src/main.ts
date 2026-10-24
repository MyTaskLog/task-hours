import {
	App,
	Editor,
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	SettingDefinitionItem,
	TFile,
	WorkspaceLeaf,
	debounce,
	getLanguage,
} from "obsidian";
import { DASHBOARD_VIEW, DashboardView, RANGE_DAYS, RangeDays } from "./dashboard";
import { DateSuggest, EstimateSuggest, convertCurrentLine, shorthandExtension } from "./editor";
import { EstimatePicker } from "./estimate";
import { Lang, setLang, t as tr } from "./i18n";
import { dateField } from "./calendar";
import { CodeBlockSuggest } from "./fence";
import { QuerySuggest } from "./qsuggest";
import { PlainUnit, Query, buildTaskLine, onPlainUnitChange, setPlainUnit, filterTasks, formatDuration, parseQuery, parseTasks, totalMinutes } from "./parse";
import { ShorthandOptions } from "./shorthand";
import { isLegacyQuery, parseTQuery, runTQuery } from "./tquery";
import { collectTasks, filesInFolder, renderQueryGroups, renderTaskList, setUiApp } from "./ui";

const BLOCK = "task-hours";
const BLOCK_NAMES = ["task-hours", "Task-Hours", "Task-hours", "TASK-HOURS", "taskhours", "TaskHours", "Taskhours", "TASKHOURS", "task_hours"];

export interface TaskHoursSettings extends ShorthandOptions {
	autoConvert: boolean; // convert shorthand when leaving a line
	dateSuggest: boolean; // suggest dates after @ / !
	blockSuggest: boolean; // suggest tasks / task-hours after ```
	querySuggest: boolean; // suggest instructions inside tasks / task-hours blocks
	dashboardFolders: string[]; // folders to total ("" = entire vault); empty = not chosen yet
	dashboardExclude: string[]; // folders left out
	dashboardDays: RangeDays; // length of the "next N days" tile
	language: "auto" | Lang;
	plainUnit: PlainUnit; // a plain number after ⏱️ in a note
}

const DEFAULT_SETTINGS: TaskHoursSettings = {
	startChar: "@",
	dueChar: "!",
	estimateChar: "+",
	bareEstimate: true,
	autoConvert: true,
	dateSuggest: true,
	blockSuggest: true,
	querySuggest: true,
	dayFirst: false,
	dashboardFolders: [],
	dashboardExclude: [],
	dashboardDays: 14,
	language: "auto",
	plainUnit: "h",
};



export default class TaskHoursPlugin extends Plugin {
	settings: TaskHoursSettings = { ...DEFAULT_SETTINGS };

	async onload() {
		await this.loadSettings();
		setUiApp(this.app);
		setPlainUnit(this.settings.plainUnit);
		const l = this.settings.language;
		setLang(l === "auto" ? (getLanguage().startsWith("ja") ? "ja" : "en") : l);

		// The block name works in any case: task-hours, Task-Hours, TASK-HOURS, taskhours …
		for (const name of BLOCK_NAMES) {
			try {
				this.registerMarkdownCodeBlockProcessor(name, (source, el, ctx) => {
					ctx.addChild(new TaskHoursBlock(this.app, el, source, ctx));
				});
			} catch {
				/* already registered under another spelling */
			}
		}
		this.registerView(DASHBOARD_VIEW, (leaf: WorkspaceLeaf) => new DashboardView(leaf, this));
		this.registerEditorSuggest(new DateSuggest(this.app, this));
		this.registerEditorSuggest(new EstimateSuggest(this.app, this));
		this.registerEditorSuggest(new CodeBlockSuggest(this.app, this));
		this.registerEditorSuggest(new QuerySuggest(this.app, this));
		this.registerEditorExtension(shorthandExtension(this));
		this.addSettingTab(new TaskHoursSettingTab(this.app, this));

		this.addRibbonIcon("timer", tr("cmd.dashboard"), () => this.openDashboard());
		this.addRibbonIcon("list-plus", tr("cmd.add"), () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) {
				new Notice(tr("n.openNote"));
				return;
			}
			new AddTaskModal(this.app, (line) => insertTaskLine(view.editor, line)).open();
		});

		this.addCommand({
			id: "open-dashboard",
			name: tr("cmd.dashboard"),
			callback: () => this.openDashboard(),
		});
		this.addCommand({
			id: "add-task",
			name: tr("cmd.add"),
			editorCallback: (editor: Editor) => {
				new AddTaskModal(this.app, (line) => insertTaskLine(editor, line)).open();
			},
		});
		this.addCommand({
			id: "convert-line",
			name: tr("cmd.convert"),
			editorCallback: (editor: Editor) => {
				if (!convertCurrentLine(this, editor)) new Notice(tr("n.nothing"));
			},
		});
		this.addCommand({
			id: "insert-summary",
			name: tr("cmd.summary"),
			editorCallback: (editor: Editor, view) => {
				if (!view.file) return;
				insertSummaryAtTop(this.app, editor, view.file);
			},
		});
	}

	async openDashboard() {
		const existing = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW);
		let leaf = existing[0];
		if (!leaf) {
			leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf(true);
			await leaf.setViewState({ type: DASHBOARD_VIEW, active: true });
		}
		await this.app.workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		const saved = (await this.loadData()) as (Partial<TaskHoursSettings> & { dashboardFolder?: string | null }) | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
		// 1.2.x and earlier kept one folder
		if (saved && !saved.dashboardFolders && typeof saved.dashboardFolder === "string") this.settings.dashboardFolders = [saved.dashboardFolder];
		delete (this.settings as { dashboardFolder?: unknown }).dashboardFolder;
		this.settings.dashboardFolders = [...this.settings.dashboardFolders];
		this.settings.dashboardExclude = [...this.settings.dashboardExclude];
		if (!RANGE_DAYS.includes(this.settings.dashboardDays)) this.settings.dashboardDays = DEFAULT_SETTINGS.dashboardDays;
	}
	async saveSettings() {
		await this.saveData(this.settings);
		setPlainUnit(this.settings.plainUnit);
	}
}

// ---------- Input ----------

function insertTaskLine(editor: Editor, line: string) {
	const cur = editor.getCursor();
	const text = editor.getLine(cur.line);
	if (text.trim() === "") {
		editor.setLine(cur.line, line);
		editor.setCursor({ line: cur.line, ch: line.length });
	} else {
		editor.replaceRange("\n" + line, { line: cur.line, ch: text.length });
		editor.setCursor({ line: cur.line + 1, ch: line.length });
	}
}

function insertSummaryAtTop(app: App, editor: Editor, file: TFile) {
	const content = editor.getValue();
	if (content.includes("```" + BLOCK)) {
		new Notice(tr("n.hasBlock"));
		return;
	}
	const fm = app.metadataCache.getFileCache(file)?.frontmatterPosition;
	const at = fm ? fm.end.line + 1 : 0;
	const block = "```" + BLOCK + "\nshow: summary\n```\n";
	editor.replaceRange(block, { line: at, ch: 0 });
}

class AddTaskModal extends Modal {
	private name = "";
	private picker!: EstimatePicker;
	private start = "";
	private due = "";

	constructor(app: App, private onSubmit: (line: string) => void) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		this.setTitle(tr("add.title"));

		new Setting(contentEl).setName(tr("add.name")).addText((t) => {
			t.setPlaceholder(tr("add.namePh")).onChange((v) => (this.name = v));
			window.setTimeout(() => t.inputEl.focus(), 0);
		});
		const estRow = new Setting(contentEl).setName(tr("add.estimate"));
		estRow.settingEl.addClass("task-hours-estrow");
		this.picker = new EstimatePicker(estRow.controlEl, null, { onEnter: () => this.submit() });
		const startLabel = "🛫 " + tr("add.start");
		const dueLabel = "📅 " + tr("add.due");
		dateField(this.app, new Setting(contentEl).setName(startLabel).controlEl, startLabel, "", (v) => (this.start = v));
		dateField(this.app, new Setting(contentEl).setName(dueLabel).controlEl, dueLabel, "", (v) => (this.due = v));
		new Setting(contentEl).addButton((b) =>
			b
				.setButtonText(tr("add.submit"))
				.setCta()
				.onClick(() => this.submit())
		);

		contentEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.isComposing) {
				e.preventDefault();
				this.submit();
			}
		});
	}

	private submit() {
		if (!this.name.trim()) {
			new Notice(tr("add.needName"));
			return;
		}
		const estimate = this.picker.value;
		if (estimate === undefined) {
			new Notice(tr("add.badEstimate"));
			return;
		}
		if (this.start && this.due && this.start > this.due) {
			new Notice(tr("add.startAfterDue"));
			return;
		}
		this.onSubmit(buildTaskLine(this.name, estimate ?? "", this.start, this.due));
		this.close();
	}

	onClose() {
		this.contentEl.empty();
	}
}

// ---------- Code block ----------

class TaskHoursBlock extends MarkdownRenderChild {
	private refresh = debounce(() => this.render(), 400, true);

	constructor(
		private app: App,
		containerEl: HTMLElement,
		private source: string,
		private ctx: MarkdownPostProcessorContext
	) {
		super(containerEl);
	}

	onload() {
		void this.render();
		this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()));
		this.registerEvent(this.app.vault.on("delete", () => this.refresh()));
		this.registerEvent(this.app.vault.on("rename", () => this.refresh()));
		this.register(onPlainUnitChange(() => this.refresh()));
		this.registerInterval(window.setInterval(() => this.refresh(), 10 * 60 * 1000));
	}

	private targetFiles(q: Query): TFile[] {
		switch (q.scope.kind) {
			case "this": {
				const f = this.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
				return f instanceof TFile ? [f] : [];
			}
			case "all":
				return this.app.vault.getMarkdownFiles();
			case "folder":
				return filesInFolder(this.app, q.scope.path);
		}
	}

	async render() {
		if (isLegacyQuery(this.source)) return this.renderLegacy();
		return this.renderTasksQuery();
	}

	/** Tasks-plugin syntax: searches the whole vault, like Tasks */
	private async renderTasksQuery() {
		const el = this.containerEl;
		const q = parseTQuery(this.source, { path: this.ctx.sourcePath });
		el.empty();
		el.removeClass("task-hours");
		el.addClass("task-hours-query");
		if (q.errors.length) {
			// Big and red, so a mistyped query is noticed straight away
			const err = el.createDiv({ cls: "task-hours-qerror", attr: { role: "alert" } });
			err.createDiv({ cls: "task-hours-qerror-title", text: "⚠ Task Hours query: do not understand query" });
			for (const e of q.errors) for (const line of e.split("\n")) err.createDiv({ cls: "task-hours-qerror-line", text: line });
			return;
		}
		if (q.explain) {
			const ex = el.createDiv({ cls: "task-hours-explain" });
			ex.createDiv({ cls: "task-hours-error-title", text: tr("q.explain") });
			q.filters.forEach((f) => ex.createDiv({ text: f.text }));
		}
		const all = await collectTasks(this.app, this.app.vault.getMarkdownFiles(), parseTasks);
		const res = runTQuery(q, all, new Date(), formatDuration);

		// The estimate total is opt-in ("show estimate total"); the task count sits at the bottom, like Tasks
		const showTotal = q.show.has("estimate total");
		if (showTotal) {
			const head = el.createDiv({ cls: "task-hours-qtotal" });
			head.createSpan({ cls: "task-hours-qtotal-value", text: `⏱️ ${formatDuration(totalMinutes(res.tasks))}` });
		}
		if (res.tasks.length)
			renderQueryGroups(this.app, el, res.groups, { group: "none", showFile: true, tasksMode: true, hide: q.hide, show: q.show, subtotals: showTotal });
		if (!q.hide.has("task count")) {
			// Always English with a proper plural, as in Tasks: "1 task", "3 tasks", "3 of 10 tasks"
			const n = res.tasks.length;
			const noun = n === 1 ? "task" : "tasks";
			const text = res.shown < n ? `${res.shown} of ${n} ${noun}` : `${n} ${noun}`;
			el.createDiv({ cls: "task-hours-qcount", text });
		}
	}

	/** The original "key: value" syntax */
	private async renderLegacy() {
		const q = parseQuery(this.source, new Date());
		const tasks = filterTasks(await collectTasks(this.app, this.targetFiles(q), parseTasks), q);
		const el = this.containerEl;
		el.empty();
		el.addClass("task-hours");

		if (q.errors.length) {
			const err = el.createDiv({ cls: "task-hours-error" });
			q.errors.forEach((e) => err.createDiv({ text: "⚠ " + e }));
		}

		const total = totalMinutes(tasks);
		const noEst = tasks.filter((t) => t.minutes === null).length;
		const head = el.createDiv({ cls: "task-hours-summary" });
		head.createSpan({ cls: "task-hours-total", text: `⏱️ ${formatDuration(total)}` });
		const statusKey = ({ open: "sum.open", done: "sum.done", all: "sum.all" } as const)[q.status];
		head.createSpan({ cls: "task-hours-meta", text: tr(statusKey, { n: tasks.length }) });
		if (noEst) head.createSpan({ cls: "task-hours-warn", text: tr("sum.noEstimate", { n: noEst }) });

		if (q.show === "summary") return;
		if (tasks.length === 0) {
			el.createDiv({ cls: "task-hours-empty", text: tr("sum.empty") });
			return;
		}
		renderTaskList(this.app, el, tasks, {
			group: q.group,
			showFile: q.scope.kind !== "this" && q.group !== "file",
			limit: q.limit,
		});
	}
}

// ---------- Settings ----------

type SettingKey =
	| "autoConvert"
	| "dateSuggest"
	| "blockSuggest"
	| "querySuggest"
	| "startChar"
	| "dueChar"
	| "estimateChar"
	| "bareEstimate"
	| "dayFirst"
	| "language"
	| "plainUnit";

class TaskHoursSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private plugin: TaskHoursPlugin
	) {
		super(app, plugin);
	}

	// Obsidian 1.13+: declarative settings (also searchable from the settings search)
	getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
		const notEmpty = (v: string) => (v.trim() ? undefined : tr("set.needSymbol"));
		return [
			{ name: tr("set.auto"), desc: tr("set.autoDesc"), control: { type: "toggle", key: "autoConvert" } },
			{ name: tr("set.suggest"), desc: tr("set.suggestDesc"), control: { type: "toggle", key: "dateSuggest" } },
			{ name: tr("set.blockSuggest"), desc: tr("set.blockSuggestDesc"), control: { type: "toggle", key: "blockSuggest" } },
			{ name: tr("set.querySuggest"), desc: tr("set.querySuggestDesc"), control: { type: "toggle", key: "querySuggest" } },
			{
				name: tr("set.startChar"),
				desc: tr("set.startCharDesc"),
				control: { type: "text", key: "startChar", placeholder: "@", validate: notEmpty },
			},
			{ name: tr("set.dueChar"), control: { type: "text", key: "dueChar", placeholder: "!", validate: notEmpty } },
			{
				name: tr("set.estimateChar"),
				desc: tr("set.estimateCharDesc"),
				control: { type: "text", key: "estimateChar", placeholder: "+", validate: notEmpty },
			},
			{ name: tr("set.bare"), desc: tr("set.bareDesc"), control: { type: "toggle", key: "bareEstimate" } },
			{ name: tr("set.dayFirst"), desc: tr("set.dayFirstDesc"), control: { type: "toggle", key: "dayFirst" } },
			{
				name: tr("set.plainUnit"),
				desc: tr("set.plainUnitDesc"),
				control: {
					type: "dropdown",
					key: "plainUnit",
					options: { h: tr("set.plainH"), m: tr("set.plainM"), auto: tr("set.plainAuto") },
				},
			},
			{
				name: tr("set.language"),
				desc: tr("set.languageDesc"),
				control: {
					type: "dropdown",
					key: "language",
					options: { auto: tr("set.langAuto"), en: "English", ja: "日本語" },
				},
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as SettingKey];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		const s = this.plugin.settings as unknown as Record<string, unknown>;
		s[key] = typeof value === "string" && (key === "startChar" || key === "dueChar" || key === "estimateChar") ? value.trim() : value;
		await this.plugin.saveSettings();
	}

	// Fallback for Obsidian versions before 1.13, which don't use getSettingDefinitions()
	display(): void {
		const { containerEl } = this;
		const s = this.plugin.settings;
		const save = () => {
			void this.plugin.saveSettings();
		};
		containerEl.empty();

		const toggle = (name: string, desc: string, key: "autoConvert" | "dateSuggest" | "blockSuggest" | "querySuggest" | "bareEstimate" | "dayFirst") =>
			new Setting(containerEl)
				.setName(name)
				.setDesc(desc)
				.addToggle((t) =>
					t.setValue(s[key]).onChange((v) => {
						s[key] = v;
						save();
					})
				);
		const symbol = (name: string, desc: string, key: "startChar" | "dueChar" | "estimateChar") =>
			new Setting(containerEl)
				.setName(name)
				.setDesc(desc)
				.addText((t) =>
					t.setValue(s[key]).onChange((v) => {
						if (v.trim()) {
							s[key] = v.trim();
							save();
						}
					})
				);

		toggle(tr("set.auto"), tr("set.autoDesc"), "autoConvert");
		toggle(tr("set.suggest"), tr("set.suggestDesc"), "dateSuggest");
		toggle(tr("set.blockSuggest"), tr("set.blockSuggestDesc"), "blockSuggest");
		toggle(tr("set.querySuggest"), tr("set.querySuggestDesc"), "querySuggest");
		symbol(tr("set.startChar"), tr("set.startCharDesc"), "startChar");
		symbol(tr("set.dueChar"), "", "dueChar");
		symbol(tr("set.estimateChar"), tr("set.estimateCharDesc"), "estimateChar");
		toggle(tr("set.bare"), tr("set.bareDesc"), "bareEstimate");
		toggle(tr("set.dayFirst"), tr("set.dayFirstDesc"), "dayFirst");
		new Setting(containerEl)
			.setName(tr("set.plainUnit"))
			.setDesc(tr("set.plainUnitDesc"))
			.addDropdown((d) =>
				d
					.addOption("h", tr("set.plainH"))
					.addOption("m", tr("set.plainM"))
					.addOption("auto", tr("set.plainAuto"))
					.setValue(s.plainUnit)
					.onChange((v) => {
						s.plainUnit = v as PlainUnit;
						save();
					})
			);
		new Setting(containerEl)
			.setName(tr("set.language"))
			.setDesc(tr("set.languageDesc"))
			.addDropdown((d) =>
				d
					.addOption("auto", tr("set.langAuto"))
					.addOption("en", "English")
					.addOption("ja", "日本語")
					.setValue(s.language)
					.onChange((v) => {
						s.language = v as TaskHoursSettings["language"];
						save();
					})
			);
	}
}
