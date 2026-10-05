// UI language. Japanese when Obsidian is set to Japanese, English otherwise.

export type Lang = "en" | "ja";

let current: Lang = "en";

export function setLang(l: Lang) {
	current = l;
}
export function lang(): Lang {
	return current;
}

const en = {
	// durations
	"dur.hm": "{h}h {m}m",
	"dur.h": "{h}h",
	"dur.m": "{m}m",
	untitled: "(untitled)",

	// query errors
	"q.badLine": "Can't read this line: {line}",
	"q.badScope": "scope must be this / all (use folder: for a folder): {val}",
	"q.badStatus": "status must be open / done / all: {val}",
	"q.badDate": "Can't read this date: {val}",
	"q.badGroup": "group must be none / start / due / file: {val}",
	"q.badSort": "sort must be start / due / estimate / file: {val}",
	"q.badShow": "show must be list / summary: {val}",
	"q.badKey": "Unknown key: {key}",

	// summaries
	"sum.open": "{n} open",
	"sum.done": "{n} done",
	"sum.all": "{n} tasks",
	"sum.noEstimate": "{n} without estimate",
	"sum.empty": "No matching tasks",
	"sum.more": "{n} more (totals include all)",
	"sum.count": "{n}",
	"group.noStart": "No start date",
	"group.noDue": "No due date",
	"group.today": "Today",
	"group.total": "{dur} ({n})",

	// list
	"list.changed": "The note changed since it was read. Please try again.",
	"list.clickToChange": "Click to change",
	"list.clickToEstimate": "Click to change the estimate",
	"list.open": "Open in note",
	"list.badEstimate": "Can't read that estimate (e.g. 2h, 30m, 1h30m)",

	// dashboard
	"dash.title": "Time estimates",
	"dash.root": "/ (entire vault)",
	"dash.pick": "Choose a folder to total",
	"dash.wait": "Choose a folder above. Pick “/ (entire vault)” to include every note.",
	"dash.notFound": "Folder “{folder}” not found",
	"dash.carry": "Carry-over",
	"dash.carryHint": "Start date has passed, not done yet",
	"dash.today": "Today",
	"dash.todayHint": "Starts today",
	"dash.tomorrow": "Tomorrow",
	"dash.tomorrowHint": "Starts tomorrow",
	"dash.week": "Next 7 days",
	"dash.weekHint": "Starts within the next 7 days",
	"dash.nostart": "No start date",
	"dash.nostartHint": "No start date set",
	"dash.tip": "Click 🛫, 📅 or ⏱️ to change dates and estimates right here.",

	// editor suggest
	"sug.select": "select",
	"sug.confirm": "confirm",
	"sug.close": "close",
	"sug.calendar": "Pick from calendar…",
	"sug.start": "Start",
	"sug.due": "Due",
	"sug.estimate": "Estimate",
	"pick.start": "Pick a start date",
	"pick.due": "Pick a due date",
	"pick.ok": "OK",

	// date presets
	"d.today": "Today",
	"d.tomorrow": "Tomorrow",
	"d.in2": "In 2 days",
	"d.nextMon": "Next Monday",
	"d.eom": "End of month",

	// commands & ribbon
	"cmd.dashboard": "Open time estimate dashboard",
	"cmd.add": "Add task (form)",
	"cmd.convert": "Convert shorthand on this line (2h @tomorrow !fri)",
	"cmd.summary": "Show estimate total at top of note",
	"n.openNote": "Open a Markdown note first",
	"n.nothing": "Nothing to convert on this line",
	"n.hasBlock": "This note already has an estimate total block",

	// add-task form
	"add.title": "Add task",
	"add.name": "Task name",
	"add.namePh": "e.g. Draft the proposal",
	"add.estimate": "Estimate",
	"add.estimateDesc": "e.g. 2h / 30m / 1h30m / 1.5h",
	"add.estimatePh": "1h30m",
	"add.start": "Start date",
	"add.due": "Due date",
	"add.submit": "Add",
	"add.needName": "Enter a task name",
	"add.badEstimate": "Can't read that estimate (e.g. 2h, 30m, 1h30m)",
	"add.startAfterDue": "The start date is after the due date",

	// settings
	"set.auto": "Convert automatically when leaving the line",
	"set.autoDesc": "Write “- [ ] Lunch +2h @tomorrow !fri” and press Enter or move to another line to get “⏱️ 2h 🛫 date 📅 date”.",
	"set.suggest": "Show suggestions",
	"set.suggestDesc": "Show date and estimate suggestions when you type the start, due or estimate symbol in a task.",
	"set.startChar": "Start date symbol",
	"set.startCharDesc": "Full-width characters work too.",
	"set.dueChar": "Due date symbol",
	"set.needSymbol": "Enter a symbol",
	"set.estimateChar": "Estimate symbol",
	"set.estimateCharDesc": "Type it in a task to pick an estimate, e.g. +40 or +2h.",
	"set.bare": "Read “2h” / “30m” on its own as an estimate",
	"set.bareDesc": "When off, only parenthesized estimates like “(2h)” are converted.",
	"set.dayFirst": "Read short dates as day/month",
	"set.dayFirstDesc": "Off: 10/7 is October 7. On: 10/7 is 10 July.",
	"set.language": "Language",
	"set.languageDesc": "Takes effect after reloading the plugin.",
	"set.langAuto": "Follow Obsidian",
};

