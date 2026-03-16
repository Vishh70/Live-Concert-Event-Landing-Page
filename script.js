/* ===================================================
   PHOENIX LIVE '26 - Rock Night 2026
   Vanilla JS interactions
   =================================================== */

(function () {
    'use strict';

    /* ---- Configuration ---- */
    const CONFIG = {
        EMAILJS: {
            PUBLIC_KEY: "PFM389erFMkGQW6r9",
            SERVICE_ID: "service_5jxxr2o",
            TEMPLATE_ID: "template_vtgfowt"
        },
        FIREBASE: {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        },
        APP: {
            PROD_BASE_URL: "https://live-concert-event-landing-page.vercel.app",
            TICKET_ROUTE: "email-template.html",
            SUPPORT_URL: "https://live-concert-event-landing-page.vercel.app/#register"
        },
        STORAGE: {
            DRAFT: 'epic2003.registerDraft.v1',
            PLANNER: 'epic2003.planner.v1',
            CONFIRMED_TICKET: 'epic2003.confirmedTicket.v1',
            USER_PROFILE: 'epic2003.userProfile.v1',
            PURCHASE_HISTORY: 'epic2003.purchaseHistory.v1'
        },
        UI: {
            MOBILE_BREAKPOINT: 860,
            SCROLL_THRESHOLD: 40,
            CALENDAR_TYPE: 'google' // 'ics' (file download) or 'google' (web link)
        }
    };

    /* ---- Email Automation (EmailJS) ---- */
    // Instructions: Go to https://www.emailjs.com/, create a free account, 
    // and replace placeholders in the CONFIG object above.
    if (typeof emailjs !== 'undefined') {
        const pk = CONFIG.EMAILJS.PUBLIC_KEY;
        if (pk && pk !== "YOUR_PUBLIC_KEY") emailjs.init(pk);
    }

    /* ---- Firebase Initialization ---- */
    // Instructions: Create a project at console.firebase.google.com and replace YOUR_* above.
    let db = null;
    if (typeof firebase !== 'undefined' && CONFIG.FIREBASE.apiKey !== "YOUR_API_KEY") {
        try {
            firebase.initializeApp(CONFIG.FIREBASE);
            db = firebase.firestore();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    }

    const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
    const REDUCED_DATA_QUERY = window.matchMedia('(prefers-reduced-data: reduce)');
    const prefersReducedMotion = () => REDUCED_MOTION_QUERY.matches;
    const prefersReducedData = () => REDUCED_DATA_QUERY.matches;

    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const heroSection = document.getElementById('hero');
    const heroRevealEls = heroSection ? Array.from(heroSection.querySelectorAll('.reveal')) : [];
    let heroIntroStarted = false;

    const startHeroIntro = () => {
        if (!heroSection || heroIntroStarted) return;
        heroIntroStarted = true;

        heroRevealEls.forEach((el) => el.classList.add('visible'));

        if (prefersReducedMotion()) {
            heroSection.classList.add('hero--ready');
            return;
        }

        heroSection.classList.add('hero--armed');
        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                heroSection.classList.add('hero--ready');
            }, 80);
        });
    };

    if (preloader) {
        document.body.classList.add('is-loading');
        preloader.classList.add('is-active');

        let rafId = 0;
        let progress = 4;
        let simulatedTarget = 78;
        let didStartExit = false;
        const startedAt = performance.now();
        const minVisibleMs = (prefersReducedMotion() || prefersReducedData()) ? 220 : 920;

        const setProgress = (value) => {
            if (!preloaderBar) return;
            const safeValue = Math.max(0, Math.min(100, value));
            preloaderBar.style.width = `${safeValue.toFixed(2)}%`;
        };

        const runProgress = (now) => {
            const elapsed = now - startedAt;
            if (elapsed > 1500) simulatedTarget = 84;
            if (elapsed > 2900) simulatedTarget = 89;

            const gap = simulatedTarget - progress;
            progress += gap * 0.06;
            if (progress > 93 && !didStartExit) progress = 93;
            setProgress(progress);

            if (!didStartExit) {
                rafId = window.requestAnimationFrame(runProgress);
            }
        };

        const finishPreloader = () => {
            if (didStartExit) return;
            didStartExit = true;
            preloader.classList.add('is-ready');

            const elapsed = performance.now() - startedAt;
            const holdMs = Math.max(0, minVisibleMs - elapsed);
            const preExitMs = (prefersReducedMotion() || prefersReducedData()) ? 30 : 220;
            const removeDelayMs = (prefersReducedMotion() || prefersReducedData()) ? 120 : 920;

            window.setTimeout(() => {
                if (rafId) window.cancelAnimationFrame(rafId);
                setProgress(100);

                window.setTimeout(() => {
                    if (!prefersReducedMotion()) {
                        shatterPreloader();
                        window.setTimeout(() => {
                            preloader.classList.add('loaded');
                            document.body.classList.remove('is-loading');
                        }, 400); // Wait for shatter to start
                    } else {
                        preloader.classList.add('loaded');
                        document.body.classList.remove('is-loading');
                    }

                    window.setTimeout(() => {
                        preloader.remove();
                        startHeroIntro();
                    }, removeDelayMs);
                }, preExitMs);
            }, holdMs);
        };
        const shatterPreloader = () => {
            if (!preloader) return;
            preloader.classList.add('shattering');
            const cols = 5; // Reduced for performance
            const rows = 8;
            const shardWidth = window.innerWidth / cols;
            const shardHeight = window.innerHeight / rows;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const shard = document.createElement('div');
                    shard.className = 'preloader__shard';
                    shard.style.width = `${shardWidth + 2}px`;
                    shard.style.height = `${shardHeight + 2}px`;
                    shard.style.left = `${c * shardWidth}px`;
                    shard.style.top = `${r * shardHeight}px`;

                    const angle = Math.random() * Math.PI * 2;
                    const dist = 400 + Math.random() * 600;
                    shard.style.setProperty('--shard-x', `${Math.cos(angle) * dist}px`);
                    shard.style.setProperty('--shard-y', `${Math.sin(angle) * dist}px`);
                    shard.style.setProperty('--shard-r', `${(Math.random() - 0.5) * 500}deg`);

                    const delay = Math.random() * 0.1;
                    shard.style.animation = `shard-shatter 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`;
                    preloader.appendChild(shard);
                }
            }
        };

        rafId = window.requestAnimationFrame(runProgress);

        if (document.readyState === 'complete') {
            window.setTimeout(finishPreloader, 120);
        } else {
            window.addEventListener('load', finishPreloader, { once: true });
        }
        window.setTimeout(finishPreloader, 8500);
    } else {
        startHeroIntro();
    }

    const initHypeMeter = () => {
        const cheerBtn = document.getElementById('cheer-btn');
        const hypeFill = document.getElementById('hype-fill');
        const hypePercent = document.getElementById('hype-percent');
        const cheerCountEl = document.getElementById('cheer-count');
        if (!cheerBtn) return;

        let totalCheers = parseInt(localStorage.getItem('phoenix_cheers') || '8420');
        const goal = 12000;

        const updateUI = (total) => {
            const percent = Math.min(100, (total / goal) * 100);
            if (hypeFill) hypeFill.style.width = `${percent}%`;
            if (hypePercent) hypePercent.textContent = `${Math.floor(percent)}%`;
            if (cheerCountEl) cheerCountEl.textContent = total.toLocaleString();
        };

        updateUI(totalCheers);

        if (db) {
            const hypeRef = db.collection('event_stats').doc('hype');
            hypeRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    totalCheers = data.total_cheers || totalCheers;
                    updateUI(totalCheers);
                } else {
                    hypeRef.set({ total_cheers: totalCheers, goal: goal });
                }
            });
        }

        cheerBtn.addEventListener('click', () => {
            totalCheers++;
            updateUI(totalCheers);
            localStorage.setItem('phoenix_cheers', totalCheers);
            
            if (db) {
                const hypeRef = db.collection('event_stats').doc('hype');
                hypeRef.update({ total_cheers: firebase.firestore.FieldValue.increment(1) });
            }

            cheerBtn.style.transform = "scale(0.95)";
            setTimeout(() => cheerBtn.style.transform = "", 150);
        });
    };

    const initParallax = () => {
        const items = document.querySelectorAll('.parallax');
        if (!items.length || prefersReducedMotion()) return;
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            items.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.1;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, { passive: true });
    };


    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const headerEl = document.querySelector('.site-header');
    const progressBar = document.getElementById('scroll-progress-bar');
    const scrollTopBtn = document.getElementById('scroll-top');

    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-links');
    const navBackdrop = document.getElementById('nav-backdrop');
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const copyAddressBtn = document.getElementById('copy-address-btn');
    const copyAddressStatus = document.getElementById('copy-address-status');
    const venueAddress = document.getElementById('venue-address');
    const addCalendarBtn = document.getElementById('add-calendar-btn');
    const calendarStatus = document.getElementById('calendar-status');
    const faqSearch = document.getElementById('faq-search');
    const faqEmptyState = document.getElementById('faq-empty-state');
    const faqDetails = Array.from(document.querySelectorAll('#rules-faq details'));
    const plannerList = document.getElementById('planner-list');
    const plannerItems = Array.from(document.querySelectorAll('#planner-list input[type="checkbox"][data-plan]'));
    const plannerResetBtn = document.getElementById('planner-reset-btn');
    const plannerStatus = document.getElementById('planner-status');
    const plannerProgressText = document.getElementById('planner-progress-text');
    const plannerProgressFill = document.getElementById('planner-progress-fill');
    const countdownEl = document.querySelector('.countdown');
    const countdownLabelEl = countdownEl ? countdownEl.querySelector('.countdown__label') : null;
    const countdownValueEls = {
        days: countdownEl ? countdownEl.querySelector('[data-unit="days"]') : null,
        hours: countdownEl ? countdownEl.querySelector('[data-unit="hours"]') : null,
        minutes: countdownEl ? countdownEl.querySelector('[data-unit="minutes"]') : null,
        seconds: countdownEl ? countdownEl.querySelector('[data-unit="seconds"]') : null
    };
    const eventDateEl = document.querySelector('#hero time[datetime]');
    const eventDayLabel = document.getElementById('event-day-label');
    const isMobileViewport = () => window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
    const getHashTarget = (hash) => {
        if (!hash || hash.length < 2 || hash.charAt(0) !== '#') return null;
        try {
            return document.querySelector(hash);
        } catch {
            return document.getElementById(hash.slice(1));
        }
    };

    const getBaseUrl = ({ forEmail = false } = {}) => {
        const configuredProdBase = String(CONFIG.APP.PROD_BASE_URL || '').replace(/\/+$/, '');
        if (forEmail) {
            return configuredProdBase;
        }

        const runtimeOrigin = String(window.location.origin || '').replace(/\/+$/, '');
        if (!runtimeOrigin) {
            return configuredProdBase;
        }

        // On GitHub Pages project sites, window.location.origin points to the user root
        // (https://<user>.github.io). We must preserve the repository path segment.
        try {
            const prodUrl = new URL(`${configuredProdBase}/`);
            if (
                window.location.hostname.includes('github.io') &&
                window.location.hostname === prodUrl.hostname
            ) {
                const repoPath = prodUrl.pathname.replace(/\/+$/, '');
                if (repoPath && repoPath !== '/') {
                    return `${runtimeOrigin}${repoPath}`;
                }
                return configuredProdBase;
            }
        } catch {
            // Fallback to runtime origin when PROD_BASE_URL is malformed.
        }

        return runtimeOrigin;
    };

    const buildTicketUrl = (ticketData, { forEmail = false, autodownload = '' } = {}) => {
        if (!ticketData || typeof ticketData !== 'object') {
            throw new Error('Ticket URL generation failed: missing ticket data.');
        }

        const base = getBaseUrl({ forEmail });
        if (!base) {
            throw new Error('Ticket URL generation failed: base URL unavailable.');
        }

        const route = String(CONFIG.APP.TICKET_ROUTE || 'email-template.html').replace(/^\/+/, '');
        const url = new URL(route, `${base}/`);
        const data = {
            name: String(ticketData.name || 'Attendee'),
            pass: String(ticketData.pass || 'General Admission'),
            qty: String(ticketData.qty || '1'),
            email: String(ticketData.email || ''),
            phone: String(ticketData.phone || ''),
            city: String(ticketData.city || '')
        };

        Object.entries(data).forEach(([key, value]) => url.searchParams.set(key, value));
        url.searchParams.set('_v', String(Date.now()));

        if (autodownload) {
            url.searchParams.set('autodownload', String(autodownload));
        }

        return url.toString();
    };

    const readFormDraft = () => {
        try {
            const raw = window.localStorage.getItem(CONFIG.STORAGE.DRAFT);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    };

    const writeFormDraft = (draft) => {
        try {
            if (!draft || !Object.keys(draft).length) {
                window.localStorage.removeItem(CONFIG.STORAGE.DRAFT);
                return;
            }
            window.localStorage.setItem(CONFIG.STORAGE.DRAFT, JSON.stringify(draft));
        } catch {
            // Ignore storage errors (privacy mode, quota, etc.).
        }
    };

    const readPlannerState = () => {
        try {
            const raw = window.localStorage.getItem(CONFIG.STORAGE.PLANNER);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    };

    const writePlannerState = (state) => {
        try {
            if (!state || !Object.keys(state).length) {
                window.localStorage.removeItem(CONFIG.STORAGE.PLANNER);
                return;
            }
            window.localStorage.setItem(CONFIG.STORAGE.PLANNER, JSON.stringify(state));
        } catch {
            // Ignore storage errors.
        }
    };

    const readConfirmedTicket = () => {
        try {
            const raw = window.localStorage.getItem(CONFIG.STORAGE.CONFIRMED_TICKET);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    };

    const writeConfirmedTicket = (ticket) => {
        try {
            if (!ticket || !Object.keys(ticket).length) {
                window.localStorage.removeItem(CONFIG.STORAGE.CONFIRMED_TICKET);
                return;
            }
            window.localStorage.setItem(CONFIG.STORAGE.CONFIRMED_TICKET, JSON.stringify(ticket));
        } catch {
            // Ignore storage errors.
        }
    };

    /* ---- Account Profile Helpers ---- */
    const readUserProfile = () => {
        try {
            const raw = window.localStorage.getItem(CONFIG.STORAGE.USER_PROFILE);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && parsed.name ? parsed : null;
        } catch { return null; }
    };

    const writeUserProfile = (profile) => {
        try {
            if (!profile) {
                window.localStorage.removeItem(CONFIG.STORAGE.USER_PROFILE);
                return;
            }
            window.localStorage.setItem(CONFIG.STORAGE.USER_PROFILE, JSON.stringify(profile));
        } catch { /* ignore */ }
    };

    const readPurchaseHistory = () => {
        try {
            const raw = window.localStorage.getItem(CONFIG.STORAGE.PURCHASE_HISTORY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    };

    const writePurchaseHistory = (history) => {
        try {
            if (!history || !history.length) {
                window.localStorage.removeItem(CONFIG.STORAGE.PURCHASE_HISTORY);
                return;
            }
            window.localStorage.setItem(CONFIG.STORAGE.PURCHASE_HISTORY, JSON.stringify(history));
        } catch { /* ignore */ }
    };

    const addToHistory = (ticket) => {
        const history = readPurchaseHistory();
        const entry = {
            ...ticket,
            orderId: 'PX-' + Math.floor(Math.random() * 9000 + 1000),
            date: new Date().toISOString(),
            id: Date.now()
        };
        history.unshift(entry);
        writePurchaseHistory(history);
        return entry;
    };

    const formatIcsDateUtc = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    };

    if (eventDateEl && eventDayLabel) {
        const parsed = new Date(eventDateEl.getAttribute('datetime') || '');
        if (!Number.isNaN(parsed.getTime())) {
            eventDayLabel.textContent = parsed.toLocaleDateString('en-IN', { weekday: 'long' });
        }
    }

    let isHeaderScrolled = false;
    let isScrollTopVisible = false;

    const setHeaderProgress = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${pct}%`;
        }

        if (headerEl) {
            const shouldBeScrolled = scrollTop > CONFIG.UI.SCROLL_THRESHOLD;
            if (shouldBeScrolled !== isHeaderScrolled) {
                isHeaderScrolled = shouldBeScrolled;
                headerEl.classList.toggle('scrolled', shouldBeScrolled);
            }
        }

        if (scrollTopBtn) {
            const shouldBeVisible = scrollTop > 420;
            if (shouldBeVisible !== isScrollTopVisible) {
                isScrollTopVisible = shouldBeVisible;
                if (shouldBeVisible) scrollTopBtn.removeAttribute('hidden');
                else scrollTopBtn.setAttribute('hidden', '');
            }
        }
    };

    const pad2 = (value) => String(Math.max(0, value)).padStart(2, '0');
    const setCountdownCell = (el, value) => {
        if (!el) return;
        const formatted = pad2(value);
        if (el.textContent === formatted) return;

        el.textContent = formatted;
        const parent = el.closest('.counter');
        if (!parent) return;

        parent.classList.remove('is-updated');
        window.requestAnimationFrame(() => {
            parent.classList.add('is-updated');
        });
    };

    const setCountdownValues = (days, hours, minutes, seconds) => {
        setCountdownCell(countdownValueEls.days, days);
        setCountdownCell(countdownValueEls.hours, hours);
        setCountdownCell(countdownValueEls.minutes, minutes);
        setCountdownCell(countdownValueEls.seconds, seconds);
    };

    if (countdownEl && countdownLabelEl) {
        let targetDate = null;
        let countdownTimer = 0;
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

        const startCountdown = () => {
            if (countdownTimer) return;
            countdownTimer = window.setInterval(updateCountdown, 1000);
        };

        const stopCountdown = () => {
            if (!countdownTimer) return;
            window.clearInterval(countdownTimer);
            countdownTimer = 0;
        };

        updateCountdown();
        startCountdown();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopCountdown();
                return;
            }

            updateCountdown();
            startCountdown();
        });
    }

    const openMobileMenu = () => {
        if (!hamburger || !navList || !isMobileViewport()) return;
        navList.classList.add('open');
        navList.setAttribute('aria-hidden', 'false');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        if (navBackdrop) navBackdrop.removeAttribute('hidden');

        const firstLink = navList.querySelector('a[href]');
        if (firstLink instanceof HTMLElement) {
            firstLink.focus();
        }
    };

    const closeMobileMenu = () => {
        if (!hamburger || !navList) return;
        const focusedInMenu = navList.contains(document.activeElement);

        navList.classList.remove('open');
        navList.setAttribute('aria-hidden', isMobileViewport() ? 'true' : 'false');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        if (navBackdrop) navBackdrop.setAttribute('hidden', '');

        if (focusedInMenu && isMobileViewport()) {
            hamburger.focus();
        }
    };

    const syncMobileNavState = () => {
        if (!hamburger || !navList) return;

        if (isMobileViewport()) {
            const isOpen = navList.classList.contains('open');
            navList.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            return;
        }

        closeMobileMenu();
        navList.setAttribute('aria-hidden', 'false');
    };

    const trapMenuFocus = (event) => {
        if (!hamburger || !navList || !isMobileViewport()) return;
        if (!navList.classList.contains('open')) return;
        if (event.key !== 'Tab') return;

        const focusable = Array.from(
            navList.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el instanceof HTMLElement);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    };

    if (hamburger && navList) {
        syncMobileNavState();

        hamburger.addEventListener('click', () => {
            if (!isMobileViewport()) return;
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
            if (event.key === 'Escape' && isMobileViewport()) closeMobileMenu();
        });

        document.addEventListener('keydown', trapMenuFocus);
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                event.preventDefault();
                return;
            }

            const target = getHashTarget(href);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
            if (window.location.hash !== href) {
                window.history.replaceState(null, '', href);
            }
        });
    });

    const revealEls = Array.from(document.querySelectorAll('.reveal')).filter((el) => !el.closest('#hero'));
    revealEls.forEach((el, index) => {
        const isHeading = el.classList.contains('section-heading');
        const isSpotlight = el.classList.contains('spotlight-section');

        let revealVariant = 'rise';
        if (isHeading) {
            revealVariant = 'soft';
        } else if (isSpotlight) {
            revealVariant = index % 2 === 0 ? 'left' : 'right';
        } else if (index % 4 === 1) {
            revealVariant = 'left';
        } else if (index % 4 === 2) {
            revealVariant = 'right';
        } else if (index % 5 === 0) {
            revealVariant = 'soft';
        }

        const delay = Math.min(36 + index * 34, 360);
        const duration = revealVariant === 'soft' ? 620 : 760;
        el.dataset.reveal = revealVariant;
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        el.style.setProperty('--reveal-duration', `${duration}ms`);
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
            isMobileViewport()
                ? { threshold: 0.1, rootMargin: '0px 0px -22px 0px' }
                : { threshold: 0.16, rootMargin: '0px 0px -64px 0px' }
        );

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    const spotlightSections = Array.from(document.querySelectorAll('.spotlight-section'));
    const setActiveSpotlight = (activeEl) => {
        spotlightSections.forEach((section) => {
            section.classList.toggle('active', section === activeEl);
        });
    };

    if (spotlightSections.length) {
        if ('IntersectionObserver' in window) {
            const spotlightObserver = new IntersectionObserver(
                (entries) => {
                    const visibleEntries = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                    if (visibleEntries.length) {
                        setActiveSpotlight(visibleEntries[0].target);
                    }
                },
                { threshold: [0.32, 0.55, 0.78], rootMargin: '-22% 0px -28% 0px' }
            );

            spotlightSections.forEach((section) => spotlightObserver.observe(section));
        } else {
            setActiveSpotlight(spotlightSections[0]);
        }
    }

    const observedTargets = navAnchors
        .map((anchor) => {
            const href = anchor.getAttribute('href');
            if (!href || href.length < 2) return null;
            const target = getHashTarget(href);
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

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (!hash || hash.length < 2) return;
        markActiveById(hash.slice(1));
    });

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
    const requestField = document.getElementById('special-requests');
    const requestCounter = document.getElementById('request-counter');

    const clearInvalidState = (control) => {
        control.classList.remove('invalid');
        control.removeAttribute('aria-invalid');
        control.setCustomValidity('');
    };

    const setInvalidState = (control, message) => {
        control.classList.add('invalid');
        control.setAttribute('aria-invalid', 'true');
        control.setCustomValidity(message);
    };

    const validateControl = (control) => {
        // Only validate visible, enabled fields that can have values
        if (control.disabled || control.type === 'hidden' || control.type === 'submit') return true;

        const value = String(control.value || '').trim();

        // Clear previous custom errors first
        control.setCustomValidity('');

        // 1. Required Check
        if (control.required && value.length === 0) {
            setInvalidState(control, 'Please fill out this field.');
            return false;
        }

        // 2. Email Pattern
        if (control.type === 'email' && value.length > 0) {
            const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                setInvalidState(control, 'Enter a valid email address.');
                return false;
            }
        }

        // 3. Phone Pattern
        if (control.name === 'phone' && value.length > 0) {
            const phoneRegex = /^[0-9+\-() ]{8,20}$/;
            if (!phoneRegex.test(value)) {
                setInvalidState(control, 'Enter a valid phone number.');
                return false;
            }
        }

        // 4. Native Browser Validation (minlength, pattern, etc.)
        if (!control.checkValidity()) {
            setInvalidState(control, control.validationMessage || 'Invalid input.');
            return false;
        }

        // Success - clear styling
        clearInvalidState(control);
        return true;
    };

    if (registerForm && registerStatus) {
        // Collect all relevant form controls
        const controls = Array.from(registerForm.elements).filter((el) => {
            return (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement);
        });

        const savedDraft = readFormDraft();
        if (savedDraft) {
            controls.forEach((control) => {
                const nextValue = savedDraft[control.name];
                if (typeof nextValue === 'string' && nextValue) {
                    control.value = nextValue;
                }
            });
        }

        const persistDraft = (() => {
            let timer = 0;
            return () => {
                window.clearTimeout(timer);
                timer = window.setTimeout(() => {
                    const draft = controls.reduce((acc, control) => {
                        const value = String(control.value || '').trim();
                        if (value.length) acc[control.name] = value;
                        return acc;
                    }, {});

                    writeFormDraft(draft);
                }, 160);
            };
        })();

        // --- Shared Modal Elements (Scoped to register-form block) ---
        const modal = document.getElementById('register-modal');
        const modalName = document.getElementById('modal-name');
        const modalEmail = document.getElementById('modal-email');
        const modalPass = document.getElementById('modal-pass');
        const modalTickets = document.getElementById('modal-tickets');
        const passName = document.getElementById('pass-name');
        const passTier = document.getElementById('pass-tier');
        const passQty = document.getElementById('pass-qty');
        const viewPassBtn = document.getElementById('view-pass-btn');
        const viewEmailBtn = document.getElementById('view-email-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalSummaryView = document.getElementById('modal-summary-view');
        const digitalPassPreview = document.getElementById('digital-pass-preview');

        const modalLogsView = document.getElementById('modal-logs-view');

        // Scoped variable to hold registration data for View E-ticket
        let lastConfirmedTicket = readConfirmedTicket();

        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            registerForm.setAttribute('aria-busy', 'true');

            let firstInvalid = null;

            // Clear previous error message
            registerStatus.textContent = "";
            registerStatus.className = 'register-status';

            controls.forEach((el) => {
                const valid = validateControl(el);
                if (!valid && !firstInvalid) {
                    firstInvalid = el;
                }
            });

            if (firstInvalid) {
                // Determine the correct error message
                const errorMsg = firstInvalid.validationMessage || 'Please fill out this field.';
                registerStatus.textContent = errorMsg;
                registerStatus.className = 'register-status error';

                // Focus and ensure field is visible
                firstInvalid.focus({ preventScroll: false });
                setTimeout(() => {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                }, 10);

                console.warn("Validation failed on field:", firstInvalid.name, firstInvalid.validationMessage);
                registerForm.setAttribute('aria-busy', 'false');
                return;
            }

            const formData = new FormData(registerForm);
            const name = String(formData.get('fullName') || 'Guest').trim();
            const emailValue = String(formData.get('email') || '').trim();
            const phoneValue = String(formData.get('phone') || '').trim();
            const cityValue = String(formData.get('city') || '').trim();
            const pass = String(formData.get('passType') || 'Standard').replace('-', ' ').toUpperCase();
            const tickets = String(formData.get('tickets') || '1');


            // Success Transition
            registerStatus.textContent = "Processing secure registration...";
            registerStatus.className = 'register-status';

            setTimeout(async () => {
                const confirmedTicket = {
                    name: name,
                    pass: pass,
                    qty: tickets,
                    email: emailValue,
                    phone: phoneValue,
                    city: cityValue,
                    orderId: 'PX-' + Math.floor(Math.random() * 9000 + 1000),
                    createdAt: new Date().toISOString()
                };

                // --- Save to Firebase ---
                if (db) {
                    try {
                        const registrationsRef = db.collection('registrations');
                        const querySnapshot = await registrationsRef.where('email', '==', emailValue).get();
                        
                        if (!querySnapshot.empty) {
                            registerStatus.textContent = "This email is already registered for an event pass.";
                            registerStatus.className = 'register-status error';
                            registerForm.setAttribute('aria-busy', 'false');
                            return; // Stop execution
                        }
                        await registrationsRef.add(confirmedTicket);
                    } catch (error) {
                        console.error('Firebase Error:', error);
                        console.warn('Continuing offline configuration due to Firebase error.');
                    }
                }

                if (modal && modalName && modalPass && modalTickets) {
                    modalName.textContent = name;
                    if (modalEmail) modalEmail.textContent = emailValue;
                    modalPass.textContent = pass;
                    modalTickets.textContent = tickets;

                    let ticketViewUrl = '';
                    let ticketDownloadUrl = '';
                    try {
                        ticketViewUrl = buildTicketUrl(confirmedTicket, { forEmail: true });
                        ticketDownloadUrl = buildTicketUrl(confirmedTicket, { forEmail: true, autodownload: 'pdf' });
                    } catch (error) {
                        console.error(error);
                        registerStatus.textContent = "Ticket link generation failed. Please try again.";
                        registerStatus.className = 'register-status error';
                        registerForm.setAttribute('aria-busy', 'false');
                        return;
                    }

                    // Populate Pass Mockup
                    if (passName) passName.textContent = name;
                    if (passTier) passTier.textContent = pass;
                    if (passQty) passQty.textContent = `${tickets} PASSES`;

                    // Generate Dynamic QR Code
                    const passQrContainer = document.getElementById('pass-qr-container');
                    if (passQrContainer && typeof QRCode !== 'undefined') {
                        passQrContainer.innerHTML = ''; // clear static SVG
                        new QRCode(passQrContainer, {
                            text: confirmedTicket.orderId,
                            width: 80,
                            height: 80,
                            colorDark : "#050812",
                            colorLight : "#ffffff",
                            correctLevel : QRCode.CorrectLevel.L
                        });
                        const qrLabel = document.createElement('small');
                        qrLabel.textContent = 'Scan at gate';
                        passQrContainer.appendChild(qrLabel);
                        
                        setTimeout(() => {
                            const qrImg = passQrContainer.querySelector('img');
                            if(qrImg) {
                                qrImg.style.display = 'block';
                                qrImg.style.margin = '0 auto';
                                qrImg.style.borderRadius = '4px';
                            }
                        }, 50);
                    }

                    modal.hidden = false;
                    modal.setAttribute('aria-hidden', 'false');
                    document.body.style.overflow = 'hidden';

                    // Simulate Automation Logs
                    const logEmail = document.getElementById('log-email');
                    const logSms = document.getElementById('log-sms');
                    const logLiveMail = document.getElementById('log-live-mail');

                    setTimeout(() => logEmail?.classList.add('active'), 800);
                    setTimeout(() => logSms?.classList.add('active'), 1800);
                    setTimeout(() => logLiveMail?.classList.add('active'), 2800);

                    // ---- Real Email Dispatch (EmailJS) ----
                    // IMPORTANT: EmailJS template must use {{ticket_view_url}} for CTA href.
                    if (typeof emailjs !== 'undefined') {
                        emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, {
                            to_name: name,
                            to_email: emailValue,
                            pass_type: pass,
                            ticket_qty: tickets,
                            order_id: 'PX-' + Math.floor(Math.random() * 9000 + 1000),
                            ticket_view_url: ticketViewUrl,
                            ticket_download_url: ticketDownloadUrl,
                            ticket_url: ticketViewUrl,
                            download_url: ticketDownloadUrl,
                            link: ticketViewUrl,
                            url: ticketViewUrl,
                            ticket_route: CONFIG.APP.TICKET_ROUTE,
                            support_url: CONFIG.APP.SUPPORT_URL
                        }).then(() => {
                            console.log("SUCCESS: Real Email Sent!");
                        }, (error) => {
                            console.log("FAILED: Check Public Key at EmailJS.com", error);
                            registerStatus.textContent = "Registration confirmed, but email delivery failed. Use View E-ticket.";
                            registerStatus.className = 'register-status error';
                        });
                    } else {
                        registerStatus.textContent = "Email service unavailable. Use View E-ticket to access your ticket.";
                        registerStatus.className = 'register-status';
                    }

                    // Store confirmation data for View E-ticket
                    lastConfirmedTicket = confirmedTicket;
                    writeConfirmedTicket(lastConfirmedTicket);

                    // Save to purchase history
                    addToHistory(confirmedTicket);

                    if (modalSummaryView) modalSummaryView.hidden = true;
                    if (digitalPassPreview) digitalPassPreview.hidden = false;
                    if (viewPassBtn) viewPassBtn.textContent = "Back to Summary";
                } else {
                    console.warn("Missing one or more modal elements. Check IDs: register-modal, modal-name, modal-pass, modal-tickets.");
                }

                registerForm.reset();
                writeFormDraft(null);
                registerForm.setAttribute('aria-busy', 'false');
                registerStatus.textContent = "";
            }, 1200);
        });

        // Modal View Toggle (View Wallet Pass)
        if (viewPassBtn && digitalPassPreview && modalSummaryView && modalLogsView) {
            viewPassBtn.addEventListener('click', () => {
                const isViewingPass = !digitalPassPreview.hidden;
                if (!isViewingPass) {
                    digitalPassPreview.hidden = false;
                    modalSummaryView.hidden = true;
                    modalLogsView.hidden = true;
                    viewPassBtn.textContent = "Back to Summary";
                } else {
                    digitalPassPreview.hidden = true;
                    modalSummaryView.hidden = false;
                    modalLogsView.hidden = false;
                    viewPassBtn.textContent = "Wallet Pass";
                }
            });
        }

        // View E-ticket (External Page)
        if (viewEmailBtn) {
            viewEmailBtn.addEventListener('click', () => {
                if (lastConfirmedTicket) {
                    try {
                        const url = buildTicketUrl(lastConfirmedTicket, { forEmail: false });
                        window.open(url, '_blank');
                    } catch (err) {
                        console.error("View E-ticket failed:", err);
                        viewEmailBtn.textContent = "Error Opening";
                    }
                }
            });
        }

        // Close Modal Logic
        if (modal && modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                modal.classList.add('fade-out');
                setTimeout(() => {
                    modal.hidden = true;
                    modal.setAttribute('aria-hidden', 'true');
                    modal.classList.remove('fade-out');
                    document.body.style.overflow = '';

                    // Reset views for next time
                    if (digitalPassPreview) digitalPassPreview.hidden = true;
                    if (modalSummaryView) modalSummaryView.hidden = false;
                    if (modalLogsView) modalLogsView.hidden = false;
                    if (viewEmailBtn) viewEmailBtn.textContent = "View E-ticket";

                    document.getElementById('log-email')?.classList.remove('active');
                    document.getElementById('log-sms')?.classList.remove('active');
                }, 400);
            });
        }

        registerForm.addEventListener('blur', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
            validateControl(target);
        }, true);

        registerForm.addEventListener('change', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
            validateControl(target);
            persistDraft();
        });

        registerForm.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
            validateControl(target);
            persistDraft();

            if (registerStatus.textContent && !target.classList.contains('invalid')) {
                registerStatus.textContent = '';
                registerStatus.className = 'register-status';
            }
        });
    }

    /* ========== Account System ========== */
    const accountBadge = document.getElementById('account-badge');
    const accountBadgeLabel = document.getElementById('account-badge-label');
    const accountModal = document.getElementById('account-modal');
    const accountForm = document.getElementById('account-form');
    const accountStatus = document.getElementById('account-status');
    const accountModalClose = document.getElementById('account-modal-close');
    const accountModalTitle = document.getElementById('account-modal-title');
    const accountProfileView = document.getElementById('account-profile-view');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayEmail = document.getElementById('profile-display-email');
    const profileDisplayPhone = document.getElementById('profile-display-phone');
    const logoutBtn = document.getElementById('logout-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const authGate = document.getElementById('auth-gate');
    const authGateBtn = document.getElementById('auth-gate-btn');

    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');
    const historyClearBtn = document.getElementById('history-clear-btn');
    const historyModalClose = document.getElementById('history-modal-close');

    const openModal = (modal) => {
        if (!modal) return;
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.hidden = true;
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('fade-out');
            document.body.style.overflow = '';
        }, 400);
    };

    const syncAccountUI = () => {
        const profile = readUserProfile();
        const isLoggedIn = !!profile;

        // Header badge
        if (accountBadge && accountBadgeLabel) {
            if (isLoggedIn) {
                const first = profile.name.charAt(0).toUpperCase();
                accountBadgeLabel.textContent = profile.name.split(' ')[0];
                accountBadge.classList.add('logged-in');
            } else {
                accountBadgeLabel.textContent = 'Sign In';
                accountBadge.classList.remove('logged-in');
            }
        }

        // Auth gate on ticket form
        if (authGate) {
            authGate.hidden = isLoggedIn;
        }

        // Account modal: toggle form vs profile view
        if (accountForm && accountProfileView) {
            if (isLoggedIn) {
                accountForm.hidden = true;
                accountProfileView.hidden = false;
                if (accountModalTitle) accountModalTitle.textContent = 'Your Profile';
                if (profileAvatar) profileAvatar.textContent = profile.name.charAt(0).toUpperCase();
                if (profileDisplayName) profileDisplayName.textContent = profile.name;
                if (profileDisplayEmail) profileDisplayEmail.textContent = profile.email || '---';
                if (profileDisplayPhone) profileDisplayPhone.textContent = profile.phone || '---';
            } else {
                accountForm.hidden = false;
                accountProfileView.hidden = true;
                if (accountModalTitle) accountModalTitle.textContent = 'Join the Phoenix Tribe';
            }
        }

        // Auto-fill ticket form if logged in
        if (isLoggedIn && registerForm) {
            const nameField = registerForm.querySelector('[name="fullName"]');
            const emailField = registerForm.querySelector('[name="email"]');
            const phoneField = registerForm.querySelector('[name="phone"]');
            const cityField = registerForm.querySelector('[name="city"]');
            if (nameField && !nameField.value) nameField.value = profile.name || '';
            if (emailField && !emailField.value) emailField.value = profile.email || '';
            if (phoneField && !phoneField.value) phoneField.value = profile.phone || '';
            if (cityField && !cityField.value) cityField.value = profile.city || '';
        }
    };

    // Initialize account UI
    syncAccountUI();

    // Account badge click -> open account modal
    if (accountBadge) {
        accountBadge.addEventListener('click', () => {
            syncAccountUI();
            openModal(accountModal);
        });
    }

    // Auth gate click -> open account modal
    if (authGateBtn) {
        authGateBtn.addEventListener('click', () => {
            openModal(accountModal);
        });
    }

    // Account form submission
    if (accountForm && accountStatus) {
        accountForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(accountForm);
            const name = String(formData.get('acctName') || '').trim();
            const email = String(formData.get('acctEmail') || '').trim();
            const phone = String(formData.get('acctPhone') || '').trim();
            const city = String(formData.get('acctCity') || '').trim();

            if (!name || name.length < 2) {
                accountStatus.textContent = 'Please enter your full name (min 2 characters).';
                accountStatus.className = 'register-status error';
                return;
            }
            if (!email || !/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                accountStatus.textContent = 'Please enter a valid email address.';
                accountStatus.className = 'register-status error';
                return;
            }
            if (!phone || phone.length < 8) {
                accountStatus.textContent = 'Please enter a valid phone number.';
                accountStatus.className = 'register-status error';
                return;
            }

            const profile = { name, email, phone, city, createdAt: new Date().toISOString() };
            writeUserProfile(profile);
            accountStatus.textContent = 'Account created! Welcome to the Phoenix Tribe!';
            accountStatus.className = 'register-status';
            syncAccountUI();

            setTimeout(() => {
                accountStatus.textContent = '';
            }, 3000);
        });
    }

    // Account modal close
    if (accountModalClose) {
        accountModalClose.addEventListener('click', () => closeModal(accountModal));
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            writeUserProfile(null);
            syncAccountUI();
            if (accountForm) accountForm.reset();
            closeModal(accountModal);
        });
    }

    // History rendering
    const renderHistory = () => {
        if (!historyList || !historyEmpty) return;
        const history = readPurchaseHistory();

        // Remove old ticket cards
        historyList.querySelectorAll('.history-ticket').forEach(el => el.remove());

        if (!history.length) {
            historyEmpty.hidden = false;
            return;
        }

        historyEmpty.hidden = true;

        history.forEach((ticket) => {
            const card = document.createElement('div');
            card.className = 'history-ticket';

            const dateStr = ticket.date ? new Date(ticket.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Unknown';

            card.innerHTML = `
                <div class="history-ticket__header">
                    <span class="history-ticket__id">#${ticket.orderId || 'PX-0000'}</span>
                    <span class="history-ticket__date">${dateStr}</span>
                </div>
                <div class="history-ticket__details">
                    <div class="history-ticket__field">
                        <span class="history-ticket__label">Name</span>
                        <span class="history-ticket__value">${ticket.name || '---'}</span>
                    </div>
                    <div class="history-ticket__field">
                        <span class="history-ticket__label">Pass</span>
                        <span class="history-ticket__value">${ticket.pass || '---'}</span>
                    </div>
                    <div class="history-ticket__field">
                        <span class="history-ticket__label">Qty</span>
                        <span class="history-ticket__value">${ticket.qty || '1'}</span>
                    </div>
                    <div class="history-ticket__field">
                        <span class="history-ticket__label">Email</span>
                        <span class="history-ticket__value">${ticket.email || '---'}</span>
                    </div>
                </div>
                <div class="history-ticket__actions">
                    <button class="btn btn--ghost btn--small history-view-ticket" data-ticket='${JSON.stringify(ticket)}' type="button">View E-Ticket</button>
                </div>
            `;

            // View E-Ticket button
            const viewBtn = card.querySelector('.history-view-ticket');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => {
                    try {
                        const data = JSON.parse(viewBtn.dataset.ticket);
                        const ticketUrl = buildTicketUrl(data, { forEmail: false });
                        window.open(ticketUrl, '_blank', 'noopener');
                    } catch (err) {
                        console.error('Could not open ticket:', err);
                    }
                });
            }

            historyList.appendChild(card);
        });
    };

    // View History button
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            closeModal(accountModal);
            setTimeout(() => {
                renderHistory();
                openModal(historyModal);
            }, 450);
        });
    }

    // History clear
    if (historyClearBtn) {
        historyClearBtn.addEventListener('click', () => {
            writePurchaseHistory([]);
            renderHistory();
        });
    }

    // History modal close
    if (historyModalClose) {
        historyModalClose.addEventListener('click', () => closeModal(historyModal));
    }

    if (requestField && requestCounter) {
        const max = Number(requestField.getAttribute('maxlength')) || 180;
        const syncCounter = () => {
            requestCounter.textContent = `${requestField.value.length} / ${max}`;
        };
        syncCounter();
        requestField.addEventListener('input', syncCounter);
    }

    if (copyAddressBtn && copyAddressStatus && venueAddress) {
        let copyStatusTimer = 0;
        const setCopyStatus = (message, type) => {
            copyAddressStatus.textContent = message;
            copyAddressStatus.className = `map-copy-status ${type}`;
            window.clearTimeout(copyStatusTimer);
            copyStatusTimer = window.setTimeout(() => {
                copyAddressStatus.textContent = '';
                copyAddressStatus.className = 'map-copy-status';
            }, 2600);
        };

        copyAddressBtn.addEventListener('click', async () => {
            const value = venueAddress.textContent ? venueAddress.textContent.trim() : '';
            if (!value) return;

            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(value);
                } else {
                    const fallback = document.createElement('textarea');
                    fallback.value = value;
                    fallback.setAttribute('readonly', '');
                    fallback.style.position = 'absolute';
                    fallback.style.left = '-9999px';
                    document.body.appendChild(fallback);
                    fallback.select();
                    document.execCommand('copy');
                    fallback.remove();
                }
                setCopyStatus('Address copied to clipboard.', 'success');
            } catch {
                setCopyStatus('Unable to copy. Please copy the address manually.', 'error');
            }
        });
    }

    if (addCalendarBtn && calendarStatus) {
        let calendarTimer = 0;
        const setCalendarStatus = (message, type) => {
            calendarStatus.textContent = message;
            calendarStatus.className = `calendar-status ${type}`;
            window.clearTimeout(calendarTimer);
            calendarTimer = window.setTimeout(() => {
                calendarStatus.textContent = '';
                calendarStatus.className = 'calendar-status';
            }, 2800);
        };

        const generateGoogleCalendarUrl = (eventStart, eventEnd, title, location, description) => {
            const start = formatIcsDateUtc(eventStart);
            const end = formatIcsDateUtc(eventEnd);
            const url = new URL('https://www.google.com/calendar/render');
            url.searchParams.append('action', 'TEMPLATE');
            url.searchParams.append('text', title);
            url.searchParams.append('dates', `${start}/${end}`);
            url.searchParams.append('details', description);
            url.searchParams.append('location', location);
            url.searchParams.append('sf', 'true');
            url.searchParams.append('output', 'xml');
            return url.toString();
        };

        addCalendarBtn.addEventListener('click', () => {
            try {
                const fallbackStart = new Date('2026-03-16T17:30:00+05:30');
                const parsedStart = eventDateEl ? new Date(eventDateEl.getAttribute('datetime') || '') : fallbackStart;
                const eventStart = Number.isNaN(parsedStart.getTime()) ? fallbackStart : parsedStart;
                const eventEnd = new Date(eventStart.getTime() + (5.5 * 60 * 60 * 1000));
                const uidDate = formatIcsDateUtc(eventStart).slice(0, 8);
                const eventTitle = 'Rock Night 2026 - Pune Arena';
                const eventLoc = 'Phoenix Concert Grounds, Pune';
                const eventDesc = 'Live concert featuring DJ Blaze, The Metal Shadows, and Aisha Roy.';

                if (CONFIG.UI.CALENDAR_TYPE === 'google') {
                    const gUrl = generateGoogleCalendarUrl(eventStart, eventEnd, eventTitle, eventLoc, eventDesc);
                    window.open(gUrl, '_blank');
                    setCalendarStatus('Opening Google Calendar...', 'success');
                    return;
                }

                const icsContent = [
                    'BEGIN:VCALENDAR',
                    'VERSION:2.0',
                    'PRODID:-//PHOENIX-LIVE-26//Rock Night 2026//EN',
                    'BEGIN:VEVENT',
                    `UID:phoenix-live-26-rock-night-${uidDate}@vishh70.github.io`,
                    `DTSTAMP:${formatIcsDateUtc(new Date())}`,
                    `DTSTART:${formatIcsDateUtc(eventStart)}`,
                    `DTEND:${formatIcsDateUtc(eventEnd)}`,
                    `SUMMARY:${eventTitle}`,
                    `LOCATION:${eventLoc.replace(/,/g, '\\,')}`,
                    `DESCRIPTION:${eventDesc.replace(/,/g, '\\,')}`,
                    'END:VEVENT',
                    'END:VCALENDAR'
                ].join('\r\n');

                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rock-night-${eventStart.getFullYear()}.ics`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);

                setCalendarStatus('Calendar file downloaded. Import it in Google/Outlook Calendar.', 'success');
            } catch {
                setCalendarStatus('Unable to generate calendar file right now.', 'error');
            }
        });
    }

    if (faqSearch && faqDetails.length) {
        const runFaqFilter = () => {
            const term = faqSearch.value.trim().toLowerCase();
            let visibleCount = 0;

            faqDetails.forEach((item) => {
                const summary = item.querySelector('summary');
                const answer = item.querySelector('p');
                const haystack = `${summary ? summary.textContent : ''} ${answer ? answer.textContent : ''}`.toLowerCase();
                const visible = term.length === 0 || haystack.includes(term);
                item.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            if (faqEmptyState) {
                faqEmptyState.hidden = visibleCount > 0;
            }
        };

        faqSearch.addEventListener('input', runFaqFilter);
    }

    if (plannerList && plannerItems.length) {
        let plannerTimer = 0;
        const setPlannerStatus = (message, type) => {
            if (!plannerStatus) return;
            plannerStatus.textContent = message;
            plannerStatus.className = `planner-status ${type}`;
            window.clearTimeout(plannerTimer);
            plannerTimer = window.setTimeout(() => {
                plannerStatus.textContent = '';
                plannerStatus.className = 'planner-status';
            }, 2200);
        };

        const syncPlannerVisual = () => {
            plannerItems.forEach((item) => {
                const container = item.closest('li');
                if (container) {
                    container.classList.toggle('done', item.checked);
                }
            });
        };

        const updatePlannerProgress = () => {
            const total = plannerItems.length;
            const done = plannerItems.filter((item) => item.checked).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            if (plannerProgressText) {
                plannerProgressText.textContent = `${done} / ${total} complete`;
            }
            if (plannerProgressFill) {
                plannerProgressFill.style.width = `${pct}%`;
            }
        };

        const savePlanner = () => {
            const state = plannerItems.reduce((acc, item) => {
                acc[item.dataset.plan] = item.checked;
                return acc;
            }, {});
            writePlannerState(state);
        };

        const saved = readPlannerState();
        if (saved) {
            plannerItems.forEach((item) => {
                const key = item.dataset.plan;
                if (!key) return;
                if (typeof saved[key] === 'boolean') {
                    item.checked = saved[key];
                }
            });
        }
        syncPlannerVisual();
        updatePlannerProgress();

        plannerItems.forEach((item) => {
            item.addEventListener('change', () => {
                syncPlannerVisual();
                updatePlannerProgress();
                savePlanner();
                setPlannerStatus('Checklist saved.', 'success');
            });
        });

        if (plannerResetBtn) {
            plannerResetBtn.addEventListener('click', () => {
                plannerItems.forEach((item) => {
                    item.checked = false;
                });
                syncPlannerVisual();
                updatePlannerProgress();
                writePlannerState(null);
                setPlannerStatus('Checklist reset.', 'success');
            });
        }
    }

    const reducedMotionEnabled = prefersReducedMotion();
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (!reducedMotionEnabled && !prefersReducedData() && hasFinePointer) {
        const heroVisual = document.querySelector('.hero__visual');
        const heroImageWrap = heroVisual ? heroVisual.querySelector('.hero__image-wrap') : null;
        if (heroVisual && heroImageWrap) {
            let parallaxFrame = 0;
            let targetX = 0;
            let targetY = 0;
            let easedX = 0;
            let easedY = 0;

            const renderHeroParallax = () => {
                parallaxFrame = 0;
                easedX += (targetX - easedX) * 0.16;
                easedY += (targetY - easedY) * 0.16;

                heroImageWrap.style.setProperty('--hero-offset-x', `${easedX.toFixed(2)}px`);
                heroImageWrap.style.setProperty('--hero-offset-y', `${easedY.toFixed(2)}px`);

                if (Math.abs(targetX - easedX) > 0.05 || Math.abs(targetY - easedY) > 0.05) {
                    parallaxFrame = window.requestAnimationFrame(renderHeroParallax);
                }
            };

            const queueHeroParallaxFrame = () => {
                if (parallaxFrame) return;
                parallaxFrame = window.requestAnimationFrame(renderHeroParallax);
            };

            heroVisual.addEventListener('pointermove', (event) => {
                const rect = heroVisual.getBoundingClientRect();
                const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
                const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
                targetX = normalizedX * 10;
                targetY = normalizedY * 8;
                queueHeroParallaxFrame();
            });

            heroVisual.addEventListener('pointerleave', () => {
                targetX = 0;
                targetY = 0;
                queueHeroParallaxFrame();
            });
        }

        const tiltElements = Array.from(document.querySelectorAll('.spotlight-section, .venue-big-display, .register-panel'));

        tiltElements.forEach((el) => {
            let frame = 0;
            let latestX = 0;
            let latestY = 0;

            const renderTilt = () => {
                frame = 0;
                // Limit tilt angle for larger elements
                const maxTilt = el.classList.contains('spotlight-section') ? 6 : 3;
                el.style.setProperty('transform', `perspective(1200px) rotateX(${-latestY * maxTilt}deg) rotateY(${latestX * maxTilt}deg)`);
                el.style.setProperty('--mouse-x', `${(latestX + 0.5) * 100}%`);
                el.style.setProperty('--mouse-y', `${(latestY + 0.5) * 100}%`);
            };

            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                latestX = (event.clientX - rect.left) / rect.width - 0.5;
                latestY = (event.clientY - rect.top) / rect.height - 0.5;

                if (!frame) frame = window.requestAnimationFrame(renderTilt);
            });

            el.addEventListener('pointerleave', () => {
                if (frame) window.cancelAnimationFrame(frame);
                frame = 0;
                el.style.setProperty('transform', 'perspective(1200px) rotateX(0deg) rotateY(0deg)');
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

    const registerServiceWorker = () => {
        if (!('serviceWorker' in navigator)) return;

        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        if (window.location.protocol !== 'https:' && !isLocalhost) return;

        const register = () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {
                // Service worker is optional enhancement.
            });
        };

        if (document.readyState === 'complete') {
            register();
            return;
        }

        window.addEventListener('load', register, { once: true });
    };

    setHeaderProgress();
    registerServiceWorker();
    window.addEventListener('scroll', onScroll, { passive: true });
    let resizeFrame = 0;
    window.addEventListener('resize', () => {
        if (resizeFrame) return;
        resizeFrame = window.requestAnimationFrame(() => {
            setHeaderProgress();
            syncMobileNavState();
        });
    });

    // --- Custom Cursor Tracker ---
    const customCursor = document.getElementById('custom-cursor');
    if (customCursor && hasFinePointer && !reducedMotionEnabled) {
        document.addEventListener('mousemove', (e) => {
            customCursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
        });
        
        // Add hover effects to interactable elements
        const interactables = document.querySelectorAll('a, button, input, textarea, select, .glitch-hover, .artist-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => customCursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => customCursor.classList.remove('hovering'));
        });
    } else if (customCursor) {
        customCursor.style.display = 'none'; // hide on touch devices
    }
    
    // --- Ambient Audio Toggle ---
    const audioToggle = document.getElementById('audio-toggle');
    const ambientAudio = document.getElementById('ambient-audio');
    const audioIconOff = document.getElementById('audio-icon-off');
    const audioIconOn = document.getElementById('audio-icon-on');
    
    // --- Artist Data & Modals ---
    const ARTIST_DATA = {
        'dj-blaze': {
            name: 'DJ Blaze',
            bio: 'Electronic phenomenon DJ Blaze brings his high-octane "Thunder-Tech" sound to Phoenix Live \'26. Known for record-breaking sets at Tomorrowland, he promises an immersive neon experience.',
            spotify: 'https://open.spotify.com/embed/track/2S9idp6o3Y07C9p0X97Gis?utm_source=generator'
        },
        'metal-shadows': {
            name: 'The Metal Shadows',
            bio: 'The titans of industrial rock. The Metal Shadows blend heavy riffs with cinematic cyberpunk visuals. Expect an earth-shattering performance filled with pyrotechnics and energy.',
            spotify: 'https://open.spotify.com/embed/track/47Yidp6o3Y07C9p0X97Gis?utm_source=generator'
        },
        'aisha-roy': {
            name: 'Aisha Roy',
            bio: 'Aisha Roy is redefining retro-future pop. Her soulful vocals combined with synth-wave textures have topped the charts globally. Join the "Pink Nebula" tour experience.',
            spotify: 'https://open.spotify.com/embed/track/0VjIj9R9nsEs7m6YmYvS7Y?utm_source=generator'
        }
    };

    const initArtistModals = () => {
        const modal = document.getElementById('artist-modal');
        const closeBtn = document.getElementById('artist-modal-close');
        const artistCards = document.querySelectorAll('.artist-card');
        if (!modal || !closeBtn) return;
        artistCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return; // Don't trigger if social clicked
                const artistId = card.dataset.artist;
                const data = ARTIST_DATA[artistId];
                if (!data) return;
                document.getElementById('artist-modal-img').src = card.querySelector('img').src;
                document.getElementById('artist-modal-name').textContent = data.name;
                document.getElementById('artist-modal-bio').textContent = data.bio;
                
                // Restore high-end music player with a fallback to the CTA button
                const spotifyContainer = document.getElementById('spotify-container');
                spotifyContainer.innerHTML = `
                    <div class="spotify-embed-wrapper">
                        <iframe src="${data.spotify}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe>
                        <div class="spotify-cta minimal">
                            <a href="${data.spotify.replace('/embed', '')}" target="_blank" rel="noopener noreferrer" class="btn btn--spotify-link">
                                Open in Spotify
                            </a>
                        </div>
                    </div>
                `;
                modal.hidden = false;
                document.body.style.overflow = 'hidden';
            });
        });
        const closeModal = () => {
            modal.hidden = true;
            document.body.style.overflow = '';
            document.getElementById('spotify-container').innerHTML = '';
        };
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    };

    // --- Sound Reactive Audio Logic ---
    let audioCtx, analyzer, dataArray;
    const initAudioReactive = () => {
        if (ambientAudio && audioToggle) {
            audioToggle.addEventListener('click', () => {
                if (!audioCtx) {
                    try {
                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        analyzer = audioCtx.createAnalyser();
                        const source = audioCtx.createMediaElementSource(ambientAudio);
                        source.connect(analyzer);
                        analyzer.connect(audioCtx.destination);
                        analyzer.fftSize = 64;
                        dataArray = new Uint8Array(analyzer.frequencyBinCount);
                    } catch (err) {
                        console.warn("Audio Context init failed (likely already initialized):", err);
                    }
                }
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            }, { once: true });
        }
    };
    
    if (audioToggle && ambientAudio) {
        audioToggle.addEventListener('click', () => {
            if (ambientAudio.paused) {
                ambientAudio.volume = 0.2; // keeping it low & ambient
                ambientAudio.play().then(() => {
                    audioToggle.classList.add('is-playing');
                    audioIconOff.style.display = 'none';
                    audioIconOn.style.display = 'block';
                    audioToggle.setAttribute('title', 'Pause Ambient Sound');
                }).catch(e => console.log('Audio play failed:', e));
            } else {
                ambientAudio.pause();
                audioToggle.classList.remove('is-playing');
                audioIconOn.style.display = 'none';
                audioIconOff.style.display = 'block';
                audioToggle.setAttribute('title', 'Play Ambient Sound');
            }
        });
    }
    // --- Ember Particle Canvas System ---
    const emberCanvas = document.getElementById('ember-canvas');
    if (emberCanvas && !prefersReducedMotion() && !prefersReducedData()) {
        const ctx = emberCanvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouseX = 0;
        let animateFrameId = 0;
        
        const resizeCanvas = () => {
            width = emberCanvas.parentElement.clientWidth;
            height = emberCanvas.parentElement.clientHeight;
            emberCanvas.width = width;
            emberCanvas.height = height;
        };

        const initParticles = () => {
            particles = [];
            const count = Math.min(width / 12, 60); // Responsive count
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2.5 + 0.5,
                    speedY: Math.random() * -1 - 0.5,
                    speedX: Math.random() * 2 - 1,
                    opacity: Math.random() * 0.8 + 0.2, // Min opacity 0.2
                    life: Math.random() * 100
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, width, height);

            let bassIntensity = 1;
            if (analyzer && !ambientAudio.paused) {
                analyzer.getByteFrequencyData(dataArray);
                const bass = dataArray.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
                bassIntensity = 1 + (bass / 255) * 1.5;
            }
            
            particles.forEach((p) => {
                p.y += p.speedY * bassIntensity;
                p.x += p.speedX + (mouseX * 0.05); // slight sway with mouse
                p.life -= 0.5;

                if (p.y < -10 || p.x < -10 || p.x > width + 10 || p.life <= 0) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                    p.life = 100;
                    p.opacity = Math.random() * 0.8 + 0.2;
                }

                // Make embers glow based on life
                const currentOpacity = (p.opacity * Math.sin((p.life / 100) * Math.PI)).toFixed(2);
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (bassIntensity > 1.2 ? bassIntensity : 1), 0, Math.PI * 2);
                // Ember color: mix of orange/red/yellow
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 50, ${Math.max(0, currentOpacity)})`; 
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(255, 100, 0, ${Math.max(0, currentOpacity)})`;
                ctx.fill();
            });

            animateFrameId = window.requestAnimationFrame(drawParticles);
        };

        // Mouse tracking for breeze effect
        document.addEventListener('pointermove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
        });

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        resizeCanvas();
        initParticles();
        drawParticles();
    }

    // Start Phase 3 Features
    if (typeof initHypeMeter === 'function') initHypeMeter();
    if (typeof initParallax === 'function') initParallax();
    if (typeof initArtistModals === 'function') initArtistModals();
    if (typeof initAudioReactive === 'function') initAudioReactive();
})();
