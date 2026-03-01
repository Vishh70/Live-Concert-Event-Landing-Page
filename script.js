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
    const scrollTopBtn = document.getElementById('scroll-top');

    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-links');
    const navBackdrop = document.getElementById('nav-backdrop');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const countdownEl = document.querySelector('.countdown');
    const countdownLabelEl = countdownEl ? countdownEl.querySelector('.countdown__label') : null;
    const countdownValueEls = {
        days: countdownEl ? countdownEl.querySelector('[data-unit="days"]') : null,
        hours: countdownEl ? countdownEl.querySelector('[data-unit="hours"]') : null,
        minutes: countdownEl ? countdownEl.querySelector('[data-unit="minutes"]') : null,
        seconds: countdownEl ? countdownEl.querySelector('[data-unit="seconds"]') : null
    };
    const eventDateEl = document.querySelector('#hero time[datetime]');

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

        if (scrollTopBtn) {
            if (scrollTop > 420) {
                scrollTopBtn.removeAttribute('hidden');
            } else {
                scrollTopBtn.setAttribute('hidden', '');
            }
        }
    };

    const pad2 = (value) => String(Math.max(0, value)).padStart(2, '0');
    const setCountdownValues = (days, hours, minutes, seconds) => {
        if (countdownValueEls.days) countdownValueEls.days.textContent = pad2(days);
        if (countdownValueEls.hours) countdownValueEls.hours.textContent = pad2(hours);
        if (countdownValueEls.minutes) countdownValueEls.minutes.textContent = pad2(minutes);
        if (countdownValueEls.seconds) countdownValueEls.seconds.textContent = pad2(seconds);
    };

    if (countdownEl && countdownLabelEl) {
        let targetDate = null;
        const rawDate = eventDateEl ? eventDateEl.getAttribute('datetime') : null;
        if (rawDate) {
            const normalized = rawDate.includes('T') ? rawDate : `${rawDate}T18:00:00`;
            const parsed = new Date(normalized);
            if (!Number.isNaN(parsed.getTime())) targetDate = parsed;
        }
        if (!targetDate) targetDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

        const liveWindowMs = 1000 * 60 * 60 * 6;
        const baseYear = targetDate.getFullYear();

        const getActiveTarget = (now) => {
            const active = new Date(targetDate.getTime());
            while (now.getTime() > active.getTime() + liveWindowMs) {
                active.setFullYear(active.getFullYear() + 1);
            }
            return active;
        };

        const updateCountdown = () => {
            const now = new Date();
            const activeTarget = getActiveTarget(now);
            const diffMs = activeTarget.getTime() - now.getTime();
            const isLive = diffMs <= 0 && now.getTime() <= activeTarget.getTime() + liveWindowMs;
            const isNextEdition = activeTarget.getFullYear() > baseYear;

            countdownEl.classList.remove('is-live', 'is-ended');

            if (isLive) {
                countdownLabelEl.textContent = 'Live Now';
                countdownEl.classList.add('is-live');
                setCountdownValues(0, 0, 0, 0);
                return;
            }

            if (diffMs > 0) {
                countdownLabelEl.textContent = isNextEdition ? 'Next Edition Countdown' : 'Countdown';
                const totalSeconds = Math.floor(diffMs / 1000);
                const days = Math.floor(totalSeconds / 86400);
                const hours = Math.floor((totalSeconds % 86400) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                setCountdownValues(days, hours, minutes, seconds);
                return;
            }

            countdownLabelEl.textContent = 'Event Ended';
            countdownEl.classList.add('is-ended');
            setCountdownValues(0, 0, 0, 0);
        };

        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }

    const openMobileMenu = () => {
        if (!hamburger || !navList) return;
        navList.classList.add('open');
        navList.setAttribute('aria-hidden', 'false');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        if (navBackdrop) navBackdrop.removeAttribute('hidden');
    };

    const closeMobileMenu = () => {
        if (!hamburger || !navList) return;
        navList.classList.remove('open');
        navList.setAttribute('aria-hidden', 'true');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        if (navBackdrop) navBackdrop.setAttribute('hidden', '');
    };

    if (hamburger && navList) {
        navList.setAttribute('aria-hidden', 'true');

        hamburger.addEventListener('click', () => {
            const isOpen = navList.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        navAnchors.forEach((anchor) => {
            anchor.addEventListener('click', closeMobileMenu);
        });

        if (navBackdrop) {
            navBackdrop.addEventListener('click', closeMobileMenu);
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMobileMenu();
        });
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                event.preventDefault();
                return;
            }

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
            if (!href || href.length < 2) return null;
            const target = document.querySelector(href);
            return target ? { target, anchor } : null;
        })
        .filter(Boolean);

    const markActiveById = (id) => {
        navAnchors.forEach((anchor) => {
            anchor.classList.remove('is-active');
            anchor.removeAttribute('aria-current');
            if (anchor.getAttribute('href') === `#${id}`) {
                anchor.classList.add('is-active');
                anchor.setAttribute('aria-current', 'page');
            }
        });
    };

    if (window.location.hash && window.location.hash.length > 1) {
        markActiveById(window.location.hash.slice(1));
    }

    if (observedTargets.length && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.getAttribute('id');
                    if (id) markActiveById(id);
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
            target.classList.remove('invalid');

            if (registerStatus.textContent) {
                registerStatus.textContent = '';
                registerStatus.className = 'register-status';
            }
        });
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (!prefersReducedMotion && hasFinePointer) {
        const cards = Array.from(document.querySelectorAll('.artist-card'));

        cards.forEach((card) => {
            let frame = 0;
            let latestX = 0;
            let latestY = 0;

            const renderTilt = () => {
                frame = 0;
                card.style.setProperty('--ry', `${latestX * 6}deg`);
                card.style.setProperty('--rx', `${-latestY * 6}deg`);
            };

            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                latestX = (event.clientX - rect.left) / rect.width - 0.5;
                latestY = (event.clientY - rect.top) / rect.height - 0.5;

                if (!frame) frame = window.requestAnimationFrame(renderTilt);
            });

            card.addEventListener('pointerleave', () => {
                if (frame) window.cancelAnimationFrame(frame);
                frame = 0;
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--rx', '0deg');
            });
        });
    }

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            setHeaderProgress();
            ticking = false;
        });
    };

    setHeaderProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        setHeaderProgress();
        if (window.innerWidth > 768) closeMobileMenu();
    });
})();
