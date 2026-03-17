import fs from 'fs';
import path from 'path';
import paths from '../config/paths.js';

// 監視対象のフォルダ（設定ファイルから取得）
const watchTargets = paths.assets.scss.watchTargets;

/**
 * 指定フォルダ内の_index.scssを自動生成
 */
function generateIndexScss(rootDir, folderPath) {
    const absolutePath = path.resolve(rootDir, folderPath);
    const indexPath = path.join(absolutePath, '_index.scss');

    // フォルダ内の_*.scssファイルを取得（_index.scss以外）
    const files = fs
        .readdirSync(absolutePath)
        .filter((file) => {
            return (
                file.startsWith('_') &&
                file.endsWith('.scss') &&
                file !== '_index.scss'
            );
        })
        .map((file) => file.replace(/^_/, '').replace(/\.scss$/, ''))
        .sort();

    // _index.scssの内容を生成
    const content = files.map((name) => `@forward "${name}";`).join('\n') + '\n';

    // 現在の内容と比較して変更があれば書き込み
    let currentContent = '';
    if (fs.existsSync(indexPath)) {
        currentContent = fs.readFileSync(indexPath, 'utf-8');
    }

    if (currentContent !== content) {
        fs.writeFileSync(indexPath, content, 'utf-8');
        console.log(`✅ 更新: ${folderPath}/_index.scss`);
        return true;
    }
    return false;
}

/**
 * 全ての_index.scssを生成
 */
function generateAllIndexFiles(rootDir) {
    console.log('📁 全ての_index.scssを確認中...');
    let updated = 0;

    watchTargets.forEach((target) => {
        if (generateIndexScss(rootDir, target)) {
            updated++;
        }
    });

    if (updated === 0) {
        console.log('✨ 全ての_index.scssは最新の状態です');
    } else {
        console.log(`📝 ${updated}件の_index.scssを更新しました`);
    }
}

/**
 * ファイルパスからフォルダパスを特定
 */
function getFolderFromPath(rootDir, filePath) {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

    for (const target of watchTargets) {
        if (relativePath.startsWith(target + '/')) {
            return target;
        }
    }
    return null;
}

/**
 * Viteプラグイン: SCSSファイルの追加・削除に応じて_index.scssを自動更新
 */
export function vitePluginScssIndex() {
    let rootDir;
    let isInitialized = false;

    return {
        name: 'vite-plugin-scss-index',

        // Vite設定解決時に呼ばれる
        configResolved(config) {
            // config.rootは絶対パスに解決済み（例: C:/project/src）
            // その親ディレクトリを取得（例: C:/project）
            rootDir = path.resolve(config.root, '..');
            console.log(`[vite-plugin-scss-index] rootDir: ${rootDir}`);
        },

        // ビルド開始時（dev/build 両方で呼ばれる）
        buildStart() {
            if (!isInitialized) {
                console.log('[vite-plugin-scss-index] buildStart: 初回生成を実行します');
                generateAllIndexFiles(rootDir);
                isInitialized = true;
            }
        },

        // 開発サーバー起動時にファイル監視を開始
        configureServer(server) {
            // 開発サーバー起動時にも初回生成を確認
            if (!isInitialized) {
                console.log('[vite-plugin-scss-index] configureServer: 初回生成を実行します');
                generateAllIndexFiles(rootDir);
                isInitialized = true;
            }

            console.log('[vite-plugin-scss-index] 👀 Vite watcherでSCSSファイルの追加・削除を監視中...\n');

            // Viteの組み込みwatcherを使用して監視
            server.watcher.on('add', (filePath) => {
                // 監視対象のフォルダ内の_*.scssファイルのみ処理
                const folder = getFolderFromPath(rootDir, filePath);
                if (!folder) return;

                const fileName = path.basename(filePath);
                // _index.scss以外の_で始まる.scssファイル
                if (!fileName.startsWith('_') || !fileName.endsWith('.scss') || fileName === '_index.scss') {
                    return;
                }

                console.log(`[vite-plugin-scss-index] ➕ 追加: ${fileName} (${folder})`);
                if (generateIndexScss(rootDir, folder)) {
                    // _index.scssが更新されたことをViteに通知
                    const indexPath = path.join(rootDir, folder, '_index.scss');
                    server.ws.send({
                        type: 'full-reload',
                        path: '*'
                    });
                    console.log(`[vite-plugin-scss-index] ✅ ${folder}/_index.scss を更新しました`);
                }
            });

            server.watcher.on('unlink', (filePath) => {
                // 監視対象のフォルダ内の_*.scssファイルのみ処理
                const folder = getFolderFromPath(rootDir, filePath);
                if (!folder) return;

                const fileName = path.basename(filePath);
                // _index.scss以外の_で始まる.scssファイル
                if (!fileName.startsWith('_') || !fileName.endsWith('.scss') || fileName === '_index.scss') {
                    return;
                }

                console.log(`[vite-plugin-scss-index] ➖ 削除: ${fileName} (${folder})`);
                if (generateIndexScss(rootDir, folder)) {
                    // _index.scssが更新されたことをViteに通知
                    const indexPath = path.join(rootDir, folder, '_index.scss');
                    server.ws.send({
                        type: 'full-reload',
                        path: '*'
                    });
                    console.log(`[vite-plugin-scss-index] ✅ ${folder}/_index.scss を更新しました`);
                }
            });
        },

        // サーバー終了時のクリーンアップ
        closeBundle() {
            console.log('[vite-plugin-scss-index] プラグインを終了します');
        },
    };
}