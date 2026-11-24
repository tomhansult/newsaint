/* ==========================================================
   NEW SAINT — COLLECTION CONFIGURATION
   Section-specific effects live here, not in the core engine.
========================================================== */
(function (window, document) {
  "use strict";

  function initCollection() {
    if (!window.NewSaintHorizontal) return;

    const section = document.querySelector("#collectionSection");
    if (!section) return;

    window.NewSaintHorizontal.create({
      section: section,
      viewport: "#collectionViewport",
      track: "#collectionTrack",
      panels: "[data-horizontal-panel]",
      scrub: 0.9,
      start: "top top",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,

      onPanelAnimation: function (context) {
        const gsap = context.gsap;
        const horizontalTween = context.horizontalTween;

        context.panels.forEach(function (panel) {
          if (!panel.classList.contains("product-panel")) return;

          const imageWrap = panel.querySelector(".product-image-wrap");
          const image = panel.querySelector(".product-image");
          const info = panel.querySelector(".product-info");

          if (imageWrap) {
            gsap.fromTo(imageWrap,
              { scale: 0.94, opacity: 0.4 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: horizontalTween,
                  start: "left 90%",
                  end: "left 38%",
                  scrub: true
                }
              }
            );
          }

          if (info) {
            gsap.fromTo(info,
              { x: 38, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: horizontalTween,
                  start: "left 78%",
                  end: "left 42%",
                  scrub: true
                }
              }
            );
          }

          if (image) {
            gsap.fromTo(image,
              { xPercent: -7, scale: 1.1 },
              {
                xPercent: 7,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: horizontalTween,
                  start: "left right",
                  end: "right left",
                  scrub: true
                }
              }
            );
          }
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCollection, { once: true });
  } else {
    initCollection();
  }
})(window, document);