type Key = keyof typeof en;

const ja: Record<Key, string> = {
	// Durations use h / m in every language
	"dur.hm": "{h}h {m}m",
	"dur.h": "{h}h",
	"dur.m": "{m}m",
	untitled: "(無題)",

	"q.badLine": "解釈できない行: {line}",
	"q.badScope": "scope は this / all（フォルダは folder: を使用）: {val}",
	"q.badStatus": "status は open / done / all: {val}",
	"q.badDate": "日付を解釈できません: {val}",
	"q.badGroup": "group は none / start / due / file: {val}",
	"q.badSort": "sort は start / due / estimate / file: {val}",
	"q.badShow": "show は list / summary: {val}",
	"q.badKey": "不明なキー: {key}",

	"sum.open": "未完了タスク {n}件",
	"sum.done": "完了タスク {n}件",
	"sum.all": "全タスク {n}件",
	"sum.noEstimate": "見積なし {n}件",
	"sum.empty": "該当するタスクはありません",
	"sum.more": "ほか {n}件（合計は全件で計算）",
	"sum.count": "{n}件",
	"group.noStart": "開始日なし",
	"group.noDue": "納期なし",
	"group.today": "今日",
	"group.total": "{dur}（{n}件）",

	"list.changed": "ノートが変更されていたため更新できませんでした。もう一度お試しください",
	"list.clickToChange": "クリックで変更",
	"list.clickToEstimate": "クリックで見積を変更",
	"list.open": "元のノートを開く",
	"list.badEstimate": "見積時間の形式が読めません（例: 2h, 30m, 1h30m）",

	"dash.title": "見積ダッシュボード",
	"dash.root": "/（保管庫全体）",
	"dash.pick": "集計するフォルダを選ぶ",
	"dash.wait": "上の欄で集計するフォルダを選んでください。「/（保管庫全体）」を選ぶと全ノートが対象になります。",
	"dash.notFound": "フォルダ「{folder}」が見つかりません",
	"dash.carry": "繰越",
	"dash.carryHint": "開始日を過ぎた未完了",
	"dash.today": "今日",
	"dash.todayHint": "開始日が今日",
	"dash.tomorrow": "明日",
	"dash.tomorrowHint": "開始日が明日",
	"dash.week": "7日間",
	"dash.weekHint": "今日から7日間に開始",
	"dash.nostart": "開始日なし",
	"dash.nostartHint": "開始日が未設定",
	"dash.tip": "🛫・📅・⏱️ をクリックすると、その場で日付や見積を変更できます。",

	"sug.select": "選ぶ",
	"sug.confirm": "決定",
	"sug.close": "閉じる",
	"sug.calendar": "カレンダーから選ぶ…",
	"sug.start": "開始日",
	"sug.due": "納期",
	"sug.estimate": "見積",
	"pick.start": "開始予定日を選ぶ",
	"pick.due": "納期を選ぶ",
	"pick.ok": "決定",

	"d.today": "今日",
	"d.tomorrow": "明日",
	"d.in2": "明後日",
	"d.nextMon": "来週月曜",
	"d.eom": "月末",

	"cmd.dashboard": "見積ダッシュボードを開く",
	"cmd.add": "タスクを追加（入力画面）",
	"cmd.convert": "この行の簡易入力（2h @明日 !金曜）を変換",
	"cmd.summary": "ノート最上部に見積合計を表示",
	"n.openNote": "Markdown ノートを開いてから実行してください",
	"n.nothing": "変換できる簡易入力がありません",
	"n.hasBlock": "このノートには既に見積合計ブロックがあります",

	"add.title": "タスクを追加",
	"add.name": "タスク名",
	"add.namePh": "例: 企画書のドラフト",
	"add.estimate": "見積時間",
	"add.estimateDesc": "例: 2h / 30m / 1h30m / 1.5h / 2時間 / 90分",
	"add.estimatePh": "1h30m",
	"add.start": "開始予定日",
	"add.due": "納期",
	"add.submit": "追加",
	"add.needName": "タスク名を入力してください",
	"add.badEstimate": "見積時間の形式が読めません（例: 2h, 30m, 1h30m）",
	"add.startAfterDue": "開始予定日が納期より後になっています",

	"set.auto": "行を離れたら自動で変換する",
	"set.autoDesc": "「- [ ] 昼食 +2h @明日 !金曜」と書いて Enter や別の行へ移動すると、「⏱️ 2h 🛫 日付 📅 日付」に変換します。",
	"set.suggest": "候補を表示する",
	"set.suggestDesc": "タスク行で開始日・納期・見積の記号を打つと、候補を表示します。",
	"set.startChar": "開始日の記号",
	"set.startCharDesc": "全角で打っても同じように扱います。",
	"set.dueChar": "納期の記号",
	"set.needSymbol": "記号を入力してください",
	"set.estimateChar": "見積の記号",
	"set.estimateCharDesc": "タスク行で打つと見積の候補が出ます（例: +40、+2h）。",
	"set.bare": "「2h」「30分」だけでも見積として読む",
	"set.bareDesc": "オフにすると「(2h)」のように括弧で囲んだときだけ見積として扱います。",
	"set.dayFirst": "短い日付を「日/月」として読む",
	"set.dayFirstDesc": "オフ: 10/7 は10月7日。オン: 10/7 は7月10日。",
	"set.language": "表示言語",
	"set.languageDesc": "プラグインを再読み込みすると反映されます。",
	"set.langAuto": "Obsidian に合わせる",
};

