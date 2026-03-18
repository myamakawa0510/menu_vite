gsap.set("body", {
    opacity: 1,
});

gsap.registerPlugin(ScrollTrigger, SplitText);

// トップページ以外: body に is-sub を付与（SPヘッダー白背景・黒ロゴ用）
(function() {
    var p = window.location.pathname.replace(/\/$/, "") || "/";
    var isTop =
        p === "" || p === "/" || p.endsWith("/index") || p.endsWith("/index.html");
    if (!isTop && document.body) document.body.classList.add("is-sub");
})();

// SPブレークポイント（md: 767px と一致）
const SP_BREAKPOINT = 767;

// 対策A: bfcache復帰時にドロワー状態をリセット（SP時のみ）
window.addEventListener("pageshow", function(event) {
    if (event.persisted && window.innerWidth <= SP_BREAKPOINT) {
        const $ = window.jQuery;
        if ($) {
            $("body")
                .removeClass("is-open")
                .css({
                    position: "",
                    top: "",
                    width: ""
                });
            $(".p-globalmenusp").removeClass("is-open");
            $(".p-hamburger").removeClass("is-open");
            $(".p-header").removeClass("is-open");
        }
    }
});

// タブレットビューポート
if (
    navigator.userAgent.indexOf("iPhone") > 0 ||
    navigator.userAgent.indexOf("iPod") > 0 ||
    navigator.userAgent.indexOf("Android") > 0
) {
    document.head.insertAdjacentHTML(
        "beforeend",
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
    );
} else {
    document.head.insertAdjacentHTML(
        "beforeend",
        '<meta name="viewport" content="width=1250">',
    );
}

// 画像を長押しで保存をキャンセル（CSSで対応、touchstartのpreventDefaultはスクロールをブロックするため使わない）
document.querySelectorAll("img").forEach((img) => {
    img.style.webkitTouchCallout = "none";
    img.style.webkitUserSelect = "none";
    img.style.userSelect = "none";
    img.addEventListener("contextmenu", (e) => {
        e.preventDefault(); // コンテキストメニューを防ぐ
    });
});

$(function() {
    // // WOW.js 初期化
    // wow = new WOW({
    //     boxClass: 'wow',
    //     animateClass: 'animated',
    //     offset: 0,
    //     mobile: true,
    //     live: true
    // });
    // wow.init();

    const headerHeight = $(".p-header").length ?
        $(".p-header").outerHeight() + 30 :
        80;

    // アンカーリンククリック時の処理
    $('a[href*="#"]').on("click", function(e) {
        const href = $(this).attr("href");

        // ハッシュのみのリンク（#section1など）の場合
        if (href.startsWith("#")) {
            e.preventDefault();
            const target = href === "#" || href === "" ? $("html") : $(href);
            if (!target.length) return;

            // #rental_contactの場合は追加オフセットを適用
            const additionalOffset = href === "#rental_contact" ? -50 : 0;
            const position = target.offset().top - headerHeight - additionalOffset;
            $("html, body").animate(
                {
                    scrollTop: position,
                },
                400,
                "swing",
            );
            return;
        }

        // URLにハッシュが含まれている場合
        if (href.includes("#")) {
            const urlParts = href.split("#");
            const url = urlParts[0];
            const hash = "#" + urlParts[1];

            // 現在のページと同一かチェック
            const currentUrl = window.location.href.split("#")[0];
            const currentPath = window.location.pathname;
            const currentOrigin = window.location.origin;

            let isSamePage = false;

            // より正確な同一ページ判定
            if (
                url === currentUrl ||
                url === currentOrigin + currentPath ||
                url === currentPath ||
                url === currentOrigin ||
                url === ""
            ) {
                isSamePage = true;
            } else {
                try {
                    const linkUrl = new URL(url, window.location.href);
                    const currentUrlObj = new URL(window.location.href);

                    // ホストとパス名が同じかチェック
                    if (
                        linkUrl.origin === currentUrlObj.origin &&
                        linkUrl.pathname === currentUrlObj.pathname
                    ) {
                        isSamePage = true;
                    }
                } catch (error) {
                    // URL解析エラーの場合は安全側に倒す
                    console.warn("URL parsing error:", error);
                }
            }

            if (isSamePage) {
                e.preventDefault();
                const target = $(hash);
                if (!target.length) return;

                // #rental_contactの場合は追加オフセットを適用
                const additionalOffset = hash === "#rental_contact" ? 50 : 0;
                const position = target.offset().top - headerHeight - additionalOffset;
                $("html, body").animate(
                    {
                        scrollTop: position,
                    },
                    400,
                    "swing",
                );
            }
            // 別ページの場合はそのまま遷移させる
        }
    });

    // ページ遷移後のアンカー対応（すべてのブラウザで安定動作）
    function handleAnchorOnLoad() {
        // 一度スクロール位置を強制リセット（ブラウザの自動スクロールを打ち消す）
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 1);

        if (location.hash) {
            const target = $(location.hash);
            if (!target.length) return;

            setTimeout(() => {
                const additionalOffset = location.hash === "#rental_contact" ? 50 : 0;
                const position = target.offset().top - headerHeight - additionalOffset;
                $("html, body").animate(
                    {
                        scrollTop: position,
                    },
                    400,
                    "swing",
                );
            }, 50);
        }
    }

    // 動的importで読み込まれた場合、load イベントは既に発火済みの可能性がある
    if (document.readyState === "complete") {
        handleAnchorOnLoad();
    } else {
        $(window).on("load", handleAnchorOnLoad);
    }
});

