# 語彙の砦 v3 — 2026-09-27

## 追加: ポップな外観・仕分け工場・単語ボム迷路
- 宝箱と共通メニューを明るい配色に変更。戦車はHUDだけでなく、3Dの空・地形・車体の色も変更。
- 仕分け工場: 60秒、3便18個、15個以上でクリア。タップ選択→宛先とドラッグに対応。誤配送・取り逃がしは合計5回で終了。
- 単語ボム迷路: 9×9、150秒、敵3体、爆弾2.4秒、十字2マス、壁の遮蔽、箱破壊、誘爆、自爆、単語3択補充、敵全滅後の出口。
- test-arcade.mjs: 工場の18個／15個クリア、誤答ロック、放置敗北。迷路の移動、補充と二重解答防止、クイズ中停止、箱での爆風停止、連鎖、自爆、敵撃破と出口条件、時間切れを確認。
- 100通りの初期迷路で最初の爆弾から曲がり角へ逃げられること、箱を除けば出口へ接続することを確認。
- ボム迷路の戦闘検証は制御された配置で実施。ランダム迷路の人間による通しプレイや難度評価は未確認。
- 既存の入力・宝箱・戦車の回帰テストと新規JS/CSS構文も確認。実ブラウザ表示・スマホ実機のタップ／ドラッグは未確認。

## 追加: 十字キーの一時停止修正・爆弾リレー
- 報告画像は戦車の一時停止オーバーレイ。window.blurから無条件にpause(true)する経路を特定して除去。iPhone上でそのイベントが実際に発生したかのログは取得できていないため、端末上の根本原因を断定しない。
- 一時的なフォーカス喪失では一時停止しない。操作中のタッチは保持し、pointerup／pointercancel／lostpointercaptureで解除。画面の非表示・pagehideでは一時停止して入力を解除する。
- test-input.mjsで実際のworld-game.jsを最小のDOMアダプター上で実行し、2本指操作、キャンセル、キャプチャ喪失、20回のフォーカス喪失、背景移行と再開を確認。ブラウザやiPhoneでのテストを代替したものではない。
- 爆弾リレー: 共有単語の○×判断、CPU対戦、連続正解、導火線、3勝先取（最大5ラウンド）、復習一覧、明るい専用画面。
- test-bomb.mjsで正解パス、不正解1.35秒足止め、連打防止、CPUターン、爆発、進行と終了を確認。乱数15通り×3方針。0.7秒で全問正解は13勝2敗、全問不正解と放置は各15敗。運の要素があり全問正解の勝利は保証しない。
- 宝箱と戦車の既存機能テストも通過。CSS構文と新規JS構文を確認。
- 実機での操作・表示は未確認。既存のブラウザポリシー拒否を迂回していない。

## 追加: おぼえて宝箱と共通メニュー
- index.htmlを共通メニューに変更。戦車の入口をtank.htmlに保持。単語保存キーを共用。
- memory.html: 7秒の暗記、90秒の探索、3部屋、英日ペア、連続成功、ヒント、結果の復習、単語セット別自己ベスト。
- node test-memory.mjs: 正解判定、同じ箱の連打防止、3箱目の操作ロック、誤答後の閉鎖、ヒントの制限、3部屋のクリア、時間切れ、4語セットでの繰り返し、同じ訳の除外、UI参照を確認。
- 戦車の全問正解・全問不正解の通し検証も再実行し、既存の勝利／敗北が維持されることを確認。
- 宝箱の実ブラウザ手動プレイ、スマホ実機での表示・タッチは未確認。既存のブラウザURLポリシー拒否を迂回していない。

## 実装
- Three.js の3D戦場。前後左右・斜め移動、遅れて追従する斜めカメラ。
- 左スティックで移動、右スティックで照準。自動照準切り替え、タップ照準、PCキー操作。
- 城門前→峡谷の橋→広場→回廊→魔王の庭。壁と通路幅に実際の衝突判定。
- 6つの単語ゲート。入力単語をシャッフルし、日本語訳に合う英単語の門を通る。通過済みの門は再利用不可。
- 正解で火力・武器が進化。不正解は火力半減、1.5秒の射撃停止、耐久減少。
- 通常・高速・盾・分裂の敵。敵を全滅させると次の道が開く。
- 爆発する樽、補給箱、撃破で充填する衝撃波、予告突進と気絶時の弱点があるボス。
- 地形の静的ボックスは素材別インスタンス描画。弾もインスタンス描画、画素倍率は最大1.7。
- 素材は全単語で共用。Three.jsは同梱し外部CDNに依存しない。

