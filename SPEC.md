# 仕様書: 10まであといくつ？

## 概要

子ども向けの算数学習アプリ。1〜9 の数字を提示し「10 になるにはあといくつ必要か」を答えさせる インタラクティブなゲームアプリ。

- **本番 URL:** https://how-many-more-to-10.vercel.app
- **対象:** 10 の補数（10 の合成・分解）を学ぶ幼児〜低学年

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 15.5.9（App Router） |
| UI ライブラリ | React 19.1.0 |
| 言語 | TypeScript 5.x |
| スタイリング | Tailwind CSS 4.x + CSS Modules |
| アニメーション | Framer Motion 12.23.22 |
| バンドラー | Turbopack |
| フォント | Geist Sans / Geist Mono（next/font/google） |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
how-many-more-to-10/
├── app/
│   ├── layout.tsx        # ルートレイアウト（メタデータ・フォント設定）
│   ├── page.tsx          # メインゲーム画面（クライアントコンポーネント）
│   ├── Home.module.css   # コンポーネントスコープ CSS
│   ├── globals.css       # グローバルスタイル（Tailwind + CSS 変数）
│   └── favicon.ico
├── public/
│   ├── apple-touch-icon.png
│   ├── icon.png          # PWA アイコン（192×192）
│   ├── og-image.png      # OGP 画像
│   └── favicon.ico
├── next.config.ts        # Next.js 設定（最小構成）
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## ゲームモード

### ノーマルモード

タイム計測なし。問題を解くことに集中するモード。

### タイムアタックモード

全 9 問を解くまでの所要時間を計測するモード。

- 計測開始：最初の問題が表示された瞬間（モード選択後にゲームが始まった時点）
- 計測終了：最後の問題（9 問目）に正解し、ゲームオーバー画面に遷移した時点
- タイムの表示：**問題を解いている間は表示しない**。ゲームオーバー画面にのみ「〇〇秒」で表示する。
- 計測単位：秒（小数点以下も表示する、例：「12.3秒」）

---

## 画面構成

### ルートレイアウト（`app/layout.tsx`）

- サーバーコンポーネント
- `<html>` / `<body>` と Google Fonts を設定
- Next.js Metadata API でタイトル・OGP・Twitter Card を定義

### モード選択画面（ゲーム開始前）

ゲーム起動時に最初に表示される画面。

| 要素 | 内容 |
|------|------|
| タイトル | 「10まであといくつ？」 |
| ノーマルモードボタン | 選択するとノーマルモードでゲーム開始 |
| タイムアタックモードボタン | 選択するとタイムアタックモードでゲーム開始 |

### メインゲーム画面（`app/page.tsx`）

`'use client'` ディレクティブを持つクライアントコンポーネント。以下の UI 領域で構成される。

| 領域 | 内容 |
|------|------|
| ヘッダー | タイトル「10まであといくつ？」（H1） |
| 問題エリア | 大きなフォントで問題の数字を表示 |
| 視覚フィードバック | 問題数字分の丸 ＋ 正解時に追加の丸をアニメーション表示 |
| 回答ボタン | 1〜9 の 3×3 グリッドボタン |
| 正解メッセージ | 「せいかい！」と次の問題ボタン |
| ゲームオーバー | 全問終了メッセージ、タイムアタック時はタイム表示、リセットボタン |

---

## ゲームロジック

### ゲームフロー

```
起動
  ↓
モード選択画面（ノーマル or タイムアタック）
  ↓ モード選択
startNewGame() で 1〜9 からランダムに未使用の数字を選択
タイムアタック時: 計測開始（startTime を記録）
  ↓
問題を表示（questionNumber）
※ タイムアタック時もタイムは画面に表示しない
  ↓
ユーザーが回答ボタンを押す（handleAnswerClick）
  ↓ questionNumber + answer === 10 ?
正解 → isCorrect = true → 「せいかい！」表示 → 次へボタン
不正解 → wrongAnswers に追記 → そのボタンを無効化（❌ 表示）
  ↓ 次へボタン押下
9 問すべて終了 → タイムアタック時: 計測終了（elapsed を計算） → isGameOver = true
まだ残りあり → 新しい問題へ
  ↓ ゲームオーバー画面
ノーマル: 全問終了メッセージ + リセットボタン
タイムアタック: 全問終了メッセージ + かかった秒数 + リセットボタン
  ↓ リセットボタン
handleReset() → 全ステートを初期化 → モード選択画面に戻る
```

### 状態変数

| 変数 | 型 | 説明 |
|------|----|------|
| `mode` | `'normal' \| 'timeattack' \| null` | 選択中のゲームモード。null はモード未選択（選択画面表示） |
| `questionNumber` | `number \| null` | 現在の問題の数字（1〜9） |
| `usedNumbers` | `number[]` | すでに出題した数字の記録 |
| `wrongAnswers` | `number[]` | 現在の問題で選んだ不正解 |
| `isCorrect` | `boolean` | 正解フラグ |
| `isGameOver` | `boolean` | 全問終了フラグ |
| `startTime` | `number \| null` | タイムアタック時のゲーム開始時刻（`Date.now()` の値） |
| `elapsedTime` | `number \| null` | タイムアタック時の所要時間（ミリ秒）。ゲームオーバー時に確定 |

### ゲームルール

- 問題は 1〜9 の 9 問構成。各数字は 1 回だけ出題される。
- 正解は「10 − questionNumber」の 1 つのみ。
- 不正解を選んでもゲーム続行（そのボタンが無効化される）。
- 正解後は「次へ」ボタンを押すまで次の問題に進まない。

---

## スタイル・アニメーション

- スタイルは `Home.module.css`（CSS Modules）で管理
- Tailwind CSS はグローバルスタイルの補助的な用途
- Framer Motion の `motion` コンポーネントで以下のアニメーションを実装
  - 正解時の追加丸のフェードイン・スケールアニメーション
  - 正解メッセージのスライドイン
- コンテナ最大幅 600px、モバイルファーストのレイアウト

---

## SEO / メタデータ

`app/layout.tsx` の Metadata API で設定。

| 項目 | 値 |
|------|----|
| title | 10まであといくつ？ |
| description | 10の補数を楽しく学ぼう |
| keywords | 算数, 10の補数, 子供向け, 学習 |
| OGP / Twitter Card | og-image.png を使用 |
| theme-color | ブラウザ UI の色指定あり |

---

## 設定ファイル

### tsconfig.json

- target: ES2017
- strict: true
- moduleResolution: bundler
- パスエイリアス: `@/*` → プロジェクトルート

### package.json スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | Turbopack で開発サーバー起動 |
| `npm run build` | Turbopack で本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## 制約・特記事項

- バックエンド / API ルートなし。完全クライアントサイドのみ。
- ネットワークリクエストは初回ページロード時の静的アセット取得のみ。
- React の非同期ステート更新に起因するリセット処理の考慮あり（コメントで明記）。
- 全 UI テキストは日本語。
