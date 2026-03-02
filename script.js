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
        APP: {
            PROD_BASE_URL: "https://vishh70.github.io/Live-Concert-Event-Landing-Page",
            TICKET_ROUTE: "email-template.html",
            SUPPORT_URL: "https://vishh70.github.io/Live-Concert-Event-Landing-Page/#register"
        },
        STORAGE: {
            DRAFT: 'epic2003.registerDraft.v1',
            PLANNER: 'epic2003.planner.v1',
            CONFIRMED_TICKET: 'epic2003.confirmedTicket.v1'
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

    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    if (preloader) {
        document.body.classList.add('is-loading');
        let progress = 0;
        const tick = setInterval(() => {
            progress += Math.random() * 18 + 4;
            if (progress > 92) progress = 92;
            if (preloaderBar) preloaderBar.style.width = `${progress}%`;
        }, 200);

        const dismiss = () => {
            clearInterval(tick);
            if (preloaderBar) preloaderBar.style.width = '100%';
            setTimeout(() => {
                preloader.classList.add('loaded');
                document.body.classList.remove('is-loading');
            }, 400);
            setTimeout(() => preloader.remove(), 1200);
        };

        window.addEventListener('load', () => setTimeout(dismiss, 600), { once: true });
        setTimeout(dismiss, 6000); // safety fallback
    }

    const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    const prefersReducedMotion = () => REDUCED_MOTION_QUERY.matches;
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
        const viewEmailBtn = document.getElementById('view-email-btn');
        const viewPassBtn = document.getElementById('view-pass-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        const modalLogsView = document.getElementById('modal-logs-view');

        // Scoped variable to hold registration data for View E-ticket
        let lastConfirmedTicket = readConfirmedTicket();

        if (viewEmailBtn && lastConfirmedTicket) {
            viewEmailBtn.dataset.name = String(lastConfirmedTicket.name || '');
            viewEmailBtn.dataset.pass = String(lastConfirmedTicket.pass || '');
            viewEmailBtn.dataset.qty = String(lastConfirmedTicket.qty || '');
            viewEmailBtn.dataset.email = String(lastConfirmedTicket.email || '');
            viewEmailBtn.dataset.phone = String(lastConfirmedTicket.phone || '');
            viewEmailBtn.dataset.city = String(lastConfirmedTicket.city || '');
        }

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

            setTimeout(() => {
                if (modal && modalName && modalPass && modalTickets) {
                    modalName.textContent = name;
                    if (modalEmail) modalEmail.textContent = emailValue;
                    modalPass.textContent = pass;
                    modalTickets.textContent = tickets;

                    const confirmedTicket = {
                        name: name,
                        pass: pass,
                        qty: tickets,
                        email: emailValue,
                        phone: phoneValue,
                        city: cityValue
                    };
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

                    // Also update dataset as fallback
                    if (viewEmailBtn) {
                        viewEmailBtn.dataset.name = name;
                        viewEmailBtn.dataset.pass = pass;
                        viewEmailBtn.dataset.qty = tickets;
                        viewEmailBtn.dataset.email = emailValue;
                        viewEmailBtn.dataset.phone = phoneValue;
                        viewEmailBtn.dataset.city = cityValue;
                    }
                } else {
                    console.warn("Missing one or more modal elements. Check IDs: register-modal, modal-name, modal-pass, modal-tickets.");
                }

                registerForm.reset();
                writeFormDraft(null);
                registerForm.setAttribute('aria-busy', 'false');
                registerStatus.textContent = "";
            }, 1200);
        });

        // View E-ticket Listener (Global to this block)
        if (viewEmailBtn) {
            viewEmailBtn.addEventListener('click', () => {
                const data = lastConfirmedTicket || {
                    name: viewEmailBtn.dataset.name || 'Attendee',
                    pass: viewEmailBtn.dataset.pass || 'Standard',
                    qty: viewEmailBtn.dataset.qty || '1',
                    email: viewEmailBtn.dataset.email || '',
                    phone: viewEmailBtn.dataset.phone || '',
                    city: viewEmailBtn.dataset.city || ''
                };

                if (!lastConfirmedTicket && !viewEmailBtn.dataset.name) {
                    console.warn("View E-ticket clicked but no registration data found.");
                }

                try {
                    const ticketUrl = buildTicketUrl(data, { forEmail: false });
                    window.open(ticketUrl, '_blank', 'noopener');
                } catch (error) {
                    console.error(error);
                    registerStatus.textContent = "Unable to open ticket right now. Please try again.";
                    registerStatus.className = 'register-status error';
                }
            });
        }

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

    if (!reducedMotionEnabled && hasFinePointer) {
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
            resizeFrame = 0;
        });
    });
})();
