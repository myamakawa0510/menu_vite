// ============================================================
// トップページ専用 JS
// 対象: .p-top-fv が存在するページ（index.html）
// ============================================================

// p-system アニメーション（system パーシャルが存在する全ページで実行）
(function() {
    if (!document.querySelector(".p-system__leadwrap")) return;

    const mm = gsap.matchMedia();
    mm.add("(max-width: 767px)", () => {
        const systemttl = gsap.timeline({
            scrollTrigger: {
                trigger: ".p-system__leadwrap",
                start: "top 85%",
            },
        });
        systemttl
            .to(".p-system__lead01", {
                "--clip-path": "inset(0% 0% 0% 100%)",
                duration: 0.7,
                ease: "power2.inOut",
                stagger: 0.1,
            })
            .to(
                ".p-system__lead02",
                {
                    "--clip-path": "inset(0% 0% 0% 100%)",
                    duration: 0.7,
                    ease: "power2.inOut",
                    stagger: 0.1,
                },
                "-=0.3",
            );
    });
    mm.add("(min-width: 768px)", () => {
        gsap.to(".p-system__lead", {
            "--clip-path": "inset(0% 0% 0% 100%)",
            duration: 0.7,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: ".p-system__leadwrap",
                start: "top 85%",
            },
        });
    });
})();

(function() {
    if (!document.querySelector(".p-top-fv")) return;

    // fvアニメーション（PCは表示速度を速め、SPは現状維持）
    function createFvTimeline(duration, delayShort, delayLong) {
        const tl = gsap.timeline();
        tl.from(
                ".p-top-fv__img",
                {
                    opacity: 0,
                    y: 20,
                    duration: duration,
                    ease: "power2.inOut",
                    clearProps: "transform,opacity",
                },
                `+=${delayShort}`,
            )
            .fromTo(
                ".p-top-fv__headline-deco",
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration,
                    ease: "power2.inOut",
                    clearProps: "transform",
                    immediateRender: true,
                },
                `+=${delayShort}`,
            )
            .from(
                ".p-top-fv__headline",
                {
                    opacity: 0,
                    y: 20,
                    duration: duration,
                    ease: "power2.inOut",
                    clearProps: "transform,opacity",
                },
                `+=${delayLong}`,
            )
            .from(
                ".p-top-fv__bgimg",
                {
                    opacity: 0,
                    y: 20,
                    duration: duration,
                    ease: "power2.inOut",
                    clearProps: "transform,opacity",
                },
                `+=${delayLong}`,
            );
    }
    const fvMm = gsap.matchMedia();
    fvMm.add("(max-width: 767px)", () => {
        createFvTimeline(0.6, 0.1, 0.2);
    });
    fvMm.add("(min-width: 768px)", () => {
        createFvTimeline(0.5, 0.08, 0.15);
    });

    // reasonセクションタイトルアニメーション
    const reasonMm = gsap.matchMedia();
    reasonMm.add("(max-width: 767px)", () => {
        // SP: 英語タイトル → 日本語タイトルの順
        const reasonttl = gsap.timeline({
            scrollTrigger: {
                trigger: ".p-top-reason__header",
                start: "top 80%",
            },
        });
        reasonttl
            .fromTo(
                ".p-top-reason__headlineen",
                {
                    backgroundPosition: "0% 0%"
                },
                {
                    backgroundPosition: "-100% 0%",
                    duration: 0.3,
                    ease: "power2.inOut",
                },
            )
            .fromTo(
                ".p-top-reason__headline-text",
                {
                    "--clip-path": "inset(0% 0% 0% 0%)"
                },
                {
                    "--clip-path": "inset(0% 0% 0% 100%)",
                    duration: 0.5,
                    ease: "power2.inOut",
                    stagger: 0.1,
                },
                "-=0.1",
            );
    });
    reasonMm.add("(min-width: 768px)", () => {
        // PC: 日本語タイトル → 英語タイトルの順
        const reasonttl = gsap.timeline({
            scrollTrigger: {
                trigger: ".p-top-reason__header",
                start: "top 80%",
            },
        });
        reasonttl
            .fromTo(
                ".p-top-reason__headline-text",
                {
                    "--clip-path": "inset(0% 0% 0% 0%)"
                },
                {
                    "--clip-path": "inset(0% 0% 0% 100%)",
                    duration: 0.5,
                    ease: "power2.inOut",
                    stagger: 0.1,
                },
            )
            .fromTo(
                ".p-top-reason__headlineen",
                {
                    backgroundPosition: "0% 0%"
                },
                {
                    backgroundPosition: "-100% 0%",
                    duration: 0.3,
                    ease: "power2.inOut",
                },
                "-=0.2",
            );
    });


    // // フェードアップパターン
    // reasonttl.fromTo(
    //     ".p-top-reason__header",
    //     {
    //         opacity: 0,
    //         y: 30,
    //     },
    //     {
    //         opacity: 1,
    //         y: 0,
    //         duration: 0.6,
    //         ease: "power2.inOut",
    //     },
    // );


    // テキストが一文字ずつフェードアップ
    // const text = new SplitText(".p-top-reason__headlineen");

    // reasonttl.from(
    //     text.chars,
    //     {
    //         opacity: 0,
    //         y: 50,
    //         duration: 0.7,
    //         ease: "power2.inOut",
    //         stagger: 0.1,
    //     },
    //     "-=0.2",
    // );

    // top-counselingアニメーション
    gsap.to(".p-top-counseling__lead", {
        "--clip-path": "inset(0% 0% 0% 100%)",
        duration: 0.7,
        ease: "power2.inOut",
        scrollTrigger: {
            trigger: ".p-top-counseling__lead",
            start: "top 85%",
        },
    });
})();