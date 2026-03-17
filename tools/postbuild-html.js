import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import paths from '../config/paths.js';

const distDir = path.resolve(paths.dist);

// dist内の全HTMLファイルを取得
const htmlFiles = glob.sync(path.join(distDir, '**/*.html').replace(/\\/g, '/'));

if (htmlFiles.length === 0) {
    console.error('❌ dist/ 内にHTMLファイルが見つかりません');
    process.exit(1);
}

/* =====================
 * 画像マップを作成（全HTMLで共通使用）
 * ===================== */
// dist/assets/img 配下の全画像ファイルを取得してマップを作成
const imgDir = path.join(distDir, paths.assets.img.dest).replace(/\\/g, '/');
// glob用の拡張子リスト（正規表現を除外し、実際の拡張子のみ）
const globExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'avif'];
const globPattern = `${imgDir}/**/*.{${globExtensions.join(',')}}`;
const imageFiles = glob.sync(globPattern, {
    nocase: true
});

// ファイル名（拡張子込み） → 相対パスのマップを作成
const imageMap = {};
imageFiles.forEach(filePath => {
    const filenameWithExt = path.basename(filePath);
    const relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');
    imageMap[filenameWithExt.toLowerCase()] = `/${relativePath}`;
});

// 画像拡張子のパターンを設定ファイルから動的に生成
const imageExtPattern = paths.imageExtensions.join('|');
// Viteのアセットディレクトリ名を正規表現用にエスケープ
const escapedAssetsDir = paths.viteAssetsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Viteが生成する ./{viteAssetsDir}/filename.ext または ./{viteAssetsDir}/filename-HASH.ext のパスを実際のパスに変換
const assetHashPattern = new RegExp(
    `\\.\\/` + escapedAssetsDir + `\\/([^"'\\s/]+?)(-[a-zA-Z0-9]{8,})?\\.(${imageExtPattern})`,
    'gi'
);

// 納品用タグ
const cssTag = `<link rel="stylesheet" href="${paths.html.css.href}">`;
const jsTag = `<script src="${paths.jsPath}"></script>`;

/* =====================
 * 各HTMLファイルを処理
 * ===================== */
htmlFiles.forEach(htmlPath => {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const relativePath = path.relative(distDir, htmlPath);

    /* =====================
     * 1. dev用 module script を削除
     * ===================== */
    html = html.replace(
        /<script\s+type="module"[\s\S]*?<\/script>\s*/g,
        ''
    );

    /* =====================
     * 2. Vite生成のローカル CSS link を削除
     * ===================== */
    // CDN（http/https）のCSSは保持し、ローカルのCSSのみ削除
    html = html.replace(
        /<link\s+rel="stylesheet"(?![^>]*https?:\/\/)[\s\S]*?>\s*/g,
        ''
    );

    /* =====================
     * 3. 納品用 CSS を head に追加
     *    - copy/css のライブラリCSS（swiper, modal-video 等）
     *    - メインの style.css
     * ===================== */
    const copyCssDir = path.join(distDir, paths.copy.css.dest).replace(/\\/g, '/');
    const copyCssFiles = glob.sync(`${copyCssDir}/**/*.css`);
    // メインCSSファイル（style.css）はcssTagで別途追加するため除外
    const mainCssBasename = path.basename(paths.html.css.href);
    const libCssTags = copyCssFiles
        .filter(f => path.basename(f) !== mainCssBasename)
        .map(f => {
            const rel = path.relative(distDir, f).replace(/\\/g, '/');
            return `  <link rel="stylesheet" href="/${rel}">`;
        })
        .join('\n');
    const allCssTags = libCssTags ? `${libCssTags}\n  ${cssTag}` : `  ${cssTag}`;
    html = html.replace('</head>', `${allCssTags}\n</head>`);

    /* =====================
     * 4. 画像パスを修正（Viteが生成したハッシュを削除し、実際のパスに変換）
     * ===================== */
    html = html.replace(assetHashPattern, (match, filename, hash, ext) => {
        // imageMapから実際のパスを取得（ファイル名+拡張子で検索）
        const key = `${filename}.${ext}`.toLowerCase();
        if (imageMap[key]) {
            return imageMap[key];
        }
        // マップになければ、デフォルトのパスを返す
        console.warn(`⚠️  [${relativePath}] 画像ファイルが見つかりません: ${filename}.${ext}`);
        return `${paths.assets.img.htmlPath}${filename}.${ext}`;
    });

    /* =====================
     * 5. 納品用 JS を body 終端に追加
     * ===================== */
    // コメントアウトされた script タグを削除
    html = html.replace(/<!--\s*<script[^>]*><\/script>\s*-->/g, '');

    // すでにあれば追加しない（defer付きも含めてチェック）
    const jsFileName = paths.jsPath.replace('./', '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const jsAlreadyExists = new RegExp(`<script[^>]*src=["'][^"']*${jsFileName}["']`).test(html);
    if (!jsAlreadyExists) {
        html = html.replace('</body>', `  ${jsTag}\n</body>`);
    }

    /* =====================
     * 6. 書き戻し
     * ===================== */
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✅ postbuild-html: ${relativePath} を納品用に変換しました`);
});

console.log(`\n📄 合計 ${htmlFiles.length} 件のHTMLファイルを処理しました`);
