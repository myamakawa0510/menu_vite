// =====================
// dev 専用エントリ
// =====================

// SCSS（HMR用）
import '../scss/style.scss';

// jQuery
import $ from 'jquery';
window.$ = window.jQuery = $;

// Modal Video
import 'modal-video';
import 'modal-video/css/modal-video.min.css';

// Swiper（devはnpm版）
import Swiper from 'swiper';
import {
    Navigation,
    Pagination,
    Autoplay,
    EffectFade
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// GSAP
import {
    gsap
} from 'gsap';
import {
    ScrollTrigger
} from 'gsap/ScrollTrigger';
import {
    SplitText
} from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, SplitText);

// グローバル公開（既存コード互換）
window.Swiper = Swiper;
window.SwiperModules = {
    Navigation,
    Pagination,
    Autoplay,
    EffectFade,
};
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.SplitText = SplitText;

// 実処理（動的importでグローバル公開後に実行を保証）
import('./script.js').then(async () => {
    // ページ別JSを動的ロード（dev HMR で自動検出）
    const pageModules = import.meta.glob('./pages/*.js');
    await Promise.all(Object.values(pageModules).map(fn => fn()));
    ScrollTrigger.refresh();
});