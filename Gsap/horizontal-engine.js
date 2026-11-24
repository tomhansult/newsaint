/* ==========================================================
   NEW SAINT — REUSABLE HORIZONTAL SECTION ENGINE
   Classic browser script. No build step or ES modules required.
   Requires GSAP 3 + ScrollTrigger.
========================================================== */
(function (window, document) {
  "use strict";

  const instances = new WeakMap();

  function resolveElement(value, scope) {
    if (!value) return null;
    if (typeof value === "string") return (scope || document).querySelector(value);
    return value;
  }

  function resolveElements(value, scope) {
    if (!value) return [];
    if (typeof value === "string") return Array.from((scope || document).querySelectorAll(value));
    if (value instanceof Element) return [value];
    return Array.from(value);
  }

  function createHorizontalSection(options) {
    const config = Object.assign({
      section: null,
      viewport: null,
      track: null,
      panels: "[data-horizontal-panel]",
      scrub: 1,
      start: "top top",
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      travel: null,
      onPanelAnimation: null,
      onRefresh: null,
      refreshOnImages: true,
      refreshOnResize: true,
      mobileBreakpoint: 900,
      markers: false
    }, options || {});

    const section = resolveElement(config.section);
    if (!section) {
      console.warn("[NewSaintHorizontal] Section not found.", config.section);
      return { destroy: function () {} };
    }

    if (instances.has(section)) {
      return instances.get(section);
    }

    const viewport = resolveElement(config.viewport, section);
    const track = resolveElement(config.track, section);
    const panels = resolveElements(config.panels, track || section);

    if (!viewport || !track || !panels.length) {
      console.warn("[NewSaintHorizontal] Missing viewport, track or panels.", section);
      return { destroy: function () {} };
    }

    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("[NewSaintHorizontal] GSAP and ScrollTrigger are required.");
      return { destroy: function () {} };
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    let destroyed = false;

    const getDistance = function () {
      if (typeof config.travel === "function") {
        return Math.max(0, config.travel({ section, viewport, track, panels }));
      }
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    };

    media.add("(prefers-reduced-motion: no-preference)", function () {
      let resizeTimer = 0;
      const imageListeners = [];

      gsap.set(track, { x: 0 });

      const distance = getDistance();
      if (distance < 1) return;

      const horizontalTween = gsap.to(track, {
        x: function () { return -getDistance(); },
        ease: "none",
        overwrite: "auto",
        scrollTrigger: {
          trigger: section,
          start: config.start,
          end: function () { return "+=" + getDistance(); },
          pin: config.pin,
          pinSpacing: config.pinSpacing,
          scrub: config.scrub,
          anticipatePin: config.anticipatePin,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          markers: config.markers
        }
      });

      if (typeof config.onPanelAnimation === "function") {
        config.onPanelAnimation({
          gsap,
          ScrollTrigger,
          horizontalTween,
          section,
          viewport,
          track,
          panels
        });
      }

      const refresh = function () {
        if (!destroyed) ScrollTrigger.refresh();
      };

      if (config.refreshOnImages) {
        track.querySelectorAll("img").forEach(function (img) {
          if (img.complete) return;
          const done = function () { refresh(); };
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          imageListeners.push([img, done]);
        });
      }

      const onResize = function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refresh, 180);
      };

      if (config.refreshOnResize) {
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("orientationchange", onResize, { passive: true });
      }

      if (typeof config.onRefresh === "function") {
        config.onRefresh({ refresh, horizontalTween, section, viewport, track, panels });
      }

      refresh();

      return function () {
        window.clearTimeout(resizeTimer);
        if (config.refreshOnResize) {
          window.removeEventListener("resize", onResize);
          window.removeEventListener("orientationchange", onResize);
        }
        imageListeners.forEach(function (entry) {
          entry[0].removeEventListener("load", entry[1]);
          entry[0].removeEventListener("error", entry[1]);
        });
      };
    });

    const instance = {
      section,
      viewport,
      track,
      panels,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        media.revert();
        instances.delete(section);
      }
    };

    instances.set(section, instance);
    return instance;
  }

  window.NewSaintHorizontal = Object.freeze({
    create: createHorizontalSection
  });
})(window, document);
