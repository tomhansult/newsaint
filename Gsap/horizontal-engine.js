
/**
 * NEW SAINT — Unified Horizontal Scroll Engine
 * GSAP 3.12.5 + ScrollTrigger
 *
 * Responsibilities:
 * - Horizontal travel calculation
 * - ScrollTrigger pinning
 * - Responsive configurations
 * - Reduced-motion support
 * - Resize/image refresh lifecycle
 * - Duplicate initialization protection
 * - Cleanup
 */

(function (window) {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) {
    console.error(
      "[NewSaintHorizontal] GSAP and ScrollTrigger are required."
    );
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const instances = new WeakMap();

  const DEFAULTS = {
    start: "top top",
    scrub: 1,
    anticipatePin: 1,
    pin: true,
    invalidateOnRefresh: true,
    ease: "none",
    breakpoint: 900,
    mobilePin: true,
    desktopPin: true,
    refreshOnImages: true,
    refreshOnResize: true,
    refreshOnOrientationChange: true,
    refreshOnResizeObserver: true
  };

  function create(options = {}) {
    const config = {
      ...DEFAULTS,
      ...options
    };

    const viewport =
      typeof config.viewport === "string"
        ? document.querySelector(config.viewport)
        : config.viewport;

    const track =
      typeof config.track === "string"
        ? document.querySelector(config.track)
        : config.track;

    if (!viewport || !track) {
      console.warn(
        "[NewSaintHorizontal] Missing viewport or track.",
        config
      );

      return null;
    }

    if (instances.has(viewport)) {
      return instances.get(viewport);
    }

    const panels = config.panels
      ? Array.from(config.panels)
      : Array.from(track.querySelectorAll("[data-horizontal-panel]"));

    let destroyed = false;
    let media;
    let resizeObserver;
    let imageListeners = [];
    let refreshTimeout;

    let horizontalTween = null;

    const originalTransform = track.style.transform;

    const getDistance = () =>
      Math.max(0, track.scrollWidth - viewport.clientWidth);

    const refresh = () => {
      if (destroyed) return;

      clearTimeout(refreshTimeout);

      refreshTimeout = setTimeout(() => {
        if (destroyed) return;

        ScrollTrigger.refresh();
      }, 100);
    };

    const removeImageListeners = () => {
      imageListeners.forEach(({ image, event, handler }) => {
        image.removeEventListener(event, handler);
      });

      imageListeners = [];
    };

    const listenForImages = () => {
      if (!config.refreshOnImages) return;

      removeImageListeners();

      const images = Array.from(track.querySelectorAll("img"));

      images.forEach((image) => {
        if (image.complete) return;

        ["load", "error"].forEach((event) => {
          const handler = refresh;

          image.addEventListener(event, handler, {
            once: true
          });

          imageListeners.push({
            image,
            event,
            handler
          });
        });
      });
    };

    const createHorizontalAnimation = ({
      pin,
      scrub,
      start,
      end,
      breakpointName
    }) => {
      const distance = getDistance();

      gsap.set(track, {
        x: 0
      });

      if (distance <= 0) {
        horizontalTween = null;
        return null;
      }

      horizontalTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",

        scrollTrigger: {
          trigger: viewport,
          start,
          end: () => `+=${getDistance()}`,
          pin,
          scrub,
          anticipatePin: config.anticipatePin,
          invalidateOnRefresh: true,
          pinSpacing: true,

          onRefresh: () => {
            gsap.set(track, {
              x: 0
            });
          },

          id: config.id
            ? `${config.id}-${breakpointName}`
            : undefined
        }
      });

      return horizontalTween;
    };

    const desktopConfig = {
      pin: config.desktopPin,
      scrub: config.desktopScrub ?? config.scrub,
      start: config.desktopStart ?? config.start,
      breakpointName: "desktop"
    };

    const mobileConfig = {
      pin: config.mobilePin,
      scrub: config.mobileScrub ?? config.scrub,
      start: config.mobileStart ?? config.start,
      breakpointName: "mobile"
    };

    const setup = () => {
      media = gsap.matchMedia();

      media.add(
        {
          desktop: `(min-width: ${config.breakpoint}px)`,
          mobile: `(max-width: ${config.breakpoint - 1}px)`,
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
          const {
            desktop,
            mobile,
            reduceMotion
          } = context.conditions;

          if (reduceMotion) {
            gsap.set(track, {
              clearProps: "transform"
            });

            horizontalTween = null;

            return;
          }

          if (desktop) {
            createHorizontalAnimation(desktopConfig);
          }

          if (mobile) {
            createHorizontalAnimation(mobileConfig);
          }

          return () => {
            horizontalTween = null;
          };
        }
      );

      if (config.refreshOnResizeObserver && "ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(refresh);

        resizeObserver.observe(viewport);
        resizeObserver.observe(track);

        panels.forEach((panel) => {
          resizeObserver.observe(panel);
        });
      }

      if (config.refreshOnResize) {
        window.addEventListener("resize", refresh, {
          passive: true
        });
      }

      if (config.refreshOnOrientationChange) {
        window.addEventListener("orientationchange", refresh, {
          passive: true
        });
      }

      listenForImages();

      refresh();
    };

    const instance = {
      viewport,
      track,
      panels,

      get tween() {
        return horizontalTween;
      },

      get distance() {
        return getDistance();
      },

      refresh,

      destroy() {
        if (destroyed) return;

        destroyed = true;

        clearTimeout(refreshTimeout);

        if (media) {
          media.revert();
          media = null;
        }

        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }

        removeImageListeners();

        window.removeEventListener("resize", refresh);
        window.removeEventListener("orientationchange", refresh);

        gsap.set(track, {
          clearProps: "transform"
        });

        if (originalTransform) {
          track.style.transform = originalTransform;
        }

        instances.delete(viewport);

        ScrollTrigger.refresh();
      }
    };

    instances.set(viewport, instance);

    setup();

    return instance;
  }

  window.NewSaintHorizontal = {
    create
  };

})(window);
