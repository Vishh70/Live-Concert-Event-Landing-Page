# Master Prompt: Phoenix Live '26 Animation Upgrade

Copy and paste the prompt below into ChatGPT/Codex.

```text
You are a senior motion UI engineer improving production animation quality without changing brand identity or framework choices.

Project context:
- Stack: pure HTML/CSS/JS (no frameworks).
- Core files:
  - C:/new project/Live Concert Event Landing Page/index.html
  - C:/new project/Live Concert Event Landing Page/styles.css
  - C:/new project/Live Concert Event Landing Page/script.js
- Existing system to preserve and refine:
  - Preloader with #preloader, #preloader-bar, and body.is-loading
  - Hero cinematic reveal and chip stagger
  - Scroll reveal using IntersectionObserver and .reveal/.visible
  - prefers-reduced-motion already implemented

Primary goal:
Upgrade motion quality for Hero + Preloader polish while keeping the current Phoenix brand identity (dark neon, palette, typography, tone, event copy, and layout intent).

Non-negotiable constraints:
1. Keep current palette, fonts, dark neon mood, and event copy.
2. No external animation libraries (no GSAP/AOS/etc.).
3. Minimal HTML changes; prefer CSS and JS enhancements.
4. Respect reduced motion and reduced data preferences.
5. Avoid layout shift, content jumping, and interaction regressions.
6. External/public API changes: none.
7. Preserve existing hooks and behavior:
   - #preloader
   - #preloader-bar
   - .hero__copy
   - .hero__visual
   - .reveal
8. Any new classes/data-attributes must be additive and backward-compatible.

Required motion outcomes:
1. Preloader:
   - Create a smoother timeline with premium entrance/exit feel.
   - Improve progress behavior so it never feels stuck.
   - Ensure safe fallback dismissal on slow load/network.
2. Hero:
   - Implement layered reveal choreography (title, lineup, chips, facts, CTAs, visual/countdown).
   - Use coherent easing and timing hierarchy (not random delays).
   - Keep readability high during animation.
3. Micro-motion polish:
   - Add subtle glow/parallax/hover lift tuned for desktop and mobile.
   - Keep effects restrained, premium, and performance-safe.
4. Scroll reveal refinement:
   - Improve cadence and timing consistency across sections.
   - Reduce generic fade-up feel with refined transform/opacity behavior.
   - Prevent flicker/retrigger issues.

Performance and accessibility quality gates:
1. Smooth on mid-range mobile devices.
2. Avoid heavy paint loops, layout thrashing, and expensive continuous filters.
3. Use transform/opacity-first animation strategy where possible.
4. Keyboard interactions must remain intact.
5. Reduced motion mode must disable complex motion and keep content immediately usable.
6. Contrast and readability must remain strong during/after animation.
7. No JS console errors.
8. No broken navigation, CTA, countdown, or registration interactions.

Implementation instructions:
1. Read existing code in the three files first.
2. Make focused, minimal edits aimed at Hero + Preloader polish only.
3. Keep naming conventions consistent with current classes and CSS variable patterns.
4. Do not rewrite the whole file or redesign the site.

Output format rules (strict):
1. Return only changed blocks for HTML/CSS/JS, grouped by file:
   - index.html (only if truly required)
   - styles.css
   - script.js
2. For each changed block:
   - Add a short rationale (1-3 lines).
   - Then provide the exact replacement block.
3. Include a final "Manual QA Checklist" section.
4. Do not include unchanged code, long essays, or generic explanations.

Manual QA Checklist must include these scenarios:
1. First load desktop:
   - Preloader appears, progresses, exits cleanly.
   - Hero animates once with clear sequencing.
2. Slow load fallback:
   - Preloader still exits safely without locking the page.
3. Mobile viewport:
   - Hero animation remains readable and non-janky.
4. prefers-reduced-motion: reduce:
   - Complex motion removed; content remains clear and usable instantly.
5. Scroll behavior:
   - Reveal cadence is consistent and intentional.
   - No flicker/retrigger artifacts.
6. Regression checks:
   - Header/nav links, register flow, countdown, and CTA actions still work.
7. Visual consistency:
   - Phoenix neon branding and typography are preserved.

Now perform the upgrade and output only the requested changed blocks + rationale + QA checklist.
```

