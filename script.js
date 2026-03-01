/* ===================================================
   EPIC-2003 - Rock Night 2025
   Vanilla JS interactions
   =================================================== */

(function () {
    'use strict';

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const headerEl = document.querySelector('.site-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-links');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

    const setHeaderProgress = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${pct}%`;
        }

        if (headerEl) {
            headerEl.classList.toggle('scrolled', scrollTop > 40);
        }

        /* Scroll-to-top button visibility */
        const scrollTopBtn = document.getElementById('scroll-top');
        if (scrollTopBtn) {
            if (scrollTop > 400) {
                scrollTopBtn.removeAttribute('hidden');
            } else {
                scrollTopBtn.setAttribute('hidden', '');
            }
        }
    };

    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const closeMobileMenu = () => {
        if (!hamburger || !navList) return;
        hamburger.classList.remove('active');
        navList.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('menu-open', isOpen);
        });

        navAnchors.forEach((anchor) => {
            anchor.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMobileMenu();
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                event.preventDefault();
                return;
            }
            if (href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    revealEls.forEach((el, index) => {
        const delay = Math.min(index * 45, 320);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -38px 0px' }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    const observedTargets = navAnchors
        .map((anchor) => {
            const href = anchor.getAttribute('href');
            if (!href || !href.startsWith('#') || href.length < 2) return null;
            const target = document.querySelector(href);
            return target ? { href, target, anchor } : null;
        })
        .filter(Boolean);

    if (observedTargets.length && navAnchors.length && 'IntersectionObserver' in window) {
        const linkMap = new Map(observedTargets.map((item) => [item.target.getAttribute('id'), item.anchor]));

        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.getAttribute('id');
                    if (!id) return;

                    navAnchors.forEach((a) => a.classList.remove('is-active'));
                    const activeLink = linkMap.get(id);
                    if (activeLink) activeLink.classList.add('is-active');
                });
            },
            { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 }
        );

        observedTargets.forEach((item) => navObserver.observe(item.target));
    }

    const registerForm = document.getElementById('register-form');
    const registerStatus = document.getElementById('register-status');

    if (registerForm && registerStatus) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const controls = Array.from(registerForm.elements).filter((el) => {
                return el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
            });

            controls.forEach((el) => el.classList.remove('invalid'));

            let firstInvalid = null;

            controls.forEach((el) => {
                const value = (el.value || '').trim();
                const isRequiredEmpty = el.required && value.length === 0;
                const badEmail = el.type === 'email' && value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const badPhone = el.name === 'phone' && value.length > 0 && !/^[0-9+\-() ]{8,20}$/.test(value);

                if (isRequiredEmpty || badEmail || badPhone) {
                    el.classList.add('invalid');
                    if (!firstInvalid) firstInvalid = el;
                }
            });

            if (firstInvalid) {
                registerStatus.textContent = 'Please fill in all fields correctly.';
                registerStatus.className = 'register-status error';
                firstInvalid.focus();
                return;
            }

            const formData = new FormData(registerForm);
            const name = String(formData.get('fullName') || 'Guest').trim();

            registerStatus.textContent = `Registration submitted for ${name}. Please check your email for updates.`;
            registerStatus.className = 'register-status success';
            registerForm.reset();
        });

        registerForm.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
            if (target.classList.contains('invalid')) target.classList.remove('invalid');

            if (registerStatus.textContent) {
                registerStatus.textContent = '';
                registerStatus.className = 'register-status';
            }
        });
    }

    setHeaderProgress();
    window.addEventListener('scroll', setHeaderProgress, { passive: true });
    window.addEventListener('resize', () => {
        setHeaderProgress();
        if (window.innerWidth > 768) closeMobileMenu();
    });
})();
