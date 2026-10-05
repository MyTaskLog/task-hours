"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TaskHoursPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/dashboard.ts
var import_obsidian2 = require("obsidian");

// src/i18n.ts
var current = "en";
function setLang(l) {
  current = l;
}
var en = {
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
  "dash.wait": "Choose a folder above. Pick \u201C/ (entire vault)\u201D to include every note.",
  "dash.notFound": "Folder \u201C{folder}\u201D not found",
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
  "dash.tip": "Click \u{1F6EB}, \u{1F4C5} or \u23F1\uFE0F to change dates and estimates right here.",
  // editor suggest
  "sug.select": "select",
  "sug.confirm": "confirm",
  "sug.close": "close",
  "sug.calendar": "Pick from calendar\u2026",
  "sug.start": "Start",
  "sug.due": "Due",
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
  "add.start": "Start date",
  "add.due": "Due date",
  "add.submit": "Add",
  "add.needName": "Enter a task name",
  "add.badEstimate": "Can't read that estimate (e.g. 2h, 30m, 1h30m)",
  "add.startAfterDue": "The start date is after the due date",
  // settings
  "set.auto": "Convert automatically when leaving the line",
  "set.autoDesc": "Write \u201C- [ ] Lunch 2h @tomorrow !fri\u201D and press Enter or move to another line to get \u201C\u23F1\uFE0F 2h \u{1F6EB} date \u{1F4C5} date\u201D.",
  "set.suggest": "Suggest dates",
  "set.suggestDesc": "Show date suggestions when you type the start or due symbol in a task.",
  "set.startChar": "Start date symbol",
  "set.startCharDesc": "Full-width characters work too.",
  "set.dueChar": "Due date symbol",
  "set.bare": "Read \u201C2h\u201D / \u201C30m\u201D on its own as an estimate",
  "set.bareDesc": "When off, only parenthesized estimates like \u201C(2h)\u201D are converted.",
  "set.dayFirst": "Read short dates as day/month",
  "set.dayFirstDesc": "Off: 10/7 is October 7. On: 10/7 is 10 July.",
  "set.language": "Language",
  "set.languageDesc": "Takes effect after reloading the plugin.",
  "set.langAuto": "Follow Obsidian"
};
var ja = {
  "dur.hm": "{h}\u6642\u9593{m}\u5206",
  "dur.h": "{h}\u6642\u9593",
  "dur.m": "{m}\u5206",
  untitled: "(\u7121\u984C)",
  "q.badLine": "\u89E3\u91C8\u3067\u304D\u306A\u3044\u884C: {line}",
  "q.badScope": "scope \u306F this / all\uFF08\u30D5\u30A9\u30EB\u30C0\u306F folder: \u3092\u4F7F\u7528\uFF09: {val}",
  "q.badStatus": "status \u306F open / done / all: {val}",
  "q.badDate": "\u65E5\u4ED8\u3092\u89E3\u91C8\u3067\u304D\u307E\u305B\u3093: {val}",
  "q.badGroup": "group \u306F none / start / due / file: {val}",
  "q.badSort": "sort \u306F start / due / estimate / file: {val}",
  "q.badShow": "show \u306F list / summary: {val}",
  "q.badKey": "\u4E0D\u660E\u306A\u30AD\u30FC: {key}",
  "sum.open": "\u672A\u5B8C\u4E86\u30BF\u30B9\u30AF {n}\u4EF6",
  "sum.done": "\u5B8C\u4E86\u30BF\u30B9\u30AF {n}\u4EF6",
  "sum.all": "\u5168\u30BF\u30B9\u30AF {n}\u4EF6",
  "sum.noEstimate": "\u898B\u7A4D\u306A\u3057 {n}\u4EF6",
  "sum.empty": "\u8A72\u5F53\u3059\u308B\u30BF\u30B9\u30AF\u306F\u3042\u308A\u307E\u305B\u3093",
  "sum.more": "\u307B\u304B {n}\u4EF6\uFF08\u5408\u8A08\u306F\u5168\u4EF6\u3067\u8A08\u7B97\uFF09",
  "sum.count": "{n}\u4EF6",
  "group.noStart": "\u958B\u59CB\u65E5\u306A\u3057",
  "group.noDue": "\u7D0D\u671F\u306A\u3057",
  "group.today": "\u4ECA\u65E5",
  "group.total": "{dur}\uFF08{n}\u4EF6\uFF09",
  "list.changed": "\u30CE\u30FC\u30C8\u304C\u5909\u66F4\u3055\u308C\u3066\u3044\u305F\u305F\u3081\u66F4\u65B0\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044",
  "list.clickToChange": "\u30AF\u30EA\u30C3\u30AF\u3067\u5909\u66F4",
  "list.clickToEstimate": "\u30AF\u30EA\u30C3\u30AF\u3067\u898B\u7A4D\u3092\u5909\u66F4",
  "list.open": "\u5143\u306E\u30CE\u30FC\u30C8\u3092\u958B\u304F",
  "list.badEstimate": "\u898B\u7A4D\u6642\u9593\u306E\u5F62\u5F0F\u304C\u8AAD\u3081\u307E\u305B\u3093\uFF08\u4F8B: 2h, 30m, 1h30m\uFF09",
  "dash.title": "\u898B\u7A4D\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9",
  "dash.root": "/\uFF08\u4FDD\u7BA1\u5EAB\u5168\u4F53\uFF09",
  "dash.pick": "\u96C6\u8A08\u3059\u308B\u30D5\u30A9\u30EB\u30C0\u3092\u9078\u3076",
  "dash.wait": "\u4E0A\u306E\u6B04\u3067\u96C6\u8A08\u3059\u308B\u30D5\u30A9\u30EB\u30C0\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002\u300C/\uFF08\u4FDD\u7BA1\u5EAB\u5168\u4F53\uFF09\u300D\u3092\u9078\u3076\u3068\u5168\u30CE\u30FC\u30C8\u304C\u5BFE\u8C61\u306B\u306A\u308A\u307E\u3059\u3002",
  "dash.notFound": "\u30D5\u30A9\u30EB\u30C0\u300C{folder}\u300D\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
  "dash.carry": "\u7E70\u8D8A",
  "dash.carryHint": "\u958B\u59CB\u65E5\u3092\u904E\u304E\u305F\u672A\u5B8C\u4E86",
  "dash.today": "\u4ECA\u65E5",
  "dash.todayHint": "\u958B\u59CB\u65E5\u304C\u4ECA\u65E5",
  "dash.tomorrow": "\u660E\u65E5",
  "dash.tomorrowHint": "\u958B\u59CB\u65E5\u304C\u660E\u65E5",
  "dash.week": "7\u65E5\u9593",
  "dash.weekHint": "\u4ECA\u65E5\u304B\u30897\u65E5\u9593\u306B\u958B\u59CB",
  "dash.nostart": "\u958B\u59CB\u65E5\u306A\u3057",
  "dash.nostartHint": "\u958B\u59CB\u65E5\u304C\u672A\u8A2D\u5B9A",
  "dash.tip": "\u{1F6EB}\u30FB\u{1F4C5}\u30FB\u23F1\uFE0F \u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u3001\u305D\u306E\u5834\u3067\u65E5\u4ED8\u3084\u898B\u7A4D\u3092\u5909\u66F4\u3067\u304D\u307E\u3059\u3002",
  "sug.select": "\u9078\u3076",
  "sug.confirm": "\u6C7A\u5B9A",
  "sug.close": "\u9589\u3058\u308B",
  "sug.calendar": "\u30AB\u30EC\u30F3\u30C0\u30FC\u304B\u3089\u9078\u3076\u2026",
  "sug.start": "\u958B\u59CB\u65E5",
  "sug.due": "\u7D0D\u671F",
  "pick.start": "\u958B\u59CB\u4E88\u5B9A\u65E5\u3092\u9078\u3076",
  "pick.due": "\u7D0D\u671F\u3092\u9078\u3076",
  "pick.ok": "\u6C7A\u5B9A",
  "d.today": "\u4ECA\u65E5",
  "d.tomorrow": "\u660E\u65E5",
  "d.in2": "\u660E\u5F8C\u65E5",
  "d.nextMon": "\u6765\u9031\u6708\u66DC",
  "d.eom": "\u6708\u672B",
  "cmd.dashboard": "\u898B\u7A4D\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u958B\u304F",
  "cmd.add": "\u30BF\u30B9\u30AF\u3092\u8FFD\u52A0\uFF08\u5165\u529B\u753B\u9762\uFF09",
  "cmd.convert": "\u3053\u306E\u884C\u306E\u7C21\u6613\u5165\u529B\uFF082h @\u660E\u65E5 !\u91D1\u66DC\uFF09\u3092\u5909\u63DB",
  "cmd.summary": "\u30CE\u30FC\u30C8\u6700\u4E0A\u90E8\u306B\u898B\u7A4D\u5408\u8A08\u3092\u8868\u793A",
  "n.openNote": "Markdown \u30CE\u30FC\u30C8\u3092\u958B\u3044\u3066\u304B\u3089\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044",
  "n.nothing": "\u5909\u63DB\u3067\u304D\u308B\u7C21\u6613\u5165\u529B\u304C\u3042\u308A\u307E\u305B\u3093",
  "n.hasBlock": "\u3053\u306E\u30CE\u30FC\u30C8\u306B\u306F\u65E2\u306B\u898B\u7A4D\u5408\u8A08\u30D6\u30ED\u30C3\u30AF\u304C\u3042\u308A\u307E\u3059",
  "add.title": "\u30BF\u30B9\u30AF\u3092\u8FFD\u52A0",
  "add.name": "\u30BF\u30B9\u30AF\u540D",
  "add.namePh": "\u4F8B: \u4F01\u753B\u66F8\u306E\u30C9\u30E9\u30D5\u30C8",
  "add.estimate": "\u898B\u7A4D\u6642\u9593",
  "add.estimateDesc": "\u4F8B: 2h / 30m / 1h30m / 1.5h / 2\u6642\u9593 / 90\u5206",
  "add.start": "\u958B\u59CB\u4E88\u5B9A\u65E5",
  "add.due": "\u7D0D\u671F",
  "add.submit": "\u8FFD\u52A0",
  "add.needName": "\u30BF\u30B9\u30AF\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
  "add.badEstimate": "\u898B\u7A4D\u6642\u9593\u306E\u5F62\u5F0F\u304C\u8AAD\u3081\u307E\u305B\u3093\uFF08\u4F8B: 2h, 30m, 1h30m\uFF09",
  "add.startAfterDue": "\u958B\u59CB\u4E88\u5B9A\u65E5\u304C\u7D0D\u671F\u3088\u308A\u5F8C\u306B\u306A\u3063\u3066\u3044\u307E\u3059",
  "set.auto": "\u884C\u3092\u96E2\u308C\u305F\u3089\u81EA\u52D5\u3067\u5909\u63DB\u3059\u308B",
  "set.autoDesc": "\u300C- [ ] \u663C\u98DF 2h @\u660E\u65E5 !\u91D1\u66DC\u300D\u3068\u66F8\u3044\u3066 Enter \u3084\u5225\u306E\u884C\u3078\u79FB\u52D5\u3059\u308B\u3068\u3001\u300C\u23F1\uFE0F 2h \u{1F6EB} \u65E5\u4ED8 \u{1F4C5} \u65E5\u4ED8\u300D\u306B\u5909\u63DB\u3057\u307E\u3059\u3002",
  "set.suggest": "\u65E5\u4ED8\u5019\u88DC\u3092\u8868\u793A\u3059\u308B",
  "set.suggestDesc": "\u30BF\u30B9\u30AF\u884C\u3067\u958B\u59CB\u65E5\u30FB\u7D0D\u671F\u306E\u8A18\u53F7\u3092\u6253\u3064\u3068\u3001\u65E5\u4ED8\u306E\u5019\u88DC\u3092\u8868\u793A\u3057\u307E\u3059\u3002",
  "set.startChar": "\u958B\u59CB\u65E5\u306E\u8A18\u53F7",
  "set.startCharDesc": "\u5168\u89D2\u3067\u6253\u3063\u3066\u3082\u540C\u3058\u3088\u3046\u306B\u6271\u3044\u307E\u3059\u3002",
  "set.dueChar": "\u7D0D\u671F\u306E\u8A18\u53F7",
  "set.bare": "\u300C2h\u300D\u300C30\u5206\u300D\u3060\u3051\u3067\u3082\u898B\u7A4D\u3068\u3057\u3066\u8AAD\u3080",
  "set.bareDesc": "\u30AA\u30D5\u306B\u3059\u308B\u3068\u300C(2h)\u300D\u306E\u3088\u3046\u306B\u62EC\u5F27\u3067\u56F2\u3093\u3060\u3068\u304D\u3060\u3051\u898B\u7A4D\u3068\u3057\u3066\u6271\u3044\u307E\u3059\u3002",
  "set.dayFirst": "\u77ED\u3044\u65E5\u4ED8\u3092\u300C\u65E5/\u6708\u300D\u3068\u3057\u3066\u8AAD\u3080",
  "set.dayFirstDesc": "\u30AA\u30D5: 10/7 \u306F10\u67087\u65E5\u3002\u30AA\u30F3: 10/7 \u306F7\u670810\u65E5\u3002",
  "set.language": "\u8868\u793A\u8A00\u8A9E",
  "set.languageDesc": "\u30D7\u30E9\u30B0\u30A4\u30F3\u3092\u518D\u8AAD\u307F\u8FBC\u307F\u3059\u308B\u3068\u53CD\u6620\u3055\u308C\u307E\u3059\u3002",
  "set.langAuto": "Obsidian \u306B\u5408\u308F\u305B\u308B"
};
function t(key, vars = {}) {
  var _a;
  const s = (_a = (current === "ja" ? ja : en)[key]) != null ? _a : en[key];
  return s.replace(/\{(\w+)\}/g, (_, k) => {
    var _a2;
    return String((_a2 = vars[k]) != null ? _a2 : "");
  });
}
var WD_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var WD_EN_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var WD_JA = "\u6708\u706B\u6C34\u6728\u91D1\u571F\u65E5";
var MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function weekdayName(idx, long = false) {
  if (current === "ja") return long ? `${WD_JA[idx]}\u66DC` : WD_JA[idx];
  return long ? WD_EN_LONG[idx] : WD_EN[idx];
}
function shortDate(y, m, d, wd, showYear) {
  if (current === "ja") return `${showYear ? y + "/" : ""}${m}/${d}(${WD_JA[wd]})`;
  return `${WD_EN[wd]}, ${MON_EN[m - 1]} ${d}${showYear ? ", " + y : ""}`;
}
function longDate(y, m, d, wd) {
  if (current === "ja") return `${y}/${m}/${d}\uFF08${WD_JA[wd]}\uFF09`;
  return `${WD_EN[wd]}, ${MON_EN[m - 1]} ${d}, ${y}`;
}

