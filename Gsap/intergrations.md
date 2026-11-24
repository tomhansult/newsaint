# New Saint — Horizontal Scroll Engine (integration package)

This package is the first implementation unit for the New Saint homepage.
It uses classic browser scripts; no bundler, npm install, React or ES modules.

## Files

- `js/animations/horizontal-engine.js` — reusable pin + horizontal track controller.
- `js/components/collection.js` — collection-specific panel effects.

## Important repository audit findings

The homepage currently has:
- A desktop collection track with an intro and five product panels.
- A separate mobile carousel that duplicates the same five products.
- An inline GSAP collection block restricted to `(min-width: 901px)`.
- Homepage styles inside the `<style>` block in `index.html`.
- GSAP and ScrollTrigger loaded from jsDelivr before the inline homepage script.

`Main.js` is cart logic for the older multi-page templates. `script.js` is a separate loader/navigation/reveal script. Neither should own this homepage engine.

## 1. Replace the collection markup

Replace the existing `<section id="collectionSection">...</section>` with the following.
Product content, image paths, prices and links are preserved from the current repository.

```html
<section class="collection" data-index="03" data-section="collection"
         id="collectionSection" data-horizontal-section="collection">
  <div class="collection-viewport" id="collectionViewport">
    <div class="collection-track" id="collectionTrack">

      <article class="collection-panel collection-intro" data-horizontal-panel>
        <div>
          <p class="eyebrow">The Collection</p>
          <h2>AW26</h2>
          <div class="collection-intro-meta">Autumn / Winter 2026</div>
        </div>
      </article>

      <article class="collection-panel product-panel" data-horizontal-panel>
        <div class="product-image-wrap">
          <img class="product-image" src="assets/images/Products/Saint hoodie.avif"
               alt="Saint Hoodie" loading="eager" decoding="async">
        </div>
        <div class="product-info">
          <div class="product-number">01 / 05</div>
          <h3 class="product-name">Saint Hoodie</h3>
          <p class="product-price">R890</p>
          <a class="product-link" href="store.html">Shop Piece</a>
        </div>
      </article>

      <article class="collection-panel product-panel" data-horizontal-panel>
        <div class="product-image-wrap">
          <img class="product-image" src="assets/images/Products/Xavier edition cropped Tee.avif"
               alt="Xavier Cropped Tee" loading="lazy" decoding="async">
        </div>
        <div class="product-info">
          <div class="product-number">02 / 05</div>
          <h3 class="product-name">Xavier Cropped Tee</h3>
          <p class="product-price">R550</p>
          <a class="product-link" href="store.html">Shop Piece</a>
        </div>
      </article>

      <article class="collection-panel product-panel" data-horizontal-panel>
        <div class="product-image-wrap">
          <img class="product-image" src="assets/images/Products/Two tone hoodie.avif"
               alt="Two Tone Hoodie" loading="lazy" decoding="async">
        </div>
        <div class="product-info">
          <div class="product-number">03 / 05</div>
          <h3 class="product-name">Two Tone Hoodie</h3>
          <p class="product-price">R950</p>
          <a class="product-link" href="store.html">Shop Piece</a>
        </div>
      </article>

      <article class="collection-panel product-panel" data-horizontal-panel>
        <div class="product-image-wrap">
          <img class="product-image" src="assets/images/Products/Pink santiano hoodie.avif"
               alt="Pink Santiano Hoodie" loading="lazy" decoding="async">
        </div>
        <div class="product-info">
          <div class="product-number">04 / 05</div>
          <h3 class="product-name">Pink Santiano Hoodie</h3>
          <p class="product-price">R950</p>
          <a class="product-link" href="store.html">Shop Piece</a>
        </div>
      </article>

      <article class="collection-panel product-panel" data-horizontal-panel>
        <div class="product-image-wrap">
          <img class="product-image" src="assets/images/Products/Santiano beanie.avif"
               alt="Santiano Beanie" loading="lazy" decoding="async">
        </div>
        <div class="product-info">
          <div class="product-number">05 / 05</div>
          <h3 class="product-name">Santiano Beanie</h3>
          <p class="product-price">R350</p>
          <a class="product-link" href="store.html">Shop Piece</a>
        </div>
      </article>

    </div>
  </div>
</section>
```

## 2. Replace the collection CSS

In the homepage's inline `<style>` block:
- Keep the existing product typography and link styling.
- Replace the existing collection layout rules with these.
- Remove the old `.collection-mobile`, `.mobile-products` and `.mobile-product` rules.
- Remove the old mobile rule that hides `.collection-desktop`.

