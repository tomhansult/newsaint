// ============================================
// NEW SAINT — Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Loader ---
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('loaded'), 800);
    });
    // Fallback in case load already fired
    setTimeout(() => loader.classList.add('loaded'), 2500);

    // --- Navigation scroll effect ---
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // --- Mobile menu ---
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- Scroll reveal animations ---
    const revealElements = document.querySelectorAll('.section-header, .split-content, .about-left, .about-right, .cta-inner, .full-editorial-content');
    const productCards = document.querySelectorAll('.product-card');
    const lookbookItems = document.querySelectorAll('.lookbook-item');

    revealElements.forEach(el => el.classList.add('reveal'));

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Staggered product cards
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.parentElement.querySelectorAll('.product-card');
                cards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('visible'), i * 80);
                });
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (productCards.length > 0) {
        cardObserver.observe(productCards[0]);
    }

    // Staggered lookbook items
    const lookbookObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.parentElement.querySelectorAll('.lookbook-item');
                items.forEach((item, i) => {
                    setTimeout(() => item.classList.add('visible'), i * 100);
                });
                lookbookObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (lookbookItems.length > 0) {
        lookbookObserver.observe(lookbookItems[0]);
    }

    // --- Custom cursor (desktop only) ---
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        let cursorX = 0, cursorY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        function animateCursor() {
            currentX += (cursorX - currentX) * 0.15;
            currentY += (cursorY - currentY) * 0.15;
            cursor.style.left = currentX + 'px';
            cursor.style.top = currentY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        const hoverTargets = document.querySelectorAll('a, button, .product-card');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