// src/parse.ts
var TASK_RE = /^\s*(?:[-*+]|\d+[.)])\s+\[(.)\]\s+(.*)$/;
var DATE = "(\\d{4}-\\d{2}-\\d{2})";
var START_RE = new RegExp("\u{1F6EB}\\uFE0F?\\s*" + DATE, "u");
var SCHEDULED_RE = new RegExp("\u23F3\\uFE0F?\\s*" + DATE, "u");
var DUE_RE = new RegExp("\u{1F4C5}\\uFE0F?\\s*" + DATE, "u");
var UNIT_H = "(?:hours?|hrs?|h|\u6642\u9593|\u6642)";
var UNIT_M = "(?:minutes?|mins?|m|\u5206)";
var NUM = "\\d+(?:\\.\\d+)?";
var END = "(?![A-Za-z0-9.])";
var DURATION = "(?:" + NUM + "\\s*" + UNIT_H + "(?:\\s*" + NUM + "\\s*" + UNIT_M + ")?|" + NUM + "\\s*" + UNIT_M + "|" + NUM + ")" + END;
var EST_RE = new RegExp("\u23F1\\uFE0F?\\s*(" + DURATION + ")", "iu");
var STRIP_RES = [
  EST_RE,
  /[🛫⏳📅✅➕❌]️?\s*\d{4}-\d{2}-\d{2}/gu,
  /🔁️?[^🛫⏳📅✅➕❌⏱🔺⏫🔼🔽⏬]*/gu,
  /[🔺⏫🔼🔽⏬]️?/gu
];
function estimateText(line) {
  const m = line.match(EST_RE);
  return m ? m[1].trim() : null;
}
var DONE_STATUSES = ["x", "X", "-"];
function parseDuration(text) {
  const s = text.trim();
  if (!s) return null;
  const full = new RegExp("^(?:(" + NUM + ")\\s*" + UNIT_H + ")?\\s*(?:(" + NUM + ")\\s*" + UNIT_M + ")?$", "i");
  const m = s.match(full);
  if (m && (m[1] || m[2])) {
    const h = m[1] ? parseFloat(m[1]) : 0;
    const min = m[2] ? parseFloat(m[2]) : 0;
    return Math.round(h * 60 + min);
  }
  if (/^\d+(?:\.\d+)?$/.test(s)) return Math.round(parseFloat(s) * 60);
  return null;
}
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return t("dur.hm", { h, m });
  if (h) return t("dur.h", { h });
  return t("dur.m", { m });
}
function parseTaskLine(raw, path, line) {
  var _a;
  const m = raw.match(TASK_RE);
  if (!m) return null;
  const status = m[1];
  const body = m[2];
  const est = body.match(EST_RE);
  const start = (_a = body.match(START_RE)) != null ? _a : body.match(SCHEDULED_RE);
  const due = body.match(DUE_RE);
  let name = body;
  for (const re of STRIP_RES) name = name.replace(re, " ");
  name = name.replace(/\s+/g, " ").trim();
  return {
    path,
    line,
    raw,
    status,
    done: DONE_STATUSES.includes(status),
    name: name || t("untitled"),
    minutes: est ? parseDuration(est[1]) : null,
    start: start ? start[1] : null,
    due: due ? due[1] : null
  };
}
function parseTasks(content, path) {
  const out = [];
  const lines = content.split("\n");
  let inFence = false;
  lines.forEach((raw, i) => {
    if (/^\s*(```|~~~)/.test(raw)) inFence = !inFence;
    if (inFence) return;
    const t2 = parseTaskLine(raw, path, i);
    if (t2) out.push(t2);
  });
  return out;
}
function fmt(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function parseYmd(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function resolveRange(expr, today) {
  const e = expr.trim().toLowerCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return [e, e];
  const mondayOf2 = (d) => addDays(d, -((d.getDay() + 6) % 7));
  switch (e) {
    case "today":
    case "\u4ECA\u65E5":
      return [fmt(today), fmt(today)];
    case "tomorrow":
    case "\u660E\u65E5":
      return [fmt(addDays(today, 1)), fmt(addDays(today, 1))];
    case "yesterday":
    case "\u6628\u65E5":
      return [fmt(addDays(today, -1)), fmt(addDays(today, -1))];
    case "this week":
    case "\u4ECA\u9031": {
      const mo = mondayOf2(today);
      return [fmt(mo), fmt(addDays(mo, 6))];
    }
    case "next week":
    case "\u6765\u9031": {
      const mo = addDays(mondayOf2(today), 7);
      return [fmt(mo), fmt(addDays(mo, 6))];
    }
    case "last week":
    case "\u5148\u9031": {
      const mo = addDays(mondayOf2(today), -7);
      return [fmt(mo), fmt(addDays(mo, 6))];
    }
    case "this month":
    case "\u4ECA\u6708": {
      const a = new Date(today.getFullYear(), today.getMonth(), 1);
      const b = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [fmt(a), fmt(b)];
    }
    case "next month":
    case "\u6765\u6708": {
      const a = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const b = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      return [fmt(a), fmt(b)];
    }
  }
  const nd = e.match(/^(?:next\s+)?(\d+)\s*(?:days|日間?)$/);
  if (nd) return [fmt(today), fmt(addDays(today, parseInt(nd[1]) - 1))];
  return null;
}
function parseDateFilter(expr, today) {
  const e = expr.trim();
  const low = e.toLowerCase();
  if (low === "none" || e === "\u306A\u3057") return { none: true };
  if (low === "any" || e === "\u3042\u308A") return { any: true };
  if (e.includes("..")) {
    const [a, b] = e.split("..");
    const f = {};
    if (a.trim()) {
      const r2 = resolveRange(a, today);
      if (!r2) return null;
      f.from = r2[0];
    }
    if (b.trim()) {
      const r2 = resolveRange(b, today);
      if (!r2) return null;
      f.to = r2[1];
    }
    return f;
  }
  let m;
  if ((m = e.match(/^(?:before|より前)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*より前$/))) {
    const r2 = resolveRange(m[1], today);
    return r2 ? { to: fmt(addDays(parseYmd(r2[0]), -1)) } : null;
  }
  if ((m = e.match(/^(?:after|より後)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*より後$/))) {
    const r2 = resolveRange(m[1], today);
    return r2 ? { from: fmt(addDays(parseYmd(r2[1]), 1)) } : null;
  }
  if ((m = e.match(/^(?:on or before|until|まで)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*まで$/))) {
    const r2 = resolveRange(m[1], today);
    return r2 ? { to: r2[1] } : null;
  }
  if ((m = e.match(/^(?:on or after|from|から)\s+(.+)$/i)) || (m = e.match(/^(.+?)\s*から$/))) {
    const r2 = resolveRange(m[1], today);
    return r2 ? { from: r2[0] } : null;
  }
  const r = resolveRange(e, today);
  return r ? { from: r[0], to: r[1] } : null;
}
function matchDate(value, f) {
  if (f.none) return value === null;
  if (value === null) return false;
  if (f.from && value < f.from) return false;
  if (f.to && value > f.to) return false;
  return true;
}
function parseQuery(source, today) {
  const q = { scope: { kind: "this" }, status: "open", group: "none", sort: "start", show: "list", errors: [] };
  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx < 0) {
      q.errors.push(t("q.badLine", { line }));
      continue;
    }
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    switch (key) {
      case "scope":
      case "\u7BC4\u56F2":
        if (["this", "note", "\u3053\u306E\u30CE\u30FC\u30C8"].includes(val)) q.scope = { kind: "this" };
        else if (["all", "vault", "\u5168\u4F53", "\u3059\u3079\u3066"].includes(val)) q.scope = { kind: "all" };
        else q.errors.push(t("q.badScope", { val }));
        break;
      case "folder":
      case "\u30D5\u30A9\u30EB\u30C0":
        q.scope = { kind: "folder", path: val.replace(/^\/+|\/+$/g, "") };
        break;
      case "status":
      case "\u72B6\u614B":
        if (["open", "\u672A\u5B8C\u4E86"].includes(val)) q.status = "open";
        else if (["done", "\u5B8C\u4E86"].includes(val)) q.status = "done";
        else if (["all", "\u3059\u3079\u3066"].includes(val)) q.status = "all";
        else q.errors.push(t("q.badStatus", { val }));
        break;
      case "start":
      case "\u958B\u59CB": {
        const f = parseDateFilter(val, today);
        if (f) q.start = f;
        else q.errors.push(t("q.badDate", { val }));
        break;
      }
      case "due":
      case "\u7D0D\u671F": {
        const f = parseDateFilter(val, today);
        if (f) q.due = f;
        else q.errors.push(t("q.badDate", { val }));
        break;
      }
      case "group":
      case "\u30B0\u30EB\u30FC\u30D7":
        if (["none", "start", "due", "file"].includes(val)) q.group = val;
        else q.errors.push(t("q.badGroup", { val }));
        break;
      case "sort":
      case "\u4E26\u3073\u9806":
        if (["start", "due", "estimate", "file"].includes(val)) q.sort = val;
        else q.errors.push(t("q.badSort", { val }));
        break;
      case "show":
      case "\u8868\u793A":
        if (["list", "summary"].includes(val)) q.show = val;
        else q.errors.push(t("q.badShow", { val }));
        break;
      case "limit":
        q.limit = parseInt(val) || void 0;
        break;
      default:
        q.errors.push(t("q.badKey", { key }));
    }
  }
  return q;
}
function filterTasks(tasks, q) {
  let r = tasks.filter((t2) => {
    if (q.status === "open" && t2.done) return false;
    if (q.status === "done" && !t2.done) return false;
    if (q.start && !matchDate(t2.start, q.start)) return false;
    if (q.due && !matchDate(t2.due, q.due)) return false;
    return true;
  });
  const key = (t2) => {
    var _a, _b, _c, _d, _e;
    switch (q.sort) {
      case "start":
        return ((_a = t2.start) != null ? _a : "9999") + ((_b = t2.due) != null ? _b : "9999");
      case "due":
        return ((_c = t2.due) != null ? _c : "9999") + ((_d = t2.start) != null ? _d : "9999");
      case "estimate":
        return String(1e5 - ((_e = t2.minutes) != null ? _e : 0)).padStart(6, "0");
      case "file":
        return t2.path + String(t2.line).padStart(6, "0");
    }
  };
  r = r.sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : a.path.localeCompare(b.path) || a.line - b.line);
  return r;
}
function totalMinutes(tasks) {
  return tasks.reduce((s, t2) => {
    var _a;
    return s + ((_a = t2.minutes) != null ? _a : 0);
  }, 0);
}
var FIELD_RE = {
  estimate: new RegExp("\u23F1\\uFE0F?\\s*(?:" + DURATION + "|\\S*)", "u"),
  start: /🛫️?\s*\d{4}-\d{2}-\d{2}/u,
  due: /📅️?\s*\d{4}-\d{2}-\d{2}/u
};
var FIELD_TEXT = {
  estimate: (v) => `\u23F1\uFE0F ${v}`,
  start: (v) => `\u{1F6EB} ${v}`,
  due: (v) => `\u{1F4C5} ${v}`
};
var INSERT_BEFORE = {
  estimate: /[🔺⏫🔼🔽⏬🔁➕🛫⏳📅✅❌🆔⛔]|\s\^[A-Za-z0-9-]+\s*$/u,
  start: /[⏳📅✅❌🆔⛔]|\s\^[A-Za-z0-9-]+\s*$/u,
  due: /[✅❌🆔⛔]|\s\^[A-Za-z0-9-]+\s*$/u
};
function tidy(line) {
  const m = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+\[.\]\s)(.*)$/);
  if (!m) return line.replace(/\s+$/, "");
  return m[1] + m[2].replace(/[ \t]{2,}/g, " ").trim();
}
function setLineField(line, field, value) {
  const re = FIELD_RE[field];
  if (re.test(line)) {
    return tidy(line.replace(re, value ? FIELD_TEXT[field](value) : ""));
  }
  if (!value) return line;
  const head = line.match(/^\s*(?:[-*+]|\d+[.)])\s+\[.\]\s/);
  const offset = head ? head[0].length : 0;
  const body = line.slice(offset);
  const pos = body.search(INSERT_BEFORE[field]);
  const ins = FIELD_TEXT[field](value);
  const nb = pos < 0 ? `${body} ${ins}` : `${body.slice(0, pos)} ${ins} ${body.slice(pos)}`;
  return tidy(line.slice(0, offset) + nb);
}
function buildTaskLine(name, estimate, start, due) {
  let s = `- [ ] ${name.trim()}`;
  if (estimate.trim()) s += ` \u23F1\uFE0F ${estimate.trim()}`;
  if (start) s += ` \u{1F6EB} ${start}`;
  if (due) s += ` \u{1F4C5} ${due}`;
  return s;
}

// src/ui.ts
var import_obsidian = require("obsidian");

// src/dates.ts
function toHalfWidth(s) {
  return s.replace(
    /[！-～　]/g,
    (c) => c === "\u3000" ? " " : String.fromCharCode(c.charCodeAt(0) - 65248)
  );
}
function addDays2(d, n) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
}
function mondayOf(d) {
  return addDays2(d, -((d.getDay() + 6) % 7));
}
function validYmd(y, m, d) {
  const r = new Date(y, m - 1, d);
  return r.getFullYear() === y && r.getMonth() === m - 1 && r.getDate() === d ? r : null;
}
function today0(today) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}
function upcoming(t2, m, d) {
  let r = validYmd(t2.getFullYear(), m, d);
  if (r && r < t2) r = validYmd(t2.getFullYear() + 1, m, d);
  return r;
}
var WEEKDAYS = {
  \u6708: 0,
  \u706B: 1,
  \u6C34: 2,
  \u6728: 3,
  \u91D1: 4,
  \u571F: 5,
  \u65E5: 6,
  mon: 0,
  monday: 0,
  tue: 1,
  tues: 1,
  tuesday: 1,
  wed: 2,
  weds: 2,
  wednesday: 2,
  thu: 3,
  thur: 3,
  thurs: 3,
  thursday: 3,
  fri: 4,
  friday: 4,
  sat: 5,
  saturday: 5,
  sun: 6,
  sunday: 6
};
var MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12
};
var FIXED = {
  today: 0,
  tod: 0,
  now: 0,
  \u4ECA\u65E5: 0,
  \u304D\u3087\u3046: 0,
  \u672C\u65E5: 0,
  tomorrow: 1,
  tmr: 1,
  tmrw: 1,
  tomo: 1,
  \u660E\u65E5: 1,
  \u3042\u3057\u305F: 1,
  \u3042\u3059: 1,
  \u660E\u5F8C\u65E5: 2,
  \u3042\u3055\u3063\u3066: 2,
  yesterday: -1,
  \u6628\u65E5: -1,
  \u304D\u306E\u3046: -1
};
function parseDateWord(input, today, dayFirst = false) {
  var _a;
  const t2 = today0(today);
  const w = toHalfWidth(input).trim().toLowerCase();
  if (!w) return null;
  let m;
  if (w in FIXED) return fmt(addDays2(t2, FIXED[w]));
  if (m = w.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)) {
    const d = validYmd(+m[1], +m[2], +m[3]);
    return d ? fmt(d) : null;
  }
  if (m = w.match(/^(\d{1,2})[/.](\d{1,2})$/)) {
    const [mo, da] = dayFirst ? [+m[2], +m[1]] : [+m[1], +m[2]];
    const d = upcoming(t2, mo, da);
    return d ? fmt(d) : null;
  }
  if (m = w.match(/^(\d{1,2})月(\d{1,2})日?$/)) {
    const d = upcoming(t2, +m[1], +m[2]);
    return d ? fmt(d) : null;
  }
  if ((m = w.match(/^([a-z]+)[\s.-]*(\d{1,2})(?:st|nd|rd|th)?$/)) && m[1] in MONTHS) {
    const d = upcoming(t2, MONTHS[m[1]], +m[2]);
    return d ? fmt(d) : null;
  }
  if ((m = w.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s.-]*([a-z]+)$/)) && m[2] in MONTHS) {
    const d = upcoming(t2, MONTHS[m[2]], +m[1]);
    return d ? fmt(d) : null;
  }
  if ((m = w.match(/^(?:\+|in\s*)?(\d{1,3})\s*(?:d|days?)$/)) || (m = w.match(/^\+(\d{1,3})$/)) || (m = w.match(/^(\d{1,3})日後$/)))
    return fmt(addDays2(t2, +m[1]));
  if ((m = w.match(/^(?:\+|in\s*)?(\d{1,2})\s*(?:w|wks?|weeks?)$/)) || (m = w.match(/^(\d{1,2})週間?後$/)))
    return fmt(addDays2(t2, 7 * +m[1]));
  if (m = w.match(/^(\d{1,2})日$/)) {
    let d = validYmd(t2.getFullYear(), t2.getMonth() + 1, +m[1]);
    if (d && d < t2) {
      const nm = new Date(t2.getFullYear(), t2.getMonth() + 1, 1);
      d = validYmd(nm.getFullYear(), nm.getMonth() + 1, +m[1]);
    }
    return d ? fmt(d) : null;
  }
  if (w === "\u6708\u672B" || w === "eom") return fmt(new Date(t2.getFullYear(), t2.getMonth() + 1, 0));
  if (w === "\u6765\u6708\u672B") return fmt(new Date(t2.getFullYear(), t2.getMonth() + 2, 0));
  if (w === "\u6765\u6708" || /^next[\s-]*month$/.test(w)) return fmt(new Date(t2.getFullYear(), t2.getMonth() + 1, 1));
  if (w === "\u6765\u9031" || /^next[\s-]*week$/.test(w)) return fmt(addDays2(mondayOf(t2), 7));
  if (w === "\u9031\u672B" || w === "\u4ECA\u9031\u672B" || w === "weekend" || w === "eow") return fmt(addDays2(mondayOf(t2), 5));
  m = w.match(/^(今週|来週|再来週|next[\s-]*|this[\s-]*)?(月|火|水|木|金|土|日|[a-z]+?)(曜日|曜)?$/);
  if (m && m[2] in WEEKDAYS) {
    const idx = WEEKDAYS[m[2]];
    const pre = ((_a = m[1]) != null ? _a : "").replace(/[\s-]/g, "");
    if (pre === "\u4ECA\u9031" || pre === "this") return fmt(addDays2(mondayOf(t2), idx));
    if (pre === "\u6765\u9031" || pre === "next") return fmt(addDays2(mondayOf(t2), 7 + idx));
    if (pre === "\u518D\u6765\u9031") return fmt(addDays2(mondayOf(t2), 14 + idx));
    const cur = (t2.getDay() + 6) % 7;
    return fmt(addDays2(t2, (idx - cur + 7) % 7));
  }
  return null;
}
function parseDatePrefix(input, today, dayFirst = false) {
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
function ymdParts(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return { y, m, d, wd: (new Date(y, m - 1, d).getDay() + 6) % 7 };
}
function labelDate(ymd, today = /* @__PURE__ */ new Date()) {
  const { y, m, d, wd } = ymdParts(ymd);
  return shortDate(y, m, d, wd, y !== today.getFullYear());
}
function headerDate(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const { y, m, d, wd } = ymdParts(ymd);
  const s = longDate(y, m, d, wd);
  return ymd === fmt(/* @__PURE__ */ new Date()) ? `${s} \xB7 ${t("group.today")}` : s;
}
var WD_KEYS = [
  ["\u6708", "monday"],
  ["\u706B", "tuesday"],
  ["\u6C34", "wednesday"],
  ["\u6728", "thursday"],
  ["\u91D1", "friday"],
  ["\u571F", "saturday"],
  ["\u65E5", "sunday"]
];
function datePresets(today) {
  const t2 = today0(today);
  const list = [
    { label: t("d.today"), keys: ["\u4ECA\u65E5", "\u304D\u3087\u3046", "today"], date: fmt(t2) },
    { label: t("d.tomorrow"), keys: ["\u660E\u65E5", "\u3042\u3057\u305F", "\u3042\u3059", "tomorrow", "tmr"], date: fmt(addDays2(t2, 1)) },
    { label: t("d.in2"), keys: ["\u660E\u5F8C\u65E5", "\u3042\u3055\u3063\u3066", "+2", "2d"], date: fmt(addDays2(t2, 2)) }
  ];
  for (let i = 3; i <= 7; i++) {
    const d = addDays2(t2, i);
    const wd = (d.getDay() + 6) % 7;
    const [jk, ek] = WD_KEYS[wd];
    list.push({ label: weekdayName(wd, true), keys: [`${jk}\u66DC`, jk, ek], date: fmt(d) });
  }
  list.push({ label: t("d.nextMon"), keys: ["\u6765\u9031", "\u3089\u3044\u3057\u3085\u3046", "next"], date: fmt(addDays2(mondayOf(t2), 7)) });
  list.push({ label: t("d.eom"), keys: ["\u6708\u672B", "\u3052\u3064\u307E\u3064", "eom", "end"], date: fmt(new Date(t2.getFullYear(), t2.getMonth() + 1, 0)) });
  return list;
}

// src/ui.ts
async function collectTasks(app, files, parse) {
  var _a;
  const out = [];
  for (const f of files) {
    const items = (_a = app.metadataCache.getFileCache(f)) == null ? void 0 : _a.listItems;
    if (items !== void 0 && !items.some((li) => li.task !== void 0)) continue;
    out.push(...parse(await app.vault.cachedRead(f), f.path));
  }
  return out;
}
function filesInFolder(app, folder) {
  const p = folder.replace(/^\/+|\/+$/g, "");
  return app.vault.getMarkdownFiles().filter((f) => p === "" || f.path.startsWith(p + "/"));
}
async function rewrite(app, t2, fn) {
  const file = app.vault.getAbstractFileByPath(t2.path);
  if (!(file instanceof import_obsidian.TFile)) return false;
  let ok = false;
  await app.vault.process(file, (data) => {
    var _a;
    const lines = data.split("\n");
    const cur = (_a = lines[t2.line]) == null ? void 0 : _a.replace(/\r$/, "");
    if (cur !== t2.raw.replace(/\r$/, "")) return data;
    const cr = lines[t2.line].endsWith("\r") ? "\r" : "";
    lines[t2.line] = fn(cur) + cr;
    ok = true;
    return lines.join("\n");
  });
  if (!ok) new import_obsidian.Notice(t("list.changed"));
  return ok;
}
function setField(app, t2, field, value) {
  return rewrite(app, t2, (l) => setLineField(l, field, value));
}
function toggleDone(app, t2) {
  return rewrite(
    app,
    t2,
    (line) => t2.done ? line.replace(/\[(.)\]/, "[ ]").replace(/\s*✅️?\s*\d{4}-\d{2}-\d{2}/u, "") : line.replace(/\[(.)\]/, "[x]") + ` \u2705 ${fmt(/* @__PURE__ */ new Date())}`
  );
}
async function openTask(app, t2) {
  const file = app.vault.getAbstractFileByPath(t2.path);
  if (!(file instanceof import_obsidian.TFile)) return;
  const leaf = app.workspace.getLeaf(false);
  await leaf.openFile(file, { eState: { line: t2.line } });
  const view = leaf.view;
  if (view instanceof import_obsidian.MarkdownView) {
    const pos = { line: t2.line, ch: 0 };
    view.editor.setCursor(pos);
    view.editor.scrollIntoView({ from: pos, to: pos }, true);
  }
}
function stop(e) {
  e.preventDefault();
  e.stopPropagation();
}
function dateChip(parent, icon, value, cls, onSet) {
  const chip = parent.createSpan({
    cls: "task-hours-chip " + cls + (value ? "" : " is-empty"),
    text: value ? `${icon} ${labelDate(value)}` : `${icon} +`,
    attr: { "aria-label": t("list.clickToChange"), tabindex: "0" }
  });
  const edit = (e) => {
    stop(e);
    const input = createEl("input", { type: "date", cls: "task-hours-input" });
    input.value = value != null ? value : "";
    chip.replaceWith(input);
    input.focus();
    try {
      input.showPicker();
    } catch (e2) {
    }
    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      const v = input.value || null;
      input.replaceWith(chip);
      if (commit && v !== value) onSet(v);
    };
    input.addEventListener("change", () => finish(true));
    input.addEventListener("blur", () => window.setTimeout(() => document.activeElement !== input && finish(true), 250));
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") finish(false);
      if (ev.key === "Enter") finish(true);
    });
    input.addEventListener("click", stop);
  };
  chip.addEventListener("click", edit);
  chip.addEventListener("keydown", (e) => e.key === "Enter" && edit(e));
}
function estimateChip(parent, t2, onSet) {
  const chip = parent.createSpan({
    cls: "task-hours-chip task-hours-est" + (t2.minutes === null ? " is-missing" : ""),
    text: t2.minutes === null ? "\u23F1\uFE0F ?" : `\u23F1\uFE0F ${formatDuration(t2.minutes)}`,
    attr: { "aria-label": t("list.clickToEstimate"), tabindex: "0" }
  });
  const edit = (e) => {
    var _a;
    stop(e);
    const input = createEl("input", { type: "text", cls: "task-hours-input task-hours-input-est" });
    input.placeholder = "1h30m";
    const orig = t2.minutes === null ? "" : (_a = estimateText(t2.raw)) != null ? _a : "";
    input.value = orig;
    chip.replaceWith(input);
    input.focus();
    input.select();
    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      const v = input.value.trim();
      if (commit && v && parseDuration(v) === null) {
        new import_obsidian.Notice(t("list.badEstimate"));
        return;
      }
      finished = true;
      input.replaceWith(chip);
      if (commit && v !== orig) onSet(v || null);
    };
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && !ev.isComposing) finish(true);
      if (ev.key === "Escape") {
        input.value = orig;
        finish(false);
      }
    });
    input.addEventListener("blur", () => {
      if (!finished) {
        const v = input.value.trim();
        if (v && parseDuration(v) === null) input.value = orig;
        finish(true);
      }
    });
    input.addEventListener("click", stop);
  };
  chip.addEventListener("click", edit);
  chip.addEventListener("keydown", (e) => e.key === "Enter" && edit(e));
}
var NONE = "\0none";
function renderTaskList(app, el, tasks, opt) {
  var _a, _b;
  const shown = opt.limit ? tasks.slice(0, opt.limit) : tasks;
  if (opt.group === "none") {
    renderItems(app, el, shown, opt);
  } else {
    const groups = /* @__PURE__ */ new Map();
    for (const t2 of shown) {
      const k = opt.group === "start" ? (_a = t2.start) != null ? _a : NONE : opt.group === "due" ? (_b = t2.due) != null ? _b : NONE : t2.path;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(t2);
    }
    const keys = [...groups.keys()].sort((a, b) => {
      const na = a === NONE, nb = b === NONE;
      return na !== nb ? na ? 1 : -1 : a.localeCompare(b);
    });
    for (const k of keys) {
      const g = groups.get(k);
      const h = el.createDiv({ cls: "task-hours-group" });
      const label = k === NONE ? t(opt.group === "start" ? "group.noStart" : "group.noDue") : opt.group === "file" ? k.replace(/\.md$/, "") : headerDate(k);
      h.createSpan({ text: label });
      h.createSpan({ cls: "task-hours-group-total", text: t("group.total", { dur: formatDuration(totalMinutes(g)), n: g.length }) });
      renderItems(app, el, g, opt);
    }
  }
  if (opt.limit && tasks.length > opt.limit) {
    el.createDiv({ cls: "task-hours-empty", text: t("sum.more", { n: tasks.length - opt.limit }) });
  }
}
function renderItems(app, parent, tasks, opt) {
  var _a;
  const today = fmt(/* @__PURE__ */ new Date());
  const ul = parent.createEl("ul", { cls: "task-hours-list" });
  for (const t2 of tasks) {
    const li = ul.createEl("li", { cls: "task-hours-item" });
    if (t2.done) li.addClass("is-done");
    const cb = li.createEl("input", { type: "checkbox", cls: "task-list-item-checkbox" });
    cb.checked = t2.done;
    cb.addEventListener("click", (e) => {
      stop(e);
      toggleDone(app, t2);
    });
    const name = li.createEl("a", { cls: "task-hours-name", text: t2.name, attr: { "aria-label": t("list.open") } });
    name.addEventListener("click", (e) => {
      stop(e);
      openTask(app, t2);
    });
    const meta = li.createSpan({ cls: "task-hours-fields" });
    estimateChip(meta, t2, (v) => setField(app, t2, "estimate", v));
    dateChip(meta, "\u{1F6EB}", t2.start, "task-hours-start", (v) => setField(app, t2, "start", v));
    dateChip(
      meta,
      "\u{1F4C5}",
      t2.due,
      "task-hours-due" + (!t2.done && t2.due && t2.due < today ? " is-overdue" : ""),
      (v) => setField(app, t2, "due", v)
    );
    if (opt.showFile) {
      meta.createSpan({ cls: "task-hours-file", text: (_a = t2.path.replace(/\.md$/, "").split("/").pop()) != null ? _a : "" });
    }
  }
}

// src/dashboard.ts
var DASHBOARD_VIEW = "task-hours-dashboard";
var rootLabel = () => t("dash.root");
var PERIOD_IDS = ["carry", "today", "tomorrow", "week", "nostart"];
var periods = () => PERIOD_IDS.map((id) => ({ id, label: t(`dash.${id}`), hint: t(`dash.${id}Hint`) }));
function addDays3(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  return fmt(new Date(y, m - 1, d + n));
}
function inPeriod(t2, p, today) {
  const s = t2.start;
  switch (p) {
    case "carry":
      return !!s && s < today;
    case "today":
      return s === today;
    case "tomorrow":
      return s === addDays3(today, 1);
    case "week":
      return !!s && s >= today && s <= addDays3(today, 6);
    case "nostart":
      return !s;
  }
}
var FolderSuggest = class extends import_obsidian2.AbstractInputSuggest {
  constructor(app, inputEl) {
    super(app, inputEl);
  }
  getSuggestions(query) {
    const q = query.toLowerCase().replace(/^\/+/, "");
    const folders = this.app.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian2.TFolder && !f.isRoot()).map((f) => f.path).sort((a, b) => a.localeCompare(b));
    const hits = folders.filter((p) => p.toLowerCase().includes(q));
    return q && !rootLabel().toLowerCase().includes(q) ? hits : [rootLabel(), ...hits];
  }
  renderSuggestion(value, el) {
    el.setText(value);
  }
};
var DashboardView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.period = "today";
    this.refresh = (0, import_obsidian2.debounce)(() => this.renderBody(), 400, true);
  }
  getViewType() {
    return DASHBOARD_VIEW;
  }
  getDisplayText() {
    return t("dash.title");
  }
  getIcon() {
    return "timer";
  }
  async onOpen() {
    const root = this.contentEl;
    root.empty();
    root.addClass("task-hours-dashboard");
    const bar = root.createDiv({ cls: "task-hours-folder" });
    bar.createSpan({ text: "\u{1F4C1}", cls: "task-hours-folder-icon" });
    this.input = bar.createEl("input", { type: "text", cls: "task-hours-folder-input" });
    this.input.placeholder = t("dash.pick");
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
    this.registerInterval(window.setInterval(() => this.refresh(), 10 * 60 * 1e3));
    await this.renderBody();
  }
  commitTyped() {
    const v = this.input.value.trim();
    if (v === "" || v === rootLabel() || v === "/") return this.setFolder(v === "" ? null : rootLabel());
    const f = this.app.vault.getAbstractFileByPath(v.replace(/^\/+|\/+$/g, ""));
    if (f instanceof import_obsidian2.TFolder) this.setFolder(f.path);
  }
  async setFolder(v) {
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
      el.createDiv({ cls: "task-hours-empty task-hours-wait", text: t("dash.wait") });
      return;
    }
    if (folder !== "" && !(this.app.vault.getAbstractFileByPath(folder) instanceof import_obsidian2.TFolder)) {
      el.createDiv({ cls: "task-hours-error", text: t("dash.notFound", { folder }) });
      return;
    }
    const today = fmt(/* @__PURE__ */ new Date());
    const open = (await collectTasks(this.app, filesInFolder(this.app, folder), parseTasks)).filter((t2) => !t2.done);
    const tiles = el.createDiv({ cls: "task-hours-tiles" });
    for (const p of periods()) {
      const ts = open.filter((t2) => inPeriod(t2, p.id, today));
      const tile = tiles.createDiv({ cls: "task-hours-tile", attr: { "aria-label": p.hint, tabindex: "0" } });
      if (p.id === this.period) tile.addClass("is-active");
      if (p.id === "carry" && ts.length) tile.addClass("is-alert");
      tile.createDiv({ cls: "task-hours-tile-label", text: p.label });
      tile.createDiv({ cls: "task-hours-tile-total", text: formatDuration(totalMinutes(ts)) });
      tile.createDiv({ cls: "task-hours-tile-count", text: t("sum.count", { n: ts.length }) });
      const select = () => {
        this.period = p.id;
        this.renderBody();
      };
      tile.addEventListener("click", select);
      tile.addEventListener("keydown", (e) => e.key === "Enter" && select());
    }
    const list = open.filter((t2) => inPeriod(t2, this.period, today)).sort((a, b) => {
      var _a, _b, _c, _d;
      return ((_a = a.start) != null ? _a : "").localeCompare((_b = b.start) != null ? _b : "") || ((_c = a.due) != null ? _c : "9").localeCompare((_d = b.due) != null ? _d : "9");
    });
    const info = periods().find((p) => p.id === this.period);
    const head = el.createDiv({ cls: "task-hours-summary" });
    head.createSpan({ cls: "task-hours-total", text: `${info.label} \u23F1\uFE0F ${formatDuration(totalMinutes(list))}` });
    const noEst = list.filter((t2) => t2.minutes === null).length;
    if (noEst) head.createSpan({ cls: "task-hours-warn", text: t("sum.noEstimate", { n: noEst }) });
    if (!list.length) {
      el.createDiv({ cls: "task-hours-empty", text: t("sum.empty") });
      return;
    }
    const group = this.period === "week" || this.period === "carry" ? "start" : "none";
    renderTaskList(this.app, el, list, { group, showFile: true });
    el.createDiv({ cls: "task-hours-tip", text: t("dash.tip") });
  }
  async onClose() {
    this.contentEl.empty();
  }
};

// src/editor.ts
var import_view = require("@codemirror/view");
var import_obsidian3 = require("obsidian");

// src/shorthand.ts
var SH_NUM = "\\d+(?:\\.\\d+)?";
var SH_H = "(?:hours?|hrs?|h|\u6642\u9593)";
var SH_M = "(?:minutes?|mins?|m|\u5206)";
var SH_DUR = `(?:${SH_NUM}\\s*${SH_H}(?:\\s*${SH_NUM}\\s*${SH_M})?|${SH_NUM}\\s*${SH_M})`;
var PAREN_EST = new RegExp(`\\(\\s*(${SH_DUR})\\s*\\)`, "gi");
var BARE_EST = new RegExp(`(^|[^A-Za-z0-9.:\u6642])(${SH_DUR})(?=\\s|$)`, "gi");
var TASK_HEAD = /^(\s*(?:[-*+]|\d+[.)])\s+\[.\]\s+)(.*)$/;
function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function convertShorthand(line, opt, today) {
  const m = line.match(TASK_HEAD);
  if (!m) return null;
  const head = m[1];
  const body = m[2];
  const norm = toHalfWidth(body);
  const hits = [];
  const triggers = [
    [toHalfWidth(opt.startChar), "start"],
    [toHalfWidth(opt.dueChar), "due"]
  ];
  for (const [ch, field] of triggers) {
    if (!ch) continue;
    const re = new RegExp(`(^|[^A-Za-z0-9._%+-])${esc(ch)}(\\S+)`, "g");
    let r2;
    while (r2 = re.exec(norm)) {
      const wordStart = r2.index + r2[1].length + ch.length;
      const p = parseDatePrefix(norm.slice(wordStart, wordStart + r2[2].length), today, opt.dayFirst);
      if (p) hits.push({ from: r2.index + r2[1].length, to: wordStart + p.length, field, value: p.date });
    }
  }
  const hasEstimate = /⏱/u.test(body);
  let est = null;
  let r;
  PAREN_EST.lastIndex = 0;
  while (r = PAREN_EST.exec(norm)) est = { from: r.index, to: r.index + r[0].length, field: "estimate", value: r[1].replace(/\s+/g, "") };
  if (!est && !hasEstimate && opt.bareEstimate) {
    BARE_EST.lastIndex = 0;
    while (r = BARE_EST.exec(norm)) {
      const from = r.index + r[1].length;
      est = { from, to: from + r[2].length, field: "estimate", value: r[2].replace(/\s+/g, "") };
    }
  }
  if (est) hits.push(est);
  if (!hits.length) return null;
  const chosen = /* @__PURE__ */ new Map();
  for (const h of hits.sort((a, b) => a.from - b.from)) chosen.set(h.field, h);
  let nb = body;
  for (const h of [...hits].sort((a, b) => b.from - a.from)) nb = nb.slice(0, h.from) + " " + nb.slice(h.to);
  let out = head + nb;
  for (const f of ["estimate", "start", "due"]) {
    const h = chosen.get(f);
    if (h) out = setLineField(out, f, h.value);
  }
  return out === line ? null : out;
}
function isInFence(lines, lineNo) {
  let inFence = false;
  for (let i = 0; i < lineNo; i++) if (/^\s*(```|~~~)/.test(lines(i))) inFence = !inFence;
  return inFence;
}

// src/editor.ts
function insertDateField(line, field, date) {
  let text = setLineField(line, field, date);
  const token = `${field === "start" ? "\u{1F6EB}" : "\u{1F4C5}"} ${date}`;
  const idx = text.indexOf(token);
  if (idx < 0) return { text, ch: text.length };
  const after = idx + token.length;
  if (after === text.length) text += " ";
  return { text, ch: after + 1 };
}
var DateSuggest = class extends import_obsidian3.EditorSuggest {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.field = "start";
    this.limit = 15;
    this.setInstructions([
      { command: "\u2191\u2193", purpose: t("sug.select") },
      { command: "\u21B5", purpose: t("sug.confirm") },
      { command: "esc", purpose: t("sug.close") }
    ]);
  }
  onTrigger(cursor, editor, _file) {
    const s = this.plugin.settings;
    if (!s.dateSuggest) return null;
    const line = editor.getLine(cursor.line);
    const tm = line.match(TASK_RE);
    if (!tm) return null;
    const bodyStart = line.length - tm[2].length;
    const before = toHalfWidth(line.slice(0, cursor.ch));
    const triggers = [
      [toHalfWidth(s.startChar), "start"],
      [toHalfWidth(s.dueChar), "due"]
    ];
    let best = null;
    for (const [ch, field] of triggers) {
      if (!ch) continue;
      const idx = before.lastIndexOf(ch);
      if (idx < bodyStart || idx < 0) continue;
      if (idx > 0 && /[A-Za-z0-9._%+-]/.test(before[idx - 1])) continue;
      if (/\s/.test(before.slice(idx + ch.length))) continue;
      if (!best || idx > best.idx) best = { idx, field, len: ch.length };
    }
    if (!best) return null;
    this.field = best.field;
    return {
      start: { line: cursor.line, ch: best.idx },
      end: cursor,
      query: line.slice(best.idx + best.len, cursor.ch)
    };
  }
  getSuggestions(ctx) {
    const today = /* @__PURE__ */ new Date();
    const q = toHalfWidth(ctx.query).trim().toLowerCase();
    const presets = datePresets(today);
    const items = [];
    const seen = /* @__PURE__ */ new Set();
    const push = (label, date) => {
      const key = label + date;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ label, date });
    };
    if (q) {
      const d = parseDateWord(q, today, this.plugin.settings.dayFirst);
      if (d) push(ctx.query, d);
      presets.filter((p) => p.keys.some((k) => k.toLowerCase().startsWith(q))).forEach((p) => push(p.label, p.date));
      if (!items.length) return [];
    } else {
      presets.forEach((p) => push(p.label, p.date));
    }
    push(t("sug.calendar"), null);
    return items;
  }
  renderSuggestion(item, el) {
    el.addClass("task-hours-suggest");
    const icon = this.field === "start" ? "\u{1F6EB}" : "\u{1F4C5}";
    el.createSpan({ cls: "task-hours-suggest-label", text: `${icon} ${item.label}` });
    if (item.date) el.createSpan({ cls: "task-hours-suggest-date", text: labelDate(item.date) });
    el.createSpan({ cls: "task-hours-suggest-kind", text: t(this.field === "start" ? "sug.start" : "sug.due") });
  }
  selectSuggestion(item, _evt) {
    const ctx = this.context;
    if (!ctx) return;
    const { editor, start, end } = ctx;
    const field = this.field;
    const apply = (date) => {
      const line = editor.getLine(start.line);
      const removed = line.slice(0, start.ch) + line.slice(end.ch);
      const { text, ch } = insertDateField(removed, field, date);
      editor.replaceRange(text, { line: start.line, ch: 0 }, { line: start.line, ch: line.length });
      editor.setCursor({ line: start.line, ch });
      editor.focus();
    };
    this.close();
    if (item.date) apply(item.date);
    else new DatePickerModal(this.app, field, apply).open();
  }
};
var DatePickerModal = class extends import_obsidian3.Modal {
  constructor(app, field, onPick) {
    super(app);
    this.field = field;
    this.onPick = onPick;
  }
  onOpen() {
    this.setTitle(t(this.field === "start" ? "pick.start" : "pick.due"));
    let value = "";
    new import_obsidian3.Setting(this.contentEl).addText((t2) => {
      t2.inputEl.type = "date";
      t2.onChange((v) => value = v);
      window.setTimeout(() => {
        t2.inputEl.focus();
        try {
          t2.inputEl.showPicker();
        } catch (e) {
        }
      }, 50);
    }).addButton(
      (b) => b.setButtonText(t("pick.ok")).setCta().onClick(() => {
        if (value) this.onPick(value);
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};
function shorthandExtension(plugin) {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.pos = view.state.selection.main.head;
      }
      update(u) {
        const prev = u.docChanged ? u.changes.mapPos(this.pos, -1) : this.pos;
        const head = u.state.selection.main.head;
        this.pos = head;
        if (!plugin.settings.autoConvert) return;
        if (!u.docChanged && !u.selectionSet) return;
        const doc = u.state.doc;
        const prevLine = doc.lineAt(Math.min(prev, doc.length));
        if (prevLine.number === doc.lineAt(head).number) return;
        const view = u.view;
        const lineNo = prevLine.number;
        window.setTimeout(() => convertLine(plugin, view, lineNo), 0);
      }
    }
  );
}
function convertLine(plugin, view, lineNo) {
  if (view.composing) return;
  const doc = view.state.doc;
  if (lineNo < 1 || lineNo > doc.lines) return;
  const line = doc.line(lineNo);
  if (doc.lineAt(view.state.selection.main.head).number === lineNo) return;
  if (!TASK_RE.test(line.text)) return;
  if (isInFence((i) => doc.line(i + 1).text, lineNo - 1)) return;
  const next = convertShorthand(line.text, plugin.settings, /* @__PURE__ */ new Date());
  if (next === null) return;
  view.dispatch({ changes: { from: line.from, to: line.to, insert: next }, userEvent: "input.task-hours" });
}
function convertCurrentLine(plugin, editor) {
  const c = editor.getCursor();
  const text = editor.getLine(c.line);
  const next = convertShorthand(text, plugin.settings, /* @__PURE__ */ new Date());
  if (next === null) return false;
  editor.setLine(c.line, next);
  editor.setCursor({ line: c.line, ch: next.length });
  return true;
}

// src/main.ts
var BLOCK = "task-hours";
var DEFAULT_SETTINGS = {
  startChar: "@",
  dueChar: "!",
  bareEstimate: true,
  autoConvert: true,
  dateSuggest: true,
  dayFirst: false,
  dashboardFolder: null,
  language: "auto"
};
var TaskHoursPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    const l = this.settings.language;
    setLang(l === "auto" ? (0, import_obsidian4.getLanguage)().startsWith("ja") ? "ja" : "en" : l);
    this.registerMarkdownCodeBlockProcessor(BLOCK, (source, el, ctx) => {
      ctx.addChild(new TaskHoursBlock(this.app, el, source, ctx));
    });
    this.registerView(DASHBOARD_VIEW, (leaf) => new DashboardView(leaf, this));
    this.registerEditorSuggest(new DateSuggest(this.app, this));
    this.registerEditorExtension(shorthandExtension(this));
    this.addSettingTab(new TaskHoursSettingTab(this.app, this));
    this.addRibbonIcon("timer", t("cmd.dashboard"), () => this.openDashboard());
    this.addRibbonIcon("list-plus", t("cmd.add"), () => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
      if (!view) {
        new import_obsidian4.Notice(t("n.openNote"));
        return;
      }
      new AddTaskModal(this.app, (line) => insertTaskLine(view.editor, line)).open();
    });
    this.addCommand({
      id: "open-dashboard",
      name: t("cmd.dashboard"),
      callback: () => this.openDashboard()
    });
    this.addCommand({
      id: "add-task",
      name: t("cmd.add"),
      editorCallback: (editor) => {
        new AddTaskModal(this.app, (line) => insertTaskLine(editor, line)).open();
      }
    });
    this.addCommand({
      id: "convert-line",
      name: t("cmd.convert"),
      editorCallback: (editor) => {
        if (!convertCurrentLine(this, editor)) new import_obsidian4.Notice(t("n.nothing"));
      }
    });
    this.addCommand({
      id: "insert-summary",
      name: t("cmd.summary"),
      editorCallback: (editor, view) => {
        if (!view.file) return;
        insertSummaryAtTop(this.app, editor, view.file);
      }
    });
  }
  async openDashboard() {
    var _a;
    const existing = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW);
    let leaf = existing[0];
    if (!leaf) {
      leaf = (_a = this.app.workspace.getRightLeaf(false)) != null ? _a : this.app.workspace.getLeaf(true);
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
};
function insertTaskLine(editor, line) {
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
function insertSummaryAtTop(app, editor, file) {
  var _a;
  const content = editor.getValue();
  if (content.includes("```" + BLOCK)) {
    new import_obsidian4.Notice(t("n.hasBlock"));
    return;
  }
  const fm = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatterPosition;
  const at = fm ? fm.end.line + 1 : 0;
  const block = "```" + BLOCK + "\nshow: summary\n```\n";
  editor.replaceRange(block, { line: at, ch: 0 });
}
var AddTaskModal = class extends import_obsidian4.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.name = "";
    this.estimate = "";
    this.start = "";
    this.due = "";
  }
  onOpen() {
    const { contentEl } = this;
    this.setTitle(t("add.title"));
    new import_obsidian4.Setting(contentEl).setName(t("add.name")).addText((t2) => {
      t2.setPlaceholder(t("add.namePh")).onChange((v) => this.name = v);
      window.setTimeout(() => t2.inputEl.focus(), 0);
    });
    new import_obsidian4.Setting(contentEl).setName(t("add.estimate")).setDesc(t("add.estimateDesc")).addText((t2) => t2.setPlaceholder("1h30m").onChange((v) => this.estimate = v));
    new import_obsidian4.Setting(contentEl).setName(t("add.start")).addText((t2) => {
      t2.inputEl.type = "date";
      t2.onChange((v) => this.start = v);
    });
    new import_obsidian4.Setting(contentEl).setName(t("add.due")).addText((t2) => {
      t2.inputEl.type = "date";
      t2.onChange((v) => this.due = v);
    });
    new import_obsidian4.Setting(contentEl).addButton(
      (b) => b.setButtonText(t("add.submit")).setCta().onClick(() => this.submit())
    );
    contentEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        this.submit();
      }
    });
  }
  submit() {
    if (!this.name.trim()) {
      new import_obsidian4.Notice(t("add.needName"));
      return;
    }
    if (this.estimate.trim() && parseDuration(this.estimate) === null) {
      new import_obsidian4.Notice(t("add.badEstimate"));
      return;
    }
    if (this.start && this.due && this.start > this.due) {
      new import_obsidian4.Notice(t("add.startAfterDue"));
      return;
    }
    this.onSubmit(buildTaskLine(this.name, this.estimate, this.start, this.due));
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TaskHoursBlock = class extends import_obsidian4.MarkdownRenderChild {
  constructor(app, containerEl, source, ctx) {
    super(containerEl);
    this.app = app;
    this.source = source;
    this.ctx = ctx;
    this.refresh = (0, import_obsidian4.debounce)(() => this.render(), 400, true);
  }
  onload() {
    this.render();
    this.registerEvent(this.app.metadataCache.on("changed", () => this.refresh()));
    this.registerEvent(this.app.vault.on("delete", () => this.refresh()));
    this.registerEvent(this.app.vault.on("rename", () => this.refresh()));
    this.registerInterval(window.setInterval(() => this.refresh(), 10 * 60 * 1e3));
  }
  targetFiles(q) {
    switch (q.scope.kind) {
      case "this": {
        const f = this.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
        return f instanceof import_obsidian4.TFile ? [f] : [];
      }
      case "all":
        return this.app.vault.getMarkdownFiles();
      case "folder":
        return filesInFolder(this.app, q.scope.path);
    }
  }
  async render() {
    const q = parseQuery(this.source, /* @__PURE__ */ new Date());
    const tasks = filterTasks(await collectTasks(this.app, this.targetFiles(q), parseTasks), q);
    const el = this.containerEl;
    el.empty();
    el.addClass("task-hours");
    if (q.errors.length) {
      const err = el.createDiv({ cls: "task-hours-error" });
      q.errors.forEach((e) => err.createDiv({ text: "\u26A0 " + e }));
    }
    const total = totalMinutes(tasks);
    const noEst = tasks.filter((t2) => t2.minutes === null).length;
    const head = el.createDiv({ cls: "task-hours-summary" });
    head.createSpan({ cls: "task-hours-total", text: `\u23F1\uFE0F ${formatDuration(total)}` });
    const statusKey = { open: "sum.open", done: "sum.done", all: "sum.all" }[q.status];
    head.createSpan({ cls: "task-hours-meta", text: t(statusKey, { n: tasks.length }) });
    if (noEst) head.createSpan({ cls: "task-hours-warn", text: t("sum.noEstimate", { n: noEst }) });
    if (q.show === "summary") return;
    if (tasks.length === 0) {
      el.createDiv({ cls: "task-hours-empty", text: t("sum.empty") });
      return;
    }
    renderTaskList(this.app, el, tasks, {
      group: q.group,
      showFile: q.scope.kind !== "this" && q.group !== "file",
      limit: q.limit
    });
  }
};
var TaskHoursSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    const save = () => this.plugin.saveSettings();
    containerEl.empty();
    new import_obsidian4.Setting(containerEl).setName(t("set.auto")).setDesc(t("set.autoDesc")).addToggle((t2) => t2.setValue(s.autoConvert).onChange((v) => (s.autoConvert = v, save())));
    new import_obsidian4.Setting(containerEl).setName(t("set.suggest")).setDesc(t("set.suggestDesc")).addToggle((t2) => t2.setValue(s.dateSuggest).onChange((v) => (s.dateSuggest = v, save())));
    new import_obsidian4.Setting(containerEl).setName(t("set.startChar")).setDesc(t("set.startCharDesc")).addText(
      (t2) => t2.setValue(s.startChar).onChange((v) => {
        if (v.trim()) s.startChar = v.trim(), save();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("set.dueChar")).addText(
      (t2) => t2.setValue(s.dueChar).onChange((v) => {
        if (v.trim()) s.dueChar = v.trim(), save();
      })
    );
    new import_obsidian4.Setting(containerEl).setName(t("set.bare")).setDesc(t("set.bareDesc")).addToggle((t2) => t2.setValue(s.bareEstimate).onChange((v) => (s.bareEstimate = v, save())));
    new import_obsidian4.Setting(containerEl).setName(t("set.dayFirst")).setDesc(t("set.dayFirstDesc")).addToggle((t2) => t2.setValue(s.dayFirst).onChange((v) => (s.dayFirst = v, save())));
    new import_obsidian4.Setting(containerEl).setName(t("set.language")).setDesc(t("set.languageDesc")).addDropdown(
      (d) => d.addOption("auto", t("set.langAuto")).addOption("en", "English").addOption("ja", "\u65E5\u672C\u8A9E").setValue(s.language).onChange((v) => (s.language = v, save()))
    );
  }
};