```css
.collection {
  position: relative;
  height: 100svh;
  background: #000;
}

.collection-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.collection-track {
  position: absolute;
  inset: 0 auto auto 0;
  display: flex;
  width: max-content;
  height: 100%;
  will-change: transform;
}

.collection-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 100vw;
  width: 100vw;
  height: 100%;
  padding: 6rem var(--pad);
}

.collection-intro {
  justify-content: flex-start;
  padding-left: max(var(--pad), 12vw);
}

.collection-intro h2 {
  font-size: clamp(3rem, 8vw, 8rem);
  font-weight: 700;
  letter-spacing: -.07em;
  line-height: .88;
}

.collection-intro .eyebrow { margin-bottom: 1.75rem; }

.collection-intro-meta {
  margin-top: 2rem;
  display: flex;
  gap: 1.25rem;
  align-items: center;
  font-size: .58rem;
  letter-spacing: .3em;
  text-transform: uppercase;
  opacity: .4;
}

.collection-intro-meta::before {
  content: "";
  width: 34px;
  height: 1px;
  background: currentColor;
}

.product-panel { gap: clamp(2rem, 5vw, 5rem); }

.product-image-wrap {
  position: relative;
  width: min(43vw, 510px);
  height: min(68vh, 680px);
  overflow: hidden;
  flex: 0 0 auto;
  background: #0a0a0a;
  will-change: transform, opacity;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.product-info {
  width: min(260px, 24vw);
  flex: 0 0 auto;
  will-change: transform, opacity;
}

@media (max-width: 900px) {
  .collection-panel {
    flex-direction: column;
    justify-content: center;
    gap: 1.25rem;
    padding: 5rem 1.25rem;
  }

  .collection-intro {
    align-items: flex-start;
    justify-content: center;
    padding-left: 1.5rem;
  }

  .collection-intro h2 {
    font-size: clamp(4.5rem, 20vw, 7rem);
  }

  .product-image-wrap {
    width: min(72vw, 390px);
    height: min(47svh, 480px);
  }

  .product-info {
    width: min(72vw, 390px);
  }

  .product-number { margin-bottom: .65rem; }
  .product-link { margin-top: .85rem; }
}

@media (max-width: 480px) {
  .product-image-wrap {
    width: min(78vw, 360px);
    height: 43svh;
  }

  .product-info { width: min(78vw, 360px); }
}

@media (prefers-reduced-motion: reduce) {
  .collection {
    height: auto;
  }

  .collection-viewport {
    height: auto;
    overflow: visible;
  }

  .collection-track {
    position: relative;
    display: block;
    width: 100%;
    height: auto;
    transform: none !important;
  }

  .collection-panel {
    width: 100%;
    min-height: 70svh;
    height: auto;
  }

  .collection-intro { min-height: 55svh; }

  .product-panel {
    min-height: 80svh;
  }

  .product-image-wrap {
    width: min(78vw, 390px);
    height: 48svh;
  }

  .product-info { width: min(78vw, 390px); }
}
```

## 3. Load the engine and collection configuration

Keep the existing GSAP and ScrollTrigger CDN scripts. Immediately after them, add:

```html
<script src="js/animations/horizontal-engine.js"></script>
<script src="js/components/collection.js"></script>
```

These must appear before the existing large inline homepage script.

## 4. Remove the old inline collection animation

In the large inline homepage script, remove the complete block beginning with:

```js
/* NEW SAINT — PINNED HORIZONTAL COLLECTION */
```

and ending at the corresponding `collectionMedia.add(...)` closing `);`.

Do not remove:
- GSAP registration.
- Lenis setup.
- Scroll progress.
- Other homepage animations.
- Global resize/orientation refresh logic.

## 5. Mobile behaviour

This first version intentionally uses vertical page scrolling to drive horizontal movement on mobile as well as desktop. The same five product panels remain in the DOM exactly once.

The reduced-motion experience is a vertically stacked list and does not pin.

Native touch-driven horizontal swipe is not enabled in this first version. It can be added later as a configurable interaction mode.

## 6. Important validation

After integration, test in a browser:
- Desktop: intro through final product, then campaign section.
- Mobile: vertical finger scroll drives the collection horizontally.
- Final product is fully visible before the pin releases.
- Rotate the phone and resize the browser.
- Test with reduced motion enabled.
- Check for console errors and duplicate ScrollTriggers.

Do not treat this as fully browser-validated until those checks have been performed.
