import {
    defineConfig
} from 'vite';
import {
    resolve,
    dirname
} from 'path';
import {
    readFileSync,
    writeFileSync,
    readdirSync,
    statSync,
} from 'node:fs';
import {
    fileURLToPath
} from 'node:url';
import {
    viteStaticCopy
} from 'vite-plugin-static-copy';
import handlebars from 'vite-plugin-handlebars';
import {
    glob
} from 'glob';

// SCSS index 自動生成
import {
    vitePluginScssIndex
} from './plugins/vite-plugin-scss-index.js';

// 共通設定
import paths from './config/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// config/pages/**/*.json からページ設定をインメモリで構築
function buildPagesConfig() {
    const pagesDir = resolve(__dirname, 'config/pages');
    const defaultConfig = JSON.parse(
        readFileSync(resolve(pagesDir, '_default.json'), 'utf-8')
    );
    const pageFiles = glob.sync('**/*.json', {
        cwd: pagesDir,
        ignore: ['_default.json']
    });
    const pages = {};
    for (const file of pageFiles) {
        const config = JSON.parse(readFileSync(resolve(pagesDir, file), 'utf-8'));
        const pageName = '/' + file.replace(/\\/g, '/').replace(/\.json$/, '.html');
        pages[pageName] = config;
    }
    return {
        default: defaultConfig,
        pages,
        getPageMeta(pagePath) {
            const pageData = this.pages[pagePath] || this.pages['/index.html'];
            const defaults = this.default;
            return {
                title: pageData.title
                    ? `${pageData.title}${defaults.titleSeparator}${defaults.siteName}`
                    : defaults.siteName,
                pageTitle: pageData.title || '',
                description: pageData.description || '',
                keywords: pageData.keywords || '',
                ogType: pageData.ogType || defaults.ogType,
                ogImage: pageData.ogImage || defaults.ogImage,
                siteName: defaults.siteName,
                fvPage: pageData.fvPage || '',
                fvSub: pageData.fvSub || '',
                fvMain: pageData.fvMain || '',
                breadcrumb: pageData.breadcrumb || [],
            };
        },
    };
}

let pagesConfig = buildPagesConfig();

// config/pages/*.json の変更を監視してインメモリ設定を再構築
function vitePluginPagesConfig() {
    return {
        name: 'vite-plugin-pages-config',
        // ファイルの内容変更を検知
        handleHotUpdate({ file, server }) {
            if (file.includes('config/pages/') && file.endsWith('.json')) {
                pagesConfig = buildPagesConfig();
                server.ws.send({ type: 'full-reload', path: '*' });
                return [];
            }
        },
        // ファイルの追加・削除を検知
        configureServer(server) {
            const onAddOrUnlink = (filePath) => {
                const normalized = filePath.replace(/\\/g, '/');
                if (normalized.includes('config/pages/') && normalized.endsWith('.json')) {
                    pagesConfig = buildPagesConfig();
                    server.ws.send({ type: 'full-reload', path: '*' });
                }
            };
            server.watcher.on('add', onAddOrUnlink);
            server.watcher.on('unlink', onAddOrUnlink);
        },
    };
}

// HTMLファイルを自動検出（partialsを除外）
function getHtmlInputs() {
    const htmlFiles = glob.sync('src/**/*.html', {
        ignore: ['src/partials/**/*.html']
    });

    const inputs = {};
    htmlFiles.forEach(file => {
        const name = file.replace(/\\/g, '/').replace(/^src\//, '').replace(/\.html$/, '');
        inputs[name] = resolve(file);
    });

    return inputs;
}

// Handlebars partials の変更を監視してHMRをトリガー
function vitePluginHandlebarsReload() {
    return {
        name: 'vite-plugin-handlebars-reload',
        handleHotUpdate({ file, server }) {
            if (file.includes('src/partials') || file.endsWith('.html')) {
                server.ws.send({
                    type: 'full-reload',
                    path: '*'
                });
                return [];
            }
        }
    };
}

// Viteが削除する静的CSS linkタグのリスト（closeBundle で復元する）
const staticCssLinks = [
    '/assets/css/swiper-bundle.min.css',
    '/assets/css/modal-video.min.css',
];

// 静的コピー方式のため、Viteバンドルを使用しないプラグイン
function vitePluginStaticCopyOnly() {
    return {
        name: 'vite-plugin-static-copy-only',
        enforce: 'post',
        generateBundle(options, bundle) {
            for (const [fileName, asset] of Object.entries(bundle)) {
                if (asset.type === 'asset') {
                    if (/\.(png|jpe?g|gif|svg|webp|mp4)$/i.test(fileName)) {
                        delete bundle[fileName];
                    }
                    if (/\.css$/i.test(fileName)) {
                        delete bundle[fileName];
                    }
                }
                if (asset.type === 'chunk') {
                    delete bundle[fileName];
                }
            }
        },
        closeBundle() {
            const distDir = resolve(__dirname, paths.dist);
            fixHtmlFiles(distDir);
        },
    };
}

// dist内の全HTMLファイルを再帰的に取得
function collectHtmlFiles(dir) {
    let results = [];
    for (const entry of readdirSync(dir)) {
        const fullPath = resolve(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            results = results.concat(collectHtmlFiles(fullPath));
        } else if (/\.html$/i.test(entry)) {
            results.push(fullPath);
        }
    }
    return results;
}

// ビルド後のHTMLファイルのパスを修正
function fixHtmlFiles(distDir) {
    const cssLinksHtml = staticCssLinks
        .map(href => `    <link rel="stylesheet" href="${href}">`)
        .join('\n');

    for (const filePath of collectHtmlFiles(distDir)) {
        let html = readFileSync(filePath, 'utf-8');

        // Viteが注入した相対パス(./assets/)をルート相対(/)に修正
        html = html.replace(
            /(?:src|href)="\.\/assets\//g,
            (match) => match.replace('./assets/', '/assets/')
        );

        // Viteが注入したCSS linkタグを除去（静的コピーのCSSと競合するため）
        html = html.replace(
            /\s*<link rel="stylesheet"[^>]*crossorigin[^>]*href="\/assets\/[^"]*\.css"[^>]*>\s*/g,
            '\n'
        );

        // Viteが削除した静的CSS linkタグを復元（<!-- css --> コメントの後に挿入）
        html = html.replace(
            /<!-- css -->\s*/,
            `<!-- css -->\n${cssLinksHtml}\n    `
        );

        writeFileSync(filePath, html, 'utf-8');
    }
}

