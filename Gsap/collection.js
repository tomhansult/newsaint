/**
 * NEW SAINT — AW26 Collection
 * Unified desktop/mobile horizontal collection.
 */

(function () {
  "use strict";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const HorizontalEngine = window.NewSaintHorizontal;

  if (!gsap || !ScrollTrigger || !HorizontalEngine) {
    console.error("[NewSaintCollection] Dependencies missing.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector(
    '[data-horizontal-section="collection"]'
  );

  if (!section) {
    console.warn("[NewSaintCollection] Collection section not found.");
    return;
  }

  const viewport = section.querySelector(
    "[data-horizontal-viewport]"
  );

  const track = section.querySelector(
    "[data-horizontal-track]"
  );

  const panels = Array.from(
    section.querySelectorAll("[data-horizontal-panel]")
  );

  if (!viewport || !track || !panels.length) {
    console.error("[NewSaintCollection] Invalid collection markup.");
    return;
  }

  function createPanelAnimations(parentTween) {
    const animations = [];

    panels.forEach((panel) => {
      const image = panel.querySelector(".product-image img, img");

      const content = panel.querySelector(
        ".product-info, .collection-content"
      );

      const isIntro = panel.classList.contains(
        "collection-intro"
      );

      if (image) {
        const imageReveal = gsap.fromTo(
          image,
          {
            opacity: 0.7,
            scale: 1.045
          },
          {
            opacity: 1,
            scale: 1,
            ease: "none",

            scrollTrigger: {
              trigger: panel,
              containerAnimation: parentTween,
              start: "left 90%",
              end: "center 55%",
              scrub: true
            }
          }
        );

        animations.push(imageReveal);
      }

      if (content && !isIntro) {
        const contentReveal = gsap.fromTo(
          content,
          {
            opacity: 0,
            y: 22
          },
          {
            opacity: 1,
            y: 0,
            ease: "none",

            scrollTrigger: {
              trigger: panel,
              containerAnimation: parentTween,
              start: "left 82%",
              end: "center 55%",
              scrub: true
            }
          }
        );

        animations.push(contentReveal);
      }

      if (image && !isIntro) {
        const parallax = gsap.to(image, {
          yPercent: -3,
          ease: "none",

          scrollTrigger: {
            trigger: panel,
            containerAnimation: parentTween,
            start: "left right",
            end: "right left",
            scrub: true
          }
        });

        animations.push(parallax);
      }
    });

    return function cleanup() {
      animations.forEach((animation) => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
    };
  }

  const instance = HorizontalEngine.create({
    viewport,
    track,
    panels,

    breakpoint: 900,

    desktopPin: true,
    mobilePin: true,

    desktopScrub: 1,
    mobileScrub: 1,

    onAnimation: createPanelAnimations
  });

  window.NewSaintCollection = instance;

})();
