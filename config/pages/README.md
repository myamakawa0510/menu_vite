# config/pages/ JSONファイル記述ルール

`config/pages/` 内のJSONファイルは、各HTMLページのメタ情報（`<title>`・`<meta>`・パンくずなど）を管理します。
Viteビルド時にHandlebarsテンプレートへ自動注入されます。

---

## ファイル構成

```
config/pages/
  _default.json     ← サイト共通のデフォルト値（直接編集する）
  index.json        ← /index.html 用
  about.json        ← /about.html 用
  news.json         ← /news.html 用
  ...               ← HTMLファイル1つにつき1JSONファイル
```

---

## 命名規則

| HTMLファイルのパス | 対応するJSONファイル |
|---|---|
| `src/index.html` | `config/pages/index.json` |
| `src/about.html` | `config/pages/about.json` |
| `src/news/index.html` | `config/pages/news/index.json` |

- **HTMLファイル名から `.html` を除き、`.json` を付ける**
- サブディレクトリのページはディレクトリ構造ごと作成する
- ファイル名が一致しないとメタ情報が適用されない

---

## `_default.json` — サイト共通設定

```json
{
    "siteName": "サイト名",
    "titleSeparator": " | ",
    "ogType": "website",
    "ogImage": "./assets/img/ogp.png"
}
```

| キー | 説明 |
|---|---|
| `siteName` | サイト名。`<title>` の末尾に付与される |
| `titleSeparator` | ページタイトルとサイト名の区切り文字 |
| `ogType` | OGPのtype属性。通常は `"website"` |
| `ogImage` | デフォルトのOGP画像パス |

---

## 各ページのJSONファイル — 使用可能なキー

```json
{
    "title": "ページタイトル",
    "description": "ページの説明文。検索結果に表示される。",
    "keywords": "",
    "ogType": "article",
    "ogImage": "./assets/img/ogp-about.png",
    "fvPage": "about",
    "fvSub": "ABOUT",
    "fvMain": "私たちについて",
    "breadcrumb": [
        { "text": "トップ", "href": "index.html" },
        { "text": "私たちについて" }
    ]
}
```

### キー一覧

| キー | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | string | 任意 | ページタイトル。`_default.json` の `siteName` と結合される。省略するとサイト名のみ表示。 |
| `description` | string | 任意 | metaのdescription。省略可（空文字でもOK）。 |
| `keywords` | string | 任意 | metaのkeywords。不要な場合は `""` を指定。 |
| `ogType` | string | 任意 | OGPのtype。省略すると `_default.json` の値を使用。 |
| `ogImage` | string | 任意 | OGP画像のパス。省略すると `_default.json` の値を使用。 |
| `fvPage` | string | 任意 | ファーストビューのページ識別子。FVがないページは省略。 |
| `fvSub` | string | 任意 | FVのサブテキスト（英字）。 |
| `fvMain` | string | 任意 | FVのメインテキスト（日本語）。 |
| `breadcrumb` | array | 任意 | パンくずリストの配列。トップページは省略。 |

### `title` の展開ルール

```
title が "お知らせ" の場合
→ <title>お知らせ | サイト名</title>

title が "" または省略の場合
→ <title>サイト名</title>
```

### `breadcrumb` の記述ルール

```json
"breadcrumb": [
    { "text": "トップ", "href": "index.html" },   // リンクあり（末端以外）
    { "text": "お知らせ" }                          // リンクなし（現在ページ）
]
```

- 配列の最後の要素には `href` を付けない（現在ページのため）
- トップページ（`index.json`）では `breadcrumb` を省略する

---

## ページ追加手順

1. `src/` に新しいHTMLファイルを作成する（例: `src/about.html`）
2. `config/pages/` に同名のJSONファイルを作成する（例: `config/pages/about.json`）
3. 以上。`vite.config.js` やその他のファイルの編集は不要。

---

## 最小構成の例（トップページ）

```json
{
    "title": "",
    "description": "サイトの説明文をここに記述します。",
    "keywords": ""
}
```

## フルセットの例（下層ページ）

```json
{
    "title": "お知らせ",
    "description": "最新のお知らせ・ニュース一覧です。",
    "keywords": "",
    "fvPage": "news",
    "fvSub": "NEWS",
    "fvMain": "お知らせ",
    "breadcrumb": [
        { "text": "トップ", "href": "index.html" },
        { "text": "お知らせ" }
    ]
}
```

---

## 注意事項

- JSONにはコメントが書けない。メモが必要な場合はコミットメッセージに記載する。
- `_default.json` はページ設定ファイルとして扱われない（自動スキップされる）。
- キーが存在しない場合は空文字 or `_default.json` の値にフォールバックする。明示的に `""` を書いても同じ結果になる。