// 対策F: g-sub-setをSP時のみ付与（ちらつき対策）
function updateDrawerVisibility() {
    const $ = window.jQuery;
    if (!$) return;

    const isSp = window.innerWidth <= SP_BREAKPOINT;
    const $drawer = $(".p-globalmenusp");
    const $hamburger = $(".p-hamburger");

    if (isSp) {
        $drawer.addClass("g-sub-set");
        $hamburger.addClass("g-sub-set");
    } else {
        $drawer.removeClass("g-sub-set is-open");
        $hamburger.removeClass("g-sub-set is-open");
        $("body").removeClass("is-open").css({
            position: "",
            top: "",
            width: ""
        });
        $(".p-header").removeClass("is-open");
    }
}

//ドロワー
jQuery(function($) {
    // 対策F: 初回・リサイズ時にg-sub-setを付与（SP時のみ）
    updateDrawerVisibility();
    let resizeTimer;
    $(window).on("resize", function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateDrawerVisibility, 100);
    });

    let isOpen = false;
    let scrollPosition = 0;

    $(".p-hamburger").on("click", function(e) {
        const target = $(e.currentTarget);
        const $body = $("body");

        isOpen = !isOpen;
        target.toggleClass("is-open");

        if (isOpen) {
            // 現在のスクロール位置を保存
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

            // bodyに固定スタイルを適用
            $body.addClass("is-open").css({
                position: "fixed",
                top: -scrollPosition + "px",
                width: "100%",
            });

            $(".p-globalmenusp").addClass("is-open");
            $(".p-header").addClass("is-open");
        } else {
            // 固定スタイルを解除
            $body.removeClass("is-open").css({
                position: "",
                top: "",
                width: "",
            });

            // 保存したスクロール位置に戻す
            window.scrollTo(0, scrollPosition);

            $(".p-globalmenusp").removeClass("is-open");
            $(".p-header").removeClass("is-open");
        }
    });
});

// ドロワーサブメニュー
// $(function() {
//     $('.p-globalMenuSp').on('click', '.p-globalMenuSp_trigger01', function(e) {
//         e.stopPropagation();

//         const $this = $(this);
//         const $submenu = $this.siblings('.p-globalMenuSp_sublist');
//         const $parentItem = $this.closest('.p-globalMenuSp_item');

//         // 他を閉じる
//         $('.p-globalMenuSp_item').not($parentItem).removeClass('is_active')
//             .find('.p-globalMenuSp_sublist').removeClass('is_active').css('height', 0);
//         $('.p-globalMenuSp_trigger').not($this).removeClass('is_active');

//         if ($submenu.hasClass('is_active')) {
//             const currentHeight = $submenu.outerHeight();
//             $submenu.css('height', currentHeight);
//             requestAnimationFrame(() => {
//                 $submenu.css('height', 0);
//             });

//             $submenu.removeClass('is_active');
//             $this.removeClass('is_active');
//             $parentItem.removeClass('is_active');
//         } else {
//             $submenu.css({
//                 height: 'auto'
//             });
//             const autoHeight = $submenu.outerHeight();
//             $submenu.css('height', 0);

//             requestAnimationFrame(() => {
//                 $submenu.css('height', autoHeight);
//                 $submenu.on('transitionend', function handler() {
//                     $submenu.off('transitionend', handler);
//                     $submenu.css('height', 'auto');
//                 });
//             });

//             $submenu.addClass('is_active');
//             $this.addClass('is_active');
//             $parentItem.addClass('is_active');
//         }
//     });
// });


//tab
$(function() {
    // 最初のコンテンツを表示
    $(".js_content").hide().first().show();

    // タブがクリックされたら
    $(".js_tab").on("click", function() {
        const $this = $(this);

        // 他のタブから current クラスを削除し、現在のタブに追加
        $(".js_tab").removeClass("current");
        $this.addClass("current");

        // インデックスを取得してコンテンツを表示
        const index = $this.parent().children(".js_tab").index($this);
        $(".js_content").hide().eq(index).fadeIn(300);
    });
});


// stagger
let staggers = document.querySelectorAll(".js-stagger");
staggers.forEach((stagger) => {
    gsap.fromTo(
        stagger.querySelectorAll(".js-stagger-item"),
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 0.45,
            stagger: 0.3,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: stagger,
                start: "top 85%",
            },
        },
    );
});


// フェードイン

let fadeIns = document.querySelectorAll(".js-fadeIn");
fadeIns.forEach((fadeIn) => {
    gsap.fromTo(
        fadeIn,
        {
            opacity: 0,
            y: 20,
        },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: fadeIn,
                start: "top 85%",
            },
        },
    );
});

// FAQ アコーディオン
document.querySelectorAll(".p-faq__item").forEach((details) => {
    const summary = details.querySelector(".p-faq__trigger");
    const content = details.querySelector(".p-faq__content");
    let isAnimating = false;

    summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAnimating) return;
        isAnimating = true;

        if (details.open) {
            const startHeight = content.offsetHeight;
            content.style.height = startHeight + "px";
            requestAnimationFrame(() => {
                content.style.transition = "height 0.3s ease";
                content.style.height = "0px";
                content.addEventListener("transitionend", function handler() {
                    content.removeEventListener("transitionend", handler);
                    details.open = false;
                    content.style.height = "";
                    content.style.transition = "";
                    isAnimating = false;
                });
            });
        } else {
            details.open = true;
            const endHeight = content.offsetHeight;
            content.style.height = "0px";
            requestAnimationFrame(() => {
                content.style.transition = "height 0.3s ease";
                content.style.height = endHeight + "px";
                content.addEventListener("transitionend", function handler() {
                    content.removeEventListener("transitionend", handler);
                    content.style.height = "";
                    content.style.transition = "";
                    isAnimating = false;
                });
            });
        }
    });
});