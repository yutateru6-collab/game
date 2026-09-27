# 語彙の砦 — Game

スマホ向けの英単語学習用3D戦車ゲーム。英単語と日本語訳を入力して遊べます。

## 起動

Node.js 22以降を使います。

```sh
npm ci
npm run dev
```

表示されたローカルURLをブラウザで開きます。スマホから同じLAN上のPCに接続する場合は、Viteが表示するNetwork URLを使います。
`dist/` はそのまま静的ホスティング可能な実行ファイル一式です。HTMLファイルの直接起動ではなくHTTPサーバーで開いてください。

現在の公開ページ: https://vocab-castle-gates.axlyuta.chatgpt.site
このGitHubリポジトリと公開ページの自動同期は設定していません。

## 入力

英単語と日本語訳を1行に1組、4組以上入力します。カンマ・タブ・コロン形式に対応します。

```text
reduce,減らす
affect,影響を与える
publish,出版する
compete,競う
```

単語リストはブラウザのローカルストレージに保存します。単語ごとの画像は不要です。

## 操作とルール

- 左スティック: 前後左右・斜め移動
- 右スティック: 照準。自動照準への切り替えも可能
- PC: WASD／矢印で移動、クリックで照準、Qで衝撃波、Eで自動照準、Escで一時停止
- 意味に合う単語ゲートを通ると火力が増え、多連装→貫通→雷撃へ進化
- 不正解・時間切れは火力半減、射撃停止、耐久減少
- 敵を倒すと次の道が開きます。最後のボスを倒して奥の出口へ進むと勝利

## ファイル構成

- `dist/world-engine.js`: 移動、戦闘、出題、敵、ボスのシミュレーション
- `dist/world-renderer.js`: Three.jsによる3D描画
- `dist/world-game.js`: 画面、入力、保存
- `dist/vocab.js`: 単語入力の読み取り
- `dist/vendor/`: 同梱Three.jsとライセンス
- `test-world.mjs`: v3の機能・通し検証
- `QA.md`: 検証結果と未確認事項
- `dist/engine.js`、`dist/game.js`、`test-engine.mjs`: 旧v2のコードとテスト。現在の画面はv3を使用

## 検証

```sh
node test-world.mjs --journey
node test-world.mjs --journey --wrong
```

自動操作で全問正解時のクリア、全問不正解時の敗北を確認しています。
実ブラウザの手動プレイ、スマホ実機の操作感・FPSは未確認です。詳細はQA.mdを参照してください。

## 今後の構想（未実装）

同じ単語リストを使うミニゲーム集を検討しています。候補はリズム鍛冶屋、崩れる橋、宝箱の記憶ゲームなどです。
現時点で遊べるのは戦車ゲームです。

## 第三者ライセンス

Three.jsはMITライセンスです。`dist/vendor/THREE-LICENSE.txt` を参照してください。
