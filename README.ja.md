# Task Hours

タスクに見積時間（⏱️）を付けて、「今日・明日・この先に何時間ぶんの作業があるか」を集計する Obsidian プラグインです。書式は [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) プラグインと同じなので、Tasks と一緒に使えます（Tasks がなくても動きます）。

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/hero.gif?v=1.5.0" alt="ノートのタスク、見積の合計が付いたクエリ、右サイドバーのダッシュボード">

[English](README.md)

## 簡易入力

タスク行で記号を打つと候補が出て、選ぶだけで Tasks の書式に変わります。絵文字を打つ必要はありません。

| 記号 | 入るもの |
|---|---|
| `+` | ⏱️ 見積時間 |
| `@` | ⏳ 予定日 |
| `$` | 🛫 着手可能日 |
| `!` | 📅 納期 |

全角（`＋` `＠` `＄` `！`）でも大丈夫です。記号は設定で変えられます。

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/quick-entry.gif?v=1.5.0" alt="+ @ $ ! を打って候補から選ぶ様子" width="860">

## 右サイドバー（ダッシュボード）

リボンのタイマーアイコンで開きます。フォルダを選ぶと、**繰越・今日・明日・この先 7 / 14 / 30 日・日付なし**ごとに見積の合計が出ます。⏳ 予定日・🛫 着手可能日・📅 納期のどれで集計するかも、上のボタンで切り替えられます。日付・見積・完了は、その場で変更できます。

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/sidebar.png?v=1.5.0" alt="右サイドバーのダッシュボード" width="360">

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/dashboard.gif?v=1.5.0" alt="フォルダを選び、枠を切り替え、その場で日付や見積を変更する様子" width="900">

## クエリブロック

` ```task-hours ` のコードブロックに、Tasks と同じクエリが書けます。打ち始めると、次に書ける命令やフォルダ名が**入力候補として出ます**。Task Hours では、見積の命令（`has estimate`、`show estimate total` など）も使えます。書き方の詳細は [Tasks の説明書](https://publish.obsidian.md/tasks/Queries/About+Queries) を見てください。

一覧の日付・見積・優先度などはその場で変更でき、繰り返しタスクを完了すると次の回も作られます。

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-suggest.gif?v=1.5.0" alt="入力候補を使ってクエリを書く様子" width="860">

<img src="https://raw.githubusercontent.com/MyTaskLog/task-hours/main/docs/query-edit.gif?v=1.5.0" alt="一覧で日付や見積を変更し、繰り返しタスクを完了する様子" width="900">

## インストール

**設定 → コミュニティプラグイン → 閲覧** で「Task Hours」を検索してください。

手動で入れる場合は、最新リリースの `main.js` `manifest.json` `styles.css` を `<保管庫>/.obsidian/plugins/task-hours/` に入れて有効にします。

## プライバシー

保管庫の中だけで動き、ネットワーク通信はしません。集計のために保管庫内のノートを読み、ノートを書き換えるのは入力の変換や一覧からの変更のときだけです。

## ライセンス

MIT