export function t(key: Key, vars: Record<string, string | number> = {}): string {
	const s = (current === "ja" ? ja : en)[key] ?? en[key];
	return s.replace(/\{(\w+)\}/g, (_: string, k: string) => String(vars[k] ?? ""));
}

const WD_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WD_EN_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WD_JA = "月火水木金土日";
const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Monday = 0 */
export function weekdayName(idx: number, long = false): string {
	if (current === "ja") return long ? `${WD_JA[idx]}曜` : WD_JA[idx];
	return long ? WD_EN_LONG[idx] : WD_EN[idx];
}

/** Short date for chips: "Wed, Oct 7" / "10/7(水)" */
export function shortDate(y: number, m: number, d: number, wd: number, showYear: boolean): string {
	if (current === "ja") return `${showYear ? y + "/" : ""}${m}/${d}(${WD_JA[wd]})`;
	return `${WD_EN[wd]}, ${MON_EN[m - 1]} ${d}${showYear ? ", " + y : ""}`;
}

/** Group header: "Wed, Oct 7, 2026" / "2026/10/7（水）" */
export function longDate(y: number, m: number, d: number, wd: number): string {
	if (current === "ja") return `${y}/${m}/${d}（${WD_JA[wd]}）`;
	return `${WD_EN[wd]}, ${MON_EN[m - 1]} ${d}, ${y}`;
}
