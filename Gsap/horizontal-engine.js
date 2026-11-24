/**
 * NEW SAINT — Horizontal Scroll Engine
 * GSAP 3.12.5 + ScrollTrigger
 *
 * Features:
 * - Responsive desktop/mobile horizontal scroll
 * - ScrollTrigger pinning
 * - Resize and orientation handling
 * - Reduced-motion support
 * - Image loading refresh
 * - Lifecycle cleanup
 * - No duplicated GSAP instances
 */

(function (window) {
  "use strict";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) {
    console.error("[NewSaintHorizontal] GSAP or ScrollTrigger missing.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const instances = new WeakMap();

  function create(options = {}) {
    const viewport = options.viewport;
    const track = options.track;
    const panels = options.panels || [];

    if (!viewport || !track) {
      console.error("[NewSaintHorizontal] Viewport or track missing.");
      return null;
    }

    if (instances.has(viewport)) {
      return instances.get(viewport);
    }

    const breakpoint = options.breakpoint || 900;

    let destroyed = false;
    let matchMedia;
    let resizeObserver;
    let parentTween = null;
    let childCleanup = null;
    let refreshTimer = null;

    const imageListeners = [];

    function getDistance() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function refresh() {
      if (destroyed) return;

      window.clearTimeout(refreshTimer);

      refreshTimer = window.setTimeout(() => {
        if (!destroyed) {
          ScrollTrigger.refresh();
        }
      }, 150);
    }

    function watchImages() {
      track.querySelectorAll("img").forEach((image) => {
        if (image.complete) return;

        ["load", "error"].forEach((eventName) => {
          image.addEventListener(eventName, refresh, { once: true });

          imageListeners.push({
            image,
            eventName,
            handler: refresh
          });
        });
      });
    }

    function unwatchImages() {
      imageListeners.forEach(({ image, eventName, handler }) => {
        image.removeEventListener(eventName, handler);
      });

      imageListeners.length = 0;
    }

    function cleanupChildren() {
      if (typeof childCleanup === "function") {
        childCleanup();
        childCleanup = null;
      }
    }

    function buildAnimation(mode) {
      cleanupChildren();

      if (parentTween) {
        parentTween.scrollTrigger?.kill();
        parentTween.kill();
        parentTween = null;
      }

      gsap.set(track, { x: 0 });

      if (getDistance() <= 0) return;

      parentTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",

        scrollTrigger: {
          trigger: viewport,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: mode.pin,
          pinSpacing: mode.pin,
          scrub: mode.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      if (typeof options.onAnimation === "function") {
        childCleanup = options.onAnimation(
          parentTween,
          mode.name
        );
      }
    }

    matchMedia = gsap.matchMedia();

    matchMedia.add(
      {
        desktop: `(min-width: ${breakpoint}px)`,
        mobile: `(max-width: ${breakpoint - 1}px)`,
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },

      (context) => {
        const conditions = context.conditions;

        if (conditions.reduceMotion) {
          gsap.set(track, {
            clearProps: "transform"
          });

          parentTween = null;

          return;
        }

        if (conditions.desktop) {
          buildAnimation({
            name: "desktop",
            pin: options.desktopPin !== false,
            scrub: options.desktopScrub ?? 1
          });
        }

        if (conditions.mobile) {
          buildAnimation({
            name: "mobile",
            pin: options.mobilePin !== false,
            scrub: options.mobileScrub ?? 1
          });
        }

        return () => {
          cleanupChildren();

          if (parentTween) {
            parentTween.scrollTrigger?.kill();
            parentTween.kill();
            parentTween = null;
          }

          gsap.set(track, { x: 0 });
        };
      }
    );

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(refresh);

      resizeObserver.observe(viewport);
      resizeObserver.observe(track);

      panels.forEach((panel) => {
        resizeObserver.observe(panel);
      });
    }

    window.addEventListener("resize", refresh, {
      passive: true
    });

    window.addEventListener("orientationchange", refresh, {
      passive: true
    });

    watchImages();
    refresh();

    const instance = {
      viewport,
      track,
      panels,

      get tween() {
        return parentTween;
      },

      get distance() {
        return getDistance();
      },

      refresh,

      destroy() {
        if (destroyed) return;

        destroyed = true;

        window.clearTimeout(refreshTimer);

        cleanupChildren();

        matchMedia.revert();

        resizeObserver?.disconnect();

        unwatchImages();

        window.removeEventListener("resize", refresh);
        window.removeEventListener("orientationchange", refresh);

        gsap.set(track, {
          clearProps: "transform"
        });

        instances.delete(viewport);

        ScrollTrigger.refresh();
      }
    };

    instances.set(viewport, instance);

    return instance;
  }

  window.NewSaintHorizontal = {
    create
  };

})(window);
