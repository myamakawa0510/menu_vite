import fs from 'fs';
import path from 'path';
import paths from '../config/paths.js';

const root = paths.assets.scss.root;

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (file.endsWith('.scss')) {
            let code = fs.readFileSync(full, 'utf8');
            code = code.replace(/@use\s+"\.\//g, '@use "');
            fs.writeFileSync(full, code);
        }
    }
}

walk(root);