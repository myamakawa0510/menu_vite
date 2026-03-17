# Vite 静的サイト開発環境

Vite を使用した静的サイト（コーディング案件）向け開発環境テンプレートです。

## 目次

1. [プロジェクト構成](#プロジェクト構成)
2. [セットアップ](#セットアップ)
3. [コマンド一覧](#コマンド一覧)
4. [Git運用ルール](#git運用ルール)（チーム開発向け）
5. [機能](#機能)
6. [JavaScriptについて](#javascript)
7. [パス設定](#パス設定)
8. [ページ追加・メタ情報](#ページ追加方法)
9. [SCSS・注意事項](#scss-ファイル追加方法)
10. [変更履歴](#変更履歴)

---

## プロジェクト構成

```
project/
├─ src/                        # 開発ファイル
│   ├─ assets/
│   │   ├─ scss/               # SCSS ファイル（FLOCSS構成）
│   │   │   ├─ foundation/     # 変数・mixin・リセット
│   │   │   ├─ layout/         # レイアウト
│   │   │   ├─ object/         # component / project / utility
│   │   │   └─ style.scss      # エントリーポイント
│   │   ├─ js/                 # JavaScript ファイル
│   │   │   ├─ index.js        # 開発用エントリー（HMR用）
│   │   │   ├─ script.js       # 納品用メインスクリプト
│   │   │   └─ pages/          # ページ別JS（ビルド時に script.js に結合）
│   │   └─ img/                # 画像ファイル
│   ├─ copy/                   # そのままコピーするファイル
│   │   ├─ css/                # ライブラリCSS
│   │   └─ img/                # 圧縮済み画像
│   ├─ partials/               # Handlebars パーシャル
│   │   ├─ header.html
│   │   └─ footer.html
│   ├─ index.html              # HTMLファイル（複数可）
│   └─ guide.html
│
├─ dist/                       # ビルド出力（Git管理外）
│   ├─ assets/
│   │   ├─ css/style.css
│   │   ├─ js/
│   │   └─ img/
│   └─ index.html
│
├─ config/
│   ├─ paths.js                # パス設定（一元管理）
│   └─ pages/                  # ページごとのメタ情報（1ページ = 1ファイル）
│       ├─ _default.json       # 共通デフォルト設定
│       ├─ index.json
│       └─ guide.json          # ... 各ページ分
├─ plugins/
│   └─ vite-plugin-scss-index.js  # SCSS _index.scss 自動生成
├─ tools/
│   ├─ build-js-bundle.js      # ページ別JSを script.js に結合
│   ├─ postbuild-html.js       # HTML納品用変換
│   ├─ optimize-images.js      # 画像最適化
│   └─ prepare-scss.js         # SCSSビルド準備
│
├─ vite.config.js              # Vite 設定
├─ postcss.config.js           # PostCSS 設定
└─ package.json
```

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発環境の起動

```bash
npm run dev
```

- Vite 開発サーバーが `http://localhost:5174` で起動します
- HMR（Hot Module Replacement）が有効になり、変更が即座に反映されます
- Handlebars パーシャルの変更も自動リロードされます

### 3. 本番ビルド

```bash
npm run build
```

- `dist/` フォルダにクリーンな納品用ファイルが生成されます
- SCSS コンパイル・PostCSS 後、`tools/build-js-bundle.js` でページ別JS（`pages/*.js`）を `script.js` に結合します
- Viteのハッシュ付きパスが実際のパスに変換されます
- 開発用スクリプトが除去されます

### 4. 納品用ビルド（画像最適化込み）

```bash
npm run build:delivery
```

- 上記に加えて画像の圧縮・最適化が実行されます

---

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（HMR有効） |
| `npm run build` | 本番ビルド |
| `npm run build:delivery` | 納品用ビルド（画像最適化込み） |
| `npm run build:img` | 画像最適化のみ実行 |
| `npm run build:scss` | SCSSコンパイルのみ実行 |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLint実行 |

---

## Git運用ルール

チームで静的コーディングを行う際のルールです。**コンフリクトの削減・操作ミス防止・FTP事故防止**を目的とし、途中導入でも破綻しない運用を想定しています。

### 目的

- コンフリクトを減らす
- Git操作ミスを防ぐ
- FTPアップ事故を防ぐ
- 途中導入でも破綻しない運用にする

### ブランチ運用

| 項目 | ルール |
|------|--------|
| main への push | **禁止**（直接 push しない） |
| 作業ブランチ | 必ず `feature/ページ名` を作成して作業する |
| 作業完了後 | Pull Request を出す |
| マージ | **責任者のみ**が行う |
| セルフマージ | **禁止** |

**ブランチ名の例:** `feature/top` / `feature/about` / `feature/service`

### 作業の流れ（初心者用）

**作業開始前**

```bash
git checkout main
git pull origin main
git checkout -b feature/ページ名
```

**作業中**

```bash
git add .
git commit -m "作業内容"
```

**PR前（重要）**

1. **main の最新を取り込む**

```bash
git checkout main
git pull origin main
git checkout feature/ページ名
git merge main
```

2. **コンフリクトが出た場合**
   - **必ず止まる**（勝手に解決しない）
   - スクリーンショット ＋ 該当ファイルを共有
   - 解決方針を相談してから対応

3. 問題がなければ PR を作成する

### FTPアップ

- **main にマージされたら** FTP担当がアップする
- 必ず**最新の main を pull してから**アップする

```bash
git checkout main
git pull origin main
```

（この状態で FTP アップを行う）

### 担当範囲・共通部分

- 基本は**自分の担当ページのみ**触る（他ページは触らない）
- **パーシャル**（header / footer / layout など）を触る場合は **事前報告必須**
- **共通部分**を触る場合も **事前共有**
- **共通パーツを新規追加**する場合は事前共有し、追加後は「追加しました」と報告する

### 画像・JS・SCSSルール

| 種別 | ルール |
|------|--------|
| 画像（ページ専用） | `top_mv.jpg` / `top_news_01.jpg` / `about_message.jpg` など |
| 画像（共通） | `common_icon_arrow.svg` / `common_icon_tel.svg` など（今回はフォルダ分けなし） |
| JS | エントリ: `src/assets/js/index.js`、共通: `script.js`、ページ専用: `src/assets/js/pages/*.js`。**他人のページJSは触らない**。共通JSを触る場合は**事前共有** |
| SCSS | FLOCSS構成。`_index.scss` は**自動生成**（手動編集禁止）。**Git管理対象外**のため、コミット不要 |
| 共通パーツ | 番号管理（例: `.c-button01` / `.c-card01`）。新規追加時は事前共有 |

### index.scss（_index.scss）について

- **自動生成ファイル**で**手動編集禁止**
- `.gitignore` に追加済みのため、**コミット不要・コミット不可**
- `npm run dev` または `npm run build` 起動時に自動生成されます

### コンフリクトが起きにくい箇所（参考）

以下のファイルはコンフリクトが発生しません。

- `config/pages/*.json` — 1ページ = 1ファイルのため干渉しない
- `src/assets/scss/**/_index.scss` — Git管理外のため干渉しない

### コンフリクトが起きやすい箇所

以下のファイルは**触る前に共有**すること。

- `header.scss`（`_p-header.scss` 等）
- `footer.scss`（`_p-footer.scss` 等）
- `script.js`
- 同じ HTML ファイル

> **ページメタ情報について**: `config/pages/` は1ページ = 1JSONファイルの構成のため、**コンフリクトは発生しません。** 担当ページの JSON ファイルを作成するだけでOKです。

**ルール:** 触る前に共有する。コンフリクトが出たら**勝手に解決しない**。

### build物・納品

- `dist` フォルダは **.gitignore に含めており、Git 管理しない**
- 納品時は `npm run build:delivery` で生成する

### コミットメッセージ（簡易）

形式は厳密にしなくてOK。**「どのページの、どんな変更か」が分かれば**問題ありません。

**良い例**

```
top ページ MVセクション実装
about ページ SP余白調整
service ページ ボタンhover修正
header レイアウト調整
```

※ 第三者が見て内容が分かる書き方を心がける

---

## 機能

### HTML

- **Handlebars**: パーシャルによるヘッダー・フッター共通化
- **複数ページ対応**: `src/` にHTMLを追加するだけで自動認識
- **postbuild変換**: 全HTMLファイルを納品用に自動変換

### SCSS

- **FLOCSS構成**: foundation / layout / object で整理
- **_index.scss自動生成**: ファイル追加時に自動更新
- **loadPaths**: 相対パス不要で短い記述が可能
- **autoprefixer**: ベンダープレフィックス自動付与
- **メディアクエリ最適化**: 重複するメディアクエリを統合

### JavaScript

- **jQuery**: グローバルに利用可能
- **Swiper**: スライダーライブラリ
- **GSAP**: アニメーションライブラリ
- **modal-video**: 動画モーダルライブラリ
- **ページ別JS**: `src/assets/js/pages/*.js` に配置すると、本番ビルド時に `script.js` に自動結合されます（開発時は HMR で動的ロード）

#### index.js と script.js の役割（重要）

| ファイル | 開発環境 | 本番環境 |
|----------|----------|----------|
| `index.js` | 読み込まれる（Vite エントリ、HMR用） | **読み込まれない** |
| `script.js` | index.js 経由で読み込まれる | **唯一読み込まれる** |

- **アコーディオンやその他共通の JS 処理は必ず `script.js` に書くこと**
- `index.js` は開発・テスト環境でのみ動作し、本番ビルド後は HTML から参照されないため読み込まれません
- 本番で動かしたい機能はすべて `script.js` に記述してください

### 画像

- **静的コピー**: Viteバンドルを使わずそのままコピー
- **PNG**: Pngquant で圧縮
- **JPEG**: MozJPEG で圧縮
- **SVG**: SVGO で最適化
- **GIF**: Gifsicle で最適化
- **WebP**: 自動生成対応

---

## パス設定

`config/paths.js` でプロジェクト全体のパスを一元管理しています。

```javascript
// 主な設定項目
{
  src: 'src',           // ソースディレクトリ
  dist: 'dist',         // 出力ディレクトリ
  server: {
    port: 5174,         // 開発サーバーポート
  },
  assets: {
    scss: { ... },      // SCSS関連パス
    script: { ... },    // JS関連パス
    img: { ... },       // 画像関連パス
  }
}
```

---

## ページ追加方法

1. `src/` にHTMLファイルを追加（例: `about.html`）
2. パーシャルを使用する場合は `{{> header}}` などを記述
3. `config/pages/` に同名のJSONファイルを追加（例: `about.json`）
4. 以上。**他のファイルの編集は不要です。**

`npm run dev` / `npm run build` を実行すると、`config/pages/` 内の JSON ファイルが自動的に読み込まれます。

## ページメタ情報の設定

ページごとのメタ情報は `config/pages/` ディレクトリ内の JSON ファイルで管理します。
**1ページ = 1ファイル** の構成で、複数人が同時作業してもコンフリクトが起きません。

### ファイル構成

```
config/pages/
  _default.json     ← 全ページ共通のデフォルト設定（siteName など）
  index.json        ← /index.html のメタ情報
  about.json        ← /about.html のメタ情報（新規追加例）
  ...
```

### JSONファイルの書き方

**シンプルなページ（FV・パンくずなし）:**

```json
{
    "title": "会社概要 | サイト名",
    "description": "ページの説明文です。",
    "keywords": ""
}
```

**FV・パンくずありのページ:**

```json
{
    "title": "会社概要 | サイト名",
    "description": "ページの説明文です。",
    "keywords": "",
    "fvPage": "about",
    "fvSub": "ABOUT",
    "fvMain": "会社概要",
    "breadcrumb": [
        { "text": "トップ", "href": "index.html" },
        { "text": "会社概要" }
    ]
}
```

### `_default.json` について

全ページ共通のデフォルト値を設定します。**ページ追加時に編集する必要はありません。**

```json
{
    "siteName": "",
    "titleSeparator": "",
    "ogType": "website",
    "ogImage": "./assets/img/ogp.png"
}
```

> **注意**: JSONファイル内ではコメントは使えません。メモはコミットメッセージに記載してください。

### 利用可能な変数

パーシャル内で以下の変数が使用できます:

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{title}}` | ページタイトル + サイト名 | `トップページ \| サイト名` |
| `{{pageTitle}}` | ページタイトルのみ | `トップページ` |
| `{{description}}` | メタディスクリプション | |
| `{{keywords}}` | メタキーワード | |
| `{{siteName}}` | サイト名 | |
| `{{ogType}}` | OGPタイプ | `website` |
| `{{ogImage}}` | OGP画像パス | |

### HTMLでの使用例

```html
<head>
    <title>{{title}}</title>
    <meta name="description" content="{{description}}">
    <meta name="keywords" content="{{keywords}}">
    <meta property="og:title" content="{{title}}">
    <meta property="og:description" content="{{description}}">
    <meta property="og:image" content="{{ogImage}}">
</head>
```

---

## SCSS ファイル追加方法

1. 対象フォルダに `_*.scss` ファイルを追加
2. `_index.scss` が自動更新されます（手動編集不要・コミット不要）

> **注意**: `_index.scss` は `.gitignore` に追加済みのため、git には追跡されません。`npm run dev` / `npm run build` 実行時に自動生成されます。

対象フォルダ:
- `src/assets/scss/foundation/`
- `src/assets/scss/layout/`
- `src/assets/scss/object/component/`
- `src/assets/scss/object/project/`
- `src/assets/scss/object/utility/`

---

## 注意事項

### 開発時

- `{{#if isDev}}` で開発時のみ表示するコンテンツを制御可能
- SCSSの変更は即座に反映されます

### 本番ビルド

- `dist/` 内のファイルは納品可能な状態です
- CDN経由のライブラリはそのまま残ります
- ローカルのCSS/JSは納品用パスに変換されます

---

## ライセンス

このプロジェクトは開発環境のテンプレートです。自由に使用してください。

---

## 変更履歴

### 2026-03-13

#### 1. ページメタ情報の管理方式を変更

これまで `config/pages.js` に全ページのメタ情報を一元管理していた。
複数人が同時にページを追加すると全員が同じファイルを編集することになり、
Git コンフリクトの原因となっていた。

そのため `config/pages/` に **1ページ = 1JSONファイル** の構成に変更。
担当ページの JSON を追加するだけでよくなり、他のページと干渉しなくなった。

- `config/pages.js` → 削除（`.gitignore` に追加）
- `config/pages/_default.json` → 新規作成（共通デフォルト設定）
- `config/pages/*.json` → 新規作成（各ページのメタ情報）
- `vite.config.js` → `buildPagesConfig()` / `vitePluginPagesConfig` を追加

---

#### 2. `_index.scss` を Git 管理対象外に変更

`_index.scss` は `vite-plugin-scss-index` によって
`npm run dev` / `npm run build` 起動時に自動生成されるファイル。

複数人が SCSS ファイルを追加・削除するたびに内容が変わり、
Git コンフリクトの原因となっていた。

そのため `.gitignore` に追加し、Git 管理対象外に変更。
起動時に自動生成されるため、手動管理・コミットは不要。

- `.gitignore` → `watchTargets` 対応の5ファイルを個別に追加
  （`src/assets/scss/object/_index.scss` は手動管理のため対象外）

---

#### 3. JSON追加・削除の開発サーバーへの即時反映

これまで `handleHotUpdate` では **ファイル内容の変更** のみ検知していた。

そのため開発サーバー起動中に

- JSON を新規作成
- JSON を削除

しても `pagesConfig` が更新されず、**Vite の再起動が必要**だった。

`configureServer` を追加し `watcher.on('add')` / `watcher.on('unlink')` を監視することで、
JSON の追加・削除も開発サーバーへ即時反映されるよう改善。

- `vite.config.js` → `vitePluginPagesConfig` に `configureServer` を追加
