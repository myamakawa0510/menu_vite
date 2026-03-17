import autoprefixer from 'autoprefixer';
import sortMediaQueries from 'postcss-sort-media-queries';
import mqpacker from 'css-mqpacker';

export default {
    plugins: [
        autoprefixer(),
        sortMediaQueries({
            sort: 'desktop-first'
        }),
        mqpacker({
            sort: true
        })
    ]
};