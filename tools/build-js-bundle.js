import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const distJsDir = path.resolve('dist/assets/js');
const mainFile = path.join(distJsDir, 'script.js');
const pagesDir = path.join(distJsDir, 'pages');

// script.js 本体を読み込む
let bundle = fs.readFileSync(mainFile, 'utf-8');

// pages/*.js を存在すれば結合（アルファベット順で安定）
const pageFiles = glob.sync(`${pagesDir}/*.js`.replace(/\\/g, '/'));

pageFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) return; // 空ファイルはスキップ
    const pageName = path.basename(filePath);
    bundle += `\n\n/* === pages/${pageName} === */\n`;
    bundle += content;
});

// script.js に書き戻す
fs.writeFileSync(mainFile, bundle, 'utf-8');
console.log(`✅ build-js-bundle: ${pageFiles.length} 件のページJSを結合しました`);

// dist の pages/ ディレクトリを削除（本番環境に残さない）
if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true });
    console.log('✅ build-js-bundle: dist/assets/js/pages/ を削除しました');
}