// SCSSの@use相対パスをloadPathsで解決できるように変換
function vitePluginScssPathTransform() {
    return {
        name: 'vite-plugin-scss-path-transform',
        enforce: 'pre',
        transform(code, id) {
            // SCSSファイルのみ処理
            if (id.endsWith('.scss')) {
                // @use "./ を @use " に変換
                const transformed = code.replace(/@use\s+"\.\//g, '@use "');
                return {
                    code: transformed,
                    map: null
                };
            }
        }
    };
}

export default defineConfig(({
    command
}) => {
    const isBuild = command === 'build';

    return {
        /* =====================
         * 基本
         * ===================== */
        root: paths.src,
        base: '/',
        publicDir: false,

        /* =====================
         * dev
         * ===================== */
        server: paths.server,

        /* =====================
         * build
         * ===================== */
        build: {
            outDir: `../${paths.dist}`,
            emptyOutDir: true,
            // アセットディレクトリ名を設定ファイルから参照
            assetsDir: paths.viteAssetsDir,

            // 👉 buildではCSSを最小限に
            cssCodeSplit: false,
            assetsInlineLimit: 0,

            // アセットファイル名のハッシュを無効化
            rollupOptions: {
                input: getHtmlInputs(),
                output: {
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.name || '';
                        if (/\.(png|jpe?g|gif|svg|webp|mp4|avif)$/i.test(name)) {
                            return `${paths.viteAssetsDir}/img/[name][extname]`;
                        }
                        return `${paths.viteAssetsDir}/[name][extname]`;
                    },
                },
            },
        },

        /* =====================
         * css / scss
         * ===================== */
        css: {
            devSourcemap: !isBuild,
            preprocessorOptions: {
                scss: {
                    loadPaths: [resolve(__dirname, paths.assets.scss.root)],
                },
            },
        },

        /* =====================
         * plugins
         * ===================== */
        plugins: [
            // config/pages/*.json の変更を監視
            vitePluginPagesConfig(),

            // Handlebars（partials のみ使用）
            handlebars({
                partialDirectory: resolve(__dirname, 'src/partials'),
                reloadOnPartialChange: true,
                context(pagePath) {
                    const pageMeta = pagesConfig.getPageMeta(pagePath);
                    return {
                        isDev: !isBuild,
                        ...pageMeta,
                    };
                },
            }),

            // Handlebars partials/HTML の変更を監視してリロード
            vitePluginHandlebarsReload(),

            // SCSS相対パス変換（開発時・ビルド時共通）
            vitePluginScssPathTransform(),

            // SCSS _index.scss 自動生成（dev/build両方で動作）
            vitePluginScssIndex({
                scssDir: paths.assets.scss.root,
            }),

            // 納品用：静的ファイルコピー
            isBuild &&
            viteStaticCopy({
                silent: true,
                targets: [
                {
                    // 開発専用ファイル（index.js）を除外してコピー
                    src: [paths.assets.script.src, '!**/index.js'],
                    dest: paths.assets.script.dest,
                },
                {
                    src: paths.assets.img.src,
                    dest: paths.assets.img.dest,
                },
                {
                    src: paths.copy.css.src,
                    dest: paths.copy.css.dest,
                },
                {
                    src: paths.copy.img.src,
                    dest: paths.copy.img.dest,
                },
                {
                    src: paths.assets.font.src,
                    dest: paths.assets.font.dest,
                }, ].filter(Boolean),
            }),

            // 静的コピー方式のため、Viteバンドルを使用しない
            isBuild && vitePluginStaticCopyOnly(),
        ].filter(Boolean),
    };
});