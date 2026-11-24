
/**
 * NEW SAINT — AW26 Collection Configuration
 *
 * The horizontal engine owns the parent scroll animation.
 * This file owns collection-specific child animations.
 */

(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) {
    console.error("[NewSaintCollection] GSAP unavailable.");
    return;
  }

  if (!window.NewSaintHorizontal) {
    console.error("[NewSaintCollection] Horizontal engine unavailable.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector(
    '[data-horizontal-section="collection"]'
  );

  if (!section) return;

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
    console.warn("[NewSaintCollection] Invalid collection markup.");
    return;
  }

  let collectionInstance;
  let childAnimations = [];

  const cleanupChildren = () => {
    childAnimations.forEach((animation) => {
      animation.scrollTrigger?.kill();
      animation.kill();
    });

    childAnimations = [];
  };

  const createChildren = (horizontalTween) => {
    cleanupChildren();

    if (!horizontalTween) return;

    panels.forEach((panel, index) => {
      const image = panel.querySelector(
        ".product-image, .collection-image, img"
      );

      const information = panel.querySelector(
        ".product-info, .product-content, .collection-content"
      );

      const isIntro = panel.classList.contains(
        "collection-intro"
      );

      if (image) {
        const imageAnimation = gsap.fromTo(
          image,
          {
            opacity: 0.7,
            scale: 1.08,
            x: 30
          },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: "left right",
              end: "center center",
              scrub: true
            }
          }
        );

        childAnimations.push(imageAnimation);
      }

      if (information && !isIntro) {
        const infoAnimation = gsap.fromTo(
          information,
          {
            opacity: 0,
            y: 35
          },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: "left 75%",
              end: "center 50%",
              scrub: true
            }
          }
        );

        childAnimations.push(infoAnimation);
      }

      if (image && !isIntro) {
        const parallax = gsap.to(image, {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontalTween,
            start: "left right",
            end: "right left",
            scrub: true
          }
        });

        childAnimations.push(parallax);
      }
    });
  };

  collectionInstance = window.NewSaintHorizontal.create({
    viewport,
    track,
    panels,

    id: "new-saint-collection",

    breakpoint: 900,

    desktopPin: true,
    mobilePin: true,

    desktopScrub: 1,
    mobileScrub: 1,

    start: "top top",

    refreshOnImages: true,
    refreshOnResize: true,
    refreshOnOrientationChange: true,
    refreshOnResizeObserver: true
  });

  if (!collectionInstance) return;

  const setupChildAnimations = () => {
    cleanupChildren();

    const tween = collectionInstance.tween;

    if (!tween) return;

    createChildren(tween);
  };

  setupChildAnimations();

  ScrollTrigger.addEventListener(
    "refresh",
    setupChildAnimations
  );

  window.addEventListener(
    "pagehide",
    () => {
      cleanupChildren();

      ScrollTrigger.removeEventListener(
        "refresh",
        setupChildAnimations
      );

      collectionInstance.destroy();
    },
    {
      once: true
    }
  );

  window.NewSaintCollection = {
    refresh() {
      collectionInstance.refresh();
    },

    destroy() {
      cleanupChildren();

      ScrollTrigger.removeEventListener(
        "refresh",
        setupChildAnimations
      );

      collectionInstance.destroy();
    }
  };

})();
