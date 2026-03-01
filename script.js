/* ===================================================
   EPIC-2003 — Rock Night 2025
   Vanilla JS — Scroll reveals, scroll progress,
   mobile nav, form handling, year injection
   =================================================== */

(function () {
    'use strict';

    /* ---------- Year injection --------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Scroll-driven reveal --------------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    /* ---------- Scroll progress bar + header shadow - */
    const progressBar = document.getElementById('scroll-progress-bar');
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = pct + '%';
        }

        if (header) {
            header.classList.toggle('scrolled', scrollTop > 40);
        }
    }, { passive: true });

    /* ---------- Mobile hamburger nav --------------- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Smooth scroll for anchor links ----- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ---------- Registration form handling --------- */
    const form = document.getElementById('register-form');
    const status = document.getElementById('register-status');

    if (form && status) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Remove previous invalid states
            form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

            let firstInvalid = null;

            // Validate each required field
            for (const el of form.elements) {
                if (el.required && !el.value.trim()) {
                    el.classList.add('invalid');
                    if (!firstInvalid) firstInvalid = el;
                } else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
                    el.classList.add('invalid');
                    if (!firstInvalid) firstInvalid = el;
                } else if (el.name === 'phone' && el.value && !/^[0-9+\-() ]{8,20}$/.test(el.value)) {
                    el.classList.add('invalid');
                    if (!firstInvalid) firstInvalid = el;
                }
            }

            if (firstInvalid) {
                firstInvalid.focus();
                status.textContent = 'Please fill in all fields correctly.';
                status.className = 'register-status error';
                return;
            }

            // Simulate successful submission
            status.textContent = '✓ Registration submitted! Check your email for confirmation.';
            status.className = 'register-status success';
            form.reset();

            // Clear status after 6 seconds
            setTimeout(() => {
                status.textContent = '';
                status.className = 'register-status';
            }, 6000);
        });

        // Clear invalid state on input
        form.addEventListener('input', (e) => {
            if (e.target.classList.contains('invalid')) {
                e.target.classList.remove('invalid');
            }
        });
    }
})();