## 自動検証
- `node test-world.mjs --journey`
- `node test-world.mjs --journey --wrong`
- 前後左右・斜め移動、カメラ投影と左右の対応、移動中の照準方向維持。
- 壁と橋の境界、門の一度きりの強化、出口封鎖と解除、無回答の罰則。
- 盾の正面軽減と背面命中、敵の分裂、樽の爆発、衝撃波の消費と再充填、弾の線分衝突。
- UIが参照する要素の存在。
- 固定乱数・同じ経路探索と戦闘方針で、全問正解は50秒・6/6正解・194体撃破・耐久100でボス撃破とゴール到達。全問不正解は62秒・0/3正解・耐久0で敗北。
- 通し検証はゲーム内部の本来の移動・射撃・ダメージを使用。テレポート、耐久上書き、敵の強制削除、勝利の強制は行わない。
- この1組の結果は機能確認であり、幅広いプレイヤー向けの難度や楽しさを保証するものではない。

## 未確認
ブラウザ操作は環境のURLポリシーで拒否されたため中止。v3の実ブラウザ表示、手動プレイ、スマホ実機の同時タッチ、実測FPS、WebMCP登録は未確認。ブラウザ制限を別経路で回避していない。

## 参考
前版でMob Controlの公式ストアと公式プレイ映像、Last Warの公式ストアから、左右移動・増殖ゲート・群れとの戦闘を参考にした。既存作品の素材は使用していない。
- https://store.steampowered.com/app/2736490/Mob_Control/
- https://apps.apple.com/us/app/last-war-survival/id6448786147

## Continuous maze movement and two-column home (2026-09-27)
- Replaced 150 ms tile jumps with continuous positions, 120 Hz bounded simulation substeps, immediate release, and corridor turn assistance. Player/enemy DOM actors move with transforms; unchanged terrain is retained.
- Added D-pad pointer sliding, blast prediction, tenths-of-a-second fuse labels, enemy patrol/chase differences, and randomized vocabulary distractors.
- Home uses two equal responsive card columns, including narrow phones. No word-dependent imagery.
- `node test-maze-smooth.mjs`: identical movement distances at 30/60/120 Hz, immediate stop, corner entry, wall blocking, bomb escape, moving flame hit, enemy continuous positions, quiz freeze passed.
- `node test-arcade.mjs`, `node test-input.mjs`, `node test-memory.mjs`, `node test-bomb.mjs` passed.
- Browser preview was blocked by the browser URL policy in this environment. No real iPhone touch, visual layout, or on-device FPS verification is claimed. Browser testing was not bypassed.

## Party island home (2026-09-27)
- Rebuilt home as a two-column game selection screen, with six original 3D toy diorama menu images supplied by a single 1536×1024 sprite sheet. Menu imagery is decorative, not a claim of in-game 3D graphics.
- Full-card native buttons, distinct genre labels, top vocabulary preview/edit shortcut, explicit save, and a random selector restricted to compatible games. Invalid game-specific word sets no longer overwrite stored words before validation.
- Research: Nintendo official Jamboree site https://www.nintendo.com/jp/switch/a7hla/index.html (islands/genre-based presentation); W3C https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum/ (tap targets). These inform the design; no WCAG conformance claim.
- `node test-hub.mjs`: five routes, editing/saving, malformed input, insufficient distinct meanings, eligible random routing, storage denial, all asset paths pass in a Node DOM adapter.
- Asset inspected. Actual browser rendering, 200% text zoom, and iPhone touch checks remain unverified because the earlier preview browser URL policy block has not been bypassed.
- Further candidates, not yet implemented: beginner practice mode without a timer; a three-game party course with a shared result; common review of missed words across all games. Prioritize practice before more game modes.

## Pop game feedback + read-only wordbook import (2026-09-27)
- Five themed game palettes, original existing menu art reused in four introduction panels; brighter tank materials and multicolor world particles with turret recoil.
- Shared bounded decorative canvas: pair/combo stars, delivery bursts, bomb/maze explosions, tank upgrades/chain/area celebrations, result confetti. Pointer events disabled, 120 particle cap, 1.5 DPR cap, single animation loop, reduced-motion support and background cleanup. Game logic unchanged.
- Added local wordaso v1 JSON import with book and ID-range selection. All source repository operations were read-only. No private dataset or credentials copied into game. Automatic GitHub import remains unconnected, explicitly labelled in UI.
- PASS: test-party-fx, test-book-import, test-input, test-arcade, test-memory, test-bomb, test-maze-smooth, test-hub and test-world --journey. Unit/event adapters and engine simulations only.
- Real iPhone visuals, touch performance and FPS remain unverified; prior browser URL-policy block was not bypassed.

## Reward stars and connected private catalogue (2026-09-27)
- All five games award persistent cosmetic stars for verified successes; combo bonuses, stage/round awards, clear +50 and a home total. Per-run event keys prevent double awards. Tank streak resets on an incorrect gate.
- Owner-only Site has a pinned read-only catalogue snapshot: 10 books / 16,300 entries. Public GitHub updates explicitly exclude dist/private-wordbooks/. Source wordaso never written. Not live synchronization.
- All entries pass the expanded literal-preserving tab parser; Target1900 1–1900 checked. Existing English phrases/long meanings preserved. No claim of auditing book editions or translation correctness.
- Connected-catalogue, picker, import, reward FX, input, hub, arcade, memory, bomb and tank journey simulations pass. Actual phone/browser rendering remains unverified.
