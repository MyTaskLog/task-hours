# Task Hours

タスクに見積時間を付けて、ノートごと・フォルダごと・開始日ごとに合計時間を表示する Obsidian プラグインです。

書式は [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) プラグインと同じ（🛫 開始日・📅 納期）で、見積は ⏱️ で書きます。

```markdown
- [ ] 企画書のドラフト ⏱️ 1h30m 🛫 2026-10-06 📅 2026-10-09
```

Tasks プラグインがなくても使えますが、一緒に使うとより便利です。

[English](README.md)

## 簡易入力

絵文字を打たなくても、短い記号で書けます。タスク行で `+` を打つと見積、`@` で開始予定日、`!` で納期の候補が出ます。↑↓ で選んで Enter を押すと、その場で正式な書式に変わります。

```markdown
- [ ] 昼食 +2h @明日 !金曜
```

は、次のようになります。

```markdown
- [ ] 昼食 ⏱️ 2h 🛫 2026-10-06 📅 2026-10-09
```

| 書き方 | 意味 |
|---|---|
| `+` | 見積時間。`+` だけで 15m・30m・1h・2h… の一覧、`+40` → 40m、`+2` → 2h、`+1.5` → 1h 30m、`+2h` `+1h30m` `+40分` は書いたとおり |
| `@明日` | 開始予定日 |
| `!金曜` | 納期 |

- 全角（`＋４０` `＠明日` `！金曜`）でも大丈夫です。日本語入力をオフにする必要はありません。
- `@` と `!` の候補からは「カレンダーから選ぶ…」でも日付を入力できます。
- 候補を選ばずに `+40 @明日` と書いて Enter を押したり別の行に移ったりしても変換されます。このときは `2h` `30分` `(2h)` のような書き方も見積として扱います。
- すでに日付があるタスクに `@来週` と書き足すと、開始日がその日付に置き換わります（予定の変更）。
- 間違って変換されたときは Ctrl+Z（Mac は Cmd+Z）で戻せます。
- 英語の書き方（`@tomorrow` `!fri` など）も使えます。

### 日付の書き方

| 書き方 | 例（今日が 10/5 月曜のとき） |
|---|---|
| `今日` `明日` `明後日`（ひらがなも可） | 10/5, 10/6, 10/7 |
| `金` `金曜` `金曜日` | 次の金曜（今日を含む）→ 10/9 |
| `来週金曜` `今週月` `再来週水` | 10/16, 10/5, 10/21 |
| `来週` | 来週の月曜 → 10/12 |
| `10/7` `10月7日` `2026-10-07` | 過ぎた日付なら来年 |
| `7日` | 今月の7日（過ぎていれば来月） |
| `+3` `3日後` `2週間後` | 10/8, 10/8, 10/19 |
| `月末` `来月末` `来月` | 10/31, 11/30, 11/1 |

### 誤変換しないためのルール

- `a@b.com` のように英数字の直後の `@` `!` は無視します。
- `@木村さん` のような漢字1文字の曜日から始まる語は変換しません（`@金` や `@金曜会議` は変換します）。
- 「15時」「15時30分」「10:30」は見積として扱いません。
- 見積がすでにあるタスクでは、単独の `2h` は変換しません。変えたいときは `(3h)` と括弧で書きます。
- コードブロックの中は変換しません。

設定画面では、自動変換や日付候補のオン/オフ、`@` `!` 以外の記号への変更、「括弧付きのときだけ見積にする」を選べます。

左のリボンにある「タスクを追加」アイコンから、タスク名・見積・開始日・納期を入力画面で入れることもできます（スマホで便利です）。

## 見積ダッシュボード

左リボンのタイマーアイコンを押すと、右サイドバーに開きます。

1. 上の欄で集計するフォルダを選びます。`/（保管庫全体）` を選ぶと全ノートが対象になります。
2. 「繰越・今日・明日・14日間・開始日なし」ごとに、未完了タスクの合計時間と件数が出ます。
3. 枠をクリックすると、その期間のタスク一覧に切り替わります。「○日間」の枠は日付ごとの小計つきで、一覧の上の **7日 / 14日 / 30日** ボタンで期間を切り替えられます（次回も記憶されます）。

