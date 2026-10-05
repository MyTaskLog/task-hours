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
	TFile,
	WorkspaceLeaf,
	debounce,
	getLanguage,
} from "obsidian";
import { DASHBOARD_VIEW, DashboardView } from "./dashboard";
import { DateSuggest, convertCurrentLine, shorthandExtension } from "./editor";
import { Lang, setLang, t as tr } from "./i18n";
import { Query, buildTaskLine, filterTasks, formatDuration, parseDuration, parseQuery, parseTasks, totalMinutes } from "./parse";
import { ShorthandOptions } from "./shorthand";
import { collectTasks, filesInFolder, renderTaskList } from "./ui";

const BLOCK = "task-hours";

export interface TaskHoursSettings extends ShorthandOptions {
	autoConvert: boolean; // convert shorthand when leaving a line
	dateSuggest: boolean; // suggest dates after @ / !
	dashboardFolder: string | null; // null = not chosen yet, "" = entire vault
	language: "auto" | Lang;
}

const DEFAULT_SETTINGS: TaskHoursSettings = {
	startChar: "@",
	dueChar: "!",
	bareEstimate: true,
	autoConvert: true,
	dateSuggest: true,
	dayFirst: false,
	dashboardFolder: null,
	language: "auto",
};



export default class TaskHoursPlugin extends Plugin {
	settings: TaskHoursSettings = { ...DEFAULT_SETTINGS };

	async onload() {
		await this.loadSettings();
		const l = this.settings.language;
		setLang(l === "auto" ? (getLanguage().startsWith("ja") ? "ja" : "en") : l);

		this.registerMarkdownCodeBlockProcessor(BLOCK, (source, el, ctx) => {
			ctx.addChild(new TaskHoursBlock(this.app, el, source, ctx));
		});
		this.registerView(DASHBOARD_VIEW, (leaf: WorkspaceLeaf) => new DashboardView(leaf, this));
		this.registerEditorSuggest(new DateSuggest(this.app, this));
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
		this.app.workspace.revealLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
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
	private estimate = "";
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
		new Setting(contentEl)
			.setName(tr("add.estimate"))
			.setDesc(tr("add.estimateDesc"))
			.addText((t) => t.setPlaceholder("1h30m").onChange((v) => (this.estimate = v)));
		new Setting(contentEl).setName(tr("add.start")).addText((t) => {
			t.inputEl.type = "date";
			t.onChange((v) => (this.start = v));
		});
		new Setting(contentEl).setName(tr("add.due")).addText((t) => {
			t.inputEl.type = "date";
			t.onChange((v) => (this.due = v));
		});
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
		if (this.estimate.trim() && parseDuration(this.estimate) === null) {
			new Notice(tr("add.badEstimate"));
			return;
		}
		if (this.start && this.due && this.start > this.due) {
			new Notice(tr("add.startAfterDue"));
			return;
		}
		this.onSubmit(buildTaskLine(this.name, this.estimate, this.start, this.due));
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
		this.render();
		this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()));
		this.registerEvent(this.app.vault.on("delete", () => this.refresh()));
		this.registerEvent(this.app.vault.on("rename", () => this.refresh()));
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

class TaskHoursSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: TaskHoursPlugin) {
		super(app, plugin);
	}
	display() {
		const { containerEl } = this;
		const s = this.plugin.settings;
		const save = () => this.plugin.saveSettings();
		containerEl.empty();

		new Setting(containerEl)
			.setName(tr("set.auto"))
			.setDesc(tr("set.autoDesc"))
			.addToggle((t) => t.setValue(s.autoConvert).onChange((v) => ((s.autoConvert = v), save())));
		new Setting(containerEl)
			.setName(tr("set.suggest"))
			.setDesc(tr("set.suggestDesc"))
			.addToggle((t) => t.setValue(s.dateSuggest).onChange((v) => ((s.dateSuggest = v), save())));
		new Setting(containerEl)
			.setName(tr("set.startChar"))
			.setDesc(tr("set.startCharDesc"))
			.addText((t) =>
				t.setValue(s.startChar).onChange((v) => {
					if (v.trim()) (s.startChar = v.trim()), save();
				})
			);
		new Setting(containerEl)
			.setName(tr("set.dueChar"))
			.addText((t) =>
				t.setValue(s.dueChar).onChange((v) => {
					if (v.trim()) (s.dueChar = v.trim()), save();
				})
			);
		new Setting(containerEl)
			.setName(tr("set.bare"))
			.setDesc(tr("set.bareDesc"))
			.addToggle((t) => t.setValue(s.bareEstimate).onChange((v) => ((s.bareEstimate = v), save())));
		new Setting(containerEl)
			.setName(tr("set.dayFirst"))
			.setDesc(tr("set.dayFirstDesc"))
			.addToggle((t) => t.setValue(s.dayFirst).onChange((v) => ((s.dayFirst = v), save())));
		new Setting(containerEl)
			.setName(tr("set.language"))
			.setDesc(tr("set.languageDesc"))
			.addDropdown((d) =>
				d
					.addOption("auto", tr("set.langAuto"))
					.addOption("en", "English")
					.addOption("ja", "日本語")
					.setValue(s.language)
					.onChange((v) => ((s.language = v as TaskHoursSettings["language"]), save()))
			);
	}
}

