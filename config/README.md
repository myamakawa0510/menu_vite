# 設定ファイルについて

## 📁 config/paths.js

プロジェクト全体のパス設定を一元管理するファイルです。

### 使用箇所

このファイルは以下のファイルから参照されています：

- `vite.config.js` - Viteのビルド設定
- `plugins/vite-plugin-scss-index.js` - SCSS自動生成プラグイン
- `tools/postbuild-html.js` - HTML後処理スクリプト
- `tools/optimize-images.js` - 画像最適化スクリプト
- `tools/prepare-scss.js` - SCSS前処理スクリプト

### 設定項目

#### ディレクトリ

```javascript
src: 'src',     // ソースディレクトリ
dist: 'dist',   // 出力ディレクトリ
```

#### SCSS設定

```javascript
assets.scss.root: 'src/assets/scss',           // SCSSのルートディレクトリ
assets.scss.watchTargets: [...]                // _index.scss自動生成対象フォルダ
assets.scss.entry: 'style.scss',               // エントリーファイル
assets.scss.output: 'dist/assets/css/style.css' // 出力先
```

#### JavaScript設定

```javascript
assets.script.src: 'assets/script/**/*',  // コピー元
assets.script.dest: 'assets/js',          // コピー先
```

#### 画像設定

```javascript
assets.img.src: 'assets/img/*',              // コピー元
assets.img.dest: 'assets/img',               // コピー先
assets.img.distBase: 'dist/assets/img',      // 最適化対象のベースディレクトリ
assets.img.htmlPath: './assets/img/index/',  // HTMLでの画像パス
```

#### コピー用ファイル設定

そのままdistに配置するファイル（ライブラリのCSSや追加画像など）

```javascript
copy.css.src: 'copy/css/**/*',       // CSSファイルのコピー元
copy.css.dest: 'assets/css',          // コピー先（dist/assets/css/）
copy.image.src: 'copy/image/**/*',   // 画像ファイルのコピー元
copy.image.dest: 'assets/img',        // コピー先（dist/assets/img/）
```

#### HTML設定

```javascript
html.entry: 'index.html',             // HTMLファイル名
html.css.href: './css/style.css',     // CSSのパス
html.js.src: './script/script.js',    // JavaScriptのパス
```

#### 開発サーバー設定

```javascript
server.port: 5174,         // ポート番号
server.strictPort: true,   // ポートが使用中の場合エラーにする
server.open: true,         // ブラウザを自動で開く
```

## 🔧 パス変更方法

### 例：ソースディレクトリを変更する

```javascript
// before
src: 'src',

// after
src: 'source',
```

この変更だけで、すべての関連ファイルが自動的に新しいパスを使用します。

### 例：画像の出力先を変更する

```javascript
// before
assets.img.htmlPath: './assets/img/index/',

// after
assets.img.htmlPath: './assets/images/pages/',
```

### 例：SCSSの監視対象フォルダを追加する

```javascript
assets.scss.watchTargets: [
  'src/assets/scss/foundation',
  'src/assets/scss/layout',
  'src/assets/scss/object/component',
  'src/assets/scss/object/project',
  'src/assets/scss/object/utility',
  'src/assets/scss/vendor',  // 追加
],
```

## ⚠️ 注意事項

1. **相対パスと絶対パス**
   - `src`, `dist` は相対パス
   - その他のパスは基本的に `src/` からの相対パス

2. **package.json の build:scss スクリプト**
   - このスクリプトだけは直接パスを指定しているため、SCSSのパスを変更した場合は手動で修正が必要です
   - 該当箇所：`cd src/assets/scss && sass style.scss ...`

3. **依存関係**
   - すべての設定ファイルがこのファイルに依存しています
   - 変更時は必ずビルドテストを実行してください

## ✅ 変更後の確認方法

```bash
# 開発ビルド
npm run build

# 納品ビルド
npm run build:delivery

# 開発サーバー
npm run dev
```