選んだフォルダは記憶されるので、次回からはアイコンを押すだけです。

「繰越」は、開始日を過ぎたのに終わっていないタスクです。開始日を今日以降に変えると、その日の集計に移ります。

### 一覧からその場で変更

- **🛫 開始日・📅 納期** をクリックしてカレンダーで日付を変えると、元のノートの行が書き換わります。
- **⏱️ 見積** をクリックすると見積の入力画面が開きます。数字を入れて **h**（時間）か **min**（分）を選ぶか、よく使う時間のボタンを押します（`+` と同じく、10以上の数字は自動で min になります）。
- チェックボックスで完了／未完了を切り替えられます。
- タスク名をクリックすると、元のノートの該当行へ移動します。

## クエリ（Tasks と同じ書き方）

`task-hours` のコードブロックには、[Tasks](https://publish.obsidian.md/tasks/Queries/About+Queries) プラグインと同じクエリが書けます。`tasks` ブロックで動くクエリは、そのまま `task-hours` でも動きます。違いは、各タスクに見積（⏱️）が表示されることです。

````markdown
```task-hours
not done
has start date
due before next week
group by folder
```
````

Tasks と同じく保管庫全体が対象です。ブロック名は大文字・小文字どちらでも動きます（`task-hours`・`Task-Hours`・`TASK-HOURS`・`taskhours`）。`Task Hours` のように空白を入れることはできません。Markdown では最初の単語だけがブロック名として扱われるためです。

使える命令：

| | |
|---|---|
| 状態 | `done` · `not done` · `status.type is TODO` · `status.name includes …` |
| 日付 | `due` `starts` `scheduled` `created` `done` `cancelled` `happens` ＋ `on` / `before` / `after` / `on or before` / `on or after` / `in` ＋ 日付や期間：`today`、`2026-10-20`、`2026-10-01 2026-10-07`、`next week`、`this month`、`last quarter`、`2026-W42`、`2026-10`、`2026-Q4`、`in two weeks`、`14 days ago`、`next monday` など · `has due date` · `no start date`。Tasks と同じく、`starts …` には開始日のないタスクも含まれます。除きたいときは `(has start date)` を組み合わせます |
| 優先度 | `priority is high` · `priority is above medium` · `priority is not none` |
| 繰り返し | `is recurring` · `is not recurring` · `recurrence includes week` |
| 文字 | `description` `path` `folder` `filename` `heading` `root` ＋ `includes` / `does not include` / `regex matches /…/` |
| タグ | `has tags` · `no tags` · `tags include #work` · `tag does not include #home` |
| 依存関係 | `is blocked` · `is blocking` · `has id` · `has depends on` |
| 組み合わせ | `(due today) OR (start today)` · `(tags include work) AND NOT (priority is high)`。XOR も可。条件は1つずつ括弧で囲みます |
| **見積**（Task Hours 独自） | `has estimate`（見積あり）· `no estimate`（見積なし）· `estimate above 2h` · `estimate below 30m` |
| 並び順 | `sort by due` `start` `scheduled` `priority` `urgency` `description` `path` `filename` `heading` `tag` `status` `done` `created` `happens` `random`、**`sort by estimate`**（長い順）。`reverse` で逆順 |
| グループ | `group by due` `start` `scheduled` `happens` `priority` `folder` `filename` `path` `root` `heading` `backlink` `tags` `status` `recurring` `urgency`、**`group by estimate`**。複数行で入れ子にできます |
| 件数 | `limit 10` · `limit to 10 tasks` · `limit groups 3` |
| 合計（Task Hours 独自） | `show estimate total` で、一覧の上に見積の合計、グループ見出しに小計を表示 |
| 表示 | `hide edit button` `hide backlink` `hide task count` `hide priority` `hide start date` `hide due date` `hide scheduled date` `hide created date` `hide done date` `hide recurrence rule` `hide tags` · `show group count`（小計に件数も表示）· `show urgency` · `explain` |
| 置き換え | `{{query.file.path}}` `{{query.file.folder}}` `{{query.file.filename}}` など（例：`path includes {{query.file.path}}` でこのノートだけ） |

`filter by function` など、JavaScript で条件を書く命令には対応していません。読めない行があると、Tasks と同じく結果の代わりに赤い枠のエラーと問題の行を表示します。一番下の件数は Tasks と同じく `1 task` / `3 tasks`（件数を絞ったときは `3 of 10 tasks`）と表示されます。

一覧の見た目は Tasks と同じで、タスク名・各項目のあとに `(ノート名 > 見出し)` のリンクが付きます。押すとそのタスクの行に移動します。

表示されている項目はその場で変更できます。⏱️ / 🛫 / 📅 / ⏳ / ➕ / ✅ / ❌ をクリックすると日付（見積）を変更でき、優先度をクリックすると別の優先度を選べ、🔁 をクリックすると繰り返しのルールを書き換えられます。✏️（鉛筆）を押すと、まとめて編集する画面が開きます。Task Hours が**新しく追加できるのは見積・開始日・納期だけ**です。そのほかの項目は、タスクにすでに書かれている場合だけ変更・削除できます（追加は Tasks で行ってください）。

### 以前の書き方

`キー: 値` の形で書いたブロックも引き続き使えます。こちらは初期設定で**このノートだけ**が対象です。コマンド「ノート最上部に見積合計を表示」で入るのもこの形です。

````markdown
```task-hours
show: summary
```
````

| キー | 値 | 既定 |
|---|---|---|
| `scope` | `this`（このノート） / `all`（Vault 全体） | `this` |
| `folder` | フォルダパス（サブフォルダも含む。`/` で Vault 全体） | — |
| `start` / `due` | `today`、`this week`、`next 7 days`、`2026-10-01..2026-10-07`、`before today`、`none`、`any` など | — |
| `status` | `open` / `done` / `all` | `open` |
| `group` | `none` / `start` / `due` / `file` | `none` |
| `sort` | `start` / `due` / `estimate` / `file` | `start` |
| `show` | `list` / `summary`（合計のみ） | `list` |
| `limit` | 表示件数の上限（合計は全件で計算） | — |

キーは日本語でも書けます（範囲・フォルダ・開始・納期・状態・グループ・並び順・表示）。

## その他

- 完了扱いになるのは `[x]` `[X]` `[-]`（キャンセル）です。`[/]` などは未完了として数えます。
- 開始日は 🛫 を見ます。🛫 がなく ⏳（Tasks の予定日）がある場合は、⏳ を開始日として扱います。
- 見積の単位：`h` `hr` `hrs` `hour(s)` `時間` `m` `min` `mins` `minute(s)` `分`。ノートに ⏱️ のあと数字だけを書いた場合（`⏱️ 50`）は、初期設定では時間として扱います。設定の「⏱️ のあとの数字だけの見積」で、分、または「自動（10以上は分、`+` と同じ）」に変えられます。見積の入力画面では h / min を選べます。
- Tasks プラグインと併用する場合、⏱️ は 🛫 📅 より前に置く必要があります。簡易入力・入力画面・一覧からの変更では、自動でそう並べます。
- 表示言語は Obsidian の設定（日本語／英語）に合わせます。プラグインの設定で固定することもできます。

## プライバシー

Task Hours は保管庫の中だけで動きます。ネットワーク通信は一切せず、どこにもデータを送りません。

フォルダや保管庫全体のタスクを集計するために、保管庫内の Markdown ファイルの一覧を取得し、タスクを含むファイルを読み込みます。ノートを書き換えるのは、タスク行の簡易入力を変換するときと、Task Hours の一覧から日付・見積・チェックボックスを変更したときだけです。

## インストール

**設定 → コミュニティプラグイン → 閲覧** で「Task Hours」を検索してください。

手動で入れる場合は、最新リリースの `main.js` `manifest.json` `styles.css` を `<Vault>/.obsidian/plugins/task-hours/` に入れて、プラグインを有効にします。

## ライセンス

MIT
