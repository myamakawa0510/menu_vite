/**
 * プロジェクト全体のパス設定
 * このファイルでパスを一元管理します
 */

export default {
    // =====================================
    // ソース・出力ディレクトリ
    // =====================================
    src: 'src',
    dist: 'dist',

    // =====================================
    // アセットファイル設定
    // =====================================
    // Viteがビルド時に使用するアセットディレクトリ名
    // ⚠️ この値を変更する場合は、vite.config.js の assetsDir も同じ値に設定してください
    viteAssetsDir: 'assets',

    // 画像ファイルの拡張子リスト
    imageExtensions: ['png', 'jpe?g', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'avif'],

    // =====================================
    // アセット関連
    // =====================================
    assets: {
        // SCSS
        scss: {
            root: 'src/assets/scss',
            // SCSS _index.scss 自動生成対象フォルダ
            watchTargets: [
                'src/assets/scss/foundation',
                'src/assets/scss/layout',
                'src/assets/scss/object/component',
                'src/assets/scss/object/project',
                'src/assets/scss/object/utility',
            ],
            // Sassコンパイル設定
            entry: 'style.scss',
            output: 'dist/assets/css/style.css',
        },

        // JavaScript
        script: {
            src: 'assets/js/**/*',
            dest: 'assets/js',
            // HTMLで読み込むメインJSファイル名（拡張子なし）
            mainFile: 'script',
        },

        // 画像
        img: {
            src: 'assets/img/*',
            dest: 'assets/img',
            // HTMLでの画像パス（出力先）
            htmlPath: '/assets/img/',
        },

        // フォント
        font: {
            src: 'copy/font/**/*',
            dest: 'assets/font',
        },
    },

    // =====================================
    // コピー用ファイル（そのまま配置）
    // =====================================
    copy: {
        // CSS（ライブラリなどそのまま配置するファイル）
        css: {
            src: 'copy/css/**/*',
            dest: 'assets/css',
        },
        // 画像（そのまま配置する画像）
        img: {
            src: 'copy/img/**/*',
            dest: 'assets/img',
        },
    },

    // =====================================
    // HTML関連
    // =====================================
    html: {
        entry: 'index.html',
        css: {
            href: '/assets/css/style.css',
        },
        // js.srcは動的に生成されます（get jsPath() 参照）
    },

    // HTMLで参照するJSパスを動的に取得
    get jsPath() {
        // assets.script.dest から HTMLパスを生成（例: 'assets/js' → './assets/js/script.js'）
        return `/${this.assets.script.dest}/${this.assets.script.mainFile}.js`;
    },

    // =====================================
    // 開発サーバー
    // =====================================
    server: {
        port: 5174,
        strictPort: true,
        open: true,
    },
};