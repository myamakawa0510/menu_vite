import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminGifsicle from 'imagemin-gifsicle';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import paths from '../config/paths.js';

// 画像最適化のベースディレクトリを動的に構築
const baseDir = path.join(paths.dist, paths.assets.img.dest);

async function optimizeImages() {
    try {
        // dist/assets/img 配下のすべてのサブフォルダを取得
        const folders = await glob(`${baseDir}/**/`, {
            ignore: ['**/node_modules/**']
        });

        // ルートフォルダも追加
        const allFolders = [baseDir, ...folders];

        for (const folder of allFolders) {
            // 各フォルダ内の画像ファイルを最適化
            const files = await imagemin([`${folder}/*.{jpg,jpeg,png,svg,gif}`], {
                destination: folder,
                plugins: [
                    imageminMozjpeg({ quality: 85 }),
                    imageminPngquant({
                        quality: [0.65, 0.9],
                        speed: 1
                    }),
                    imageminSvgo({
                        plugins: [
                            { name: 'removeViewBox', active: false }
                        ]
                    }),
                    imageminGifsicle()
                ]
            });

            if (files.length > 0) {
                const relativePath = path.relative(baseDir, folder) || '(root)';
                console.log(`✓ ${relativePath}: ${files.length} files optimized`);
            }
        }

        console.log('✅ Image optimization complete!');
    } catch (error) {
        console.error('❌ Error optimizing images:', error);
        process.exit(1);
    }
}

optimizeImages();
