# Live Concert Event Landing Page (EPIC-2003)

Premium, responsive, single-page event website built for the CrescifyX internship sprint deliverable.

This implementation maps directly to:
- `CIMS-14` Event Hero Page
- `CIMS-15` Artist Lineup Section
- `CIMS-16` Event Details Section

## Live Demo

- GitHub Pages: `https://vishh70.github.io/Live-Concert-Event-Landing-Page/`

If your site does not open:
1. Go to repository `Settings > Pages`
2. Set `Source` = `Deploy from a branch`
3. Select branch `main` and folder `/ (root)`
4. Remove any invalid custom domain and save

## Event Snapshot

- Event: `Rock Night 2026 - Pune Arena`
- Date: `March 16, 2026`
- Venue: `Phoenix Concert Grounds, Pune`
- Promoter: `XYZ Entertainment Group`
- Featured Artists:
  - DJ Blaze
  - The Metal Shadows
  - Aisha Roy

## Key Features

### CIMS-14: Hero Section
- Large hero layout with bold event title and featured lineup
- Event date and venue displayed above the fold
- Countdown block with clear visual cells
- CTA group for Register, Explore Artists, and View Schedule

### CIMS-15: Artist Lineup
- Three artist spotlight cards
- Each card includes:
  - artist name
  - role
  - short bio
  - promo image
  - social links as icons only (Instagram, YouTube, X)
- Hover and motion polish with reduced-motion fallback

### CIMS-16: Event Details
- Full schedule timeline
- Schedule notes for stage flow and transitions
- Venue layout image with descriptive `alt` text
- Embedded Google Maps location
- Promoter block
- Event rules
- FAQ accordion using semantic `<details>/<summary>`
- Added detailed logistics:
  - event essentials
  - operations and safety flow
  - travel and parking guidance
  - support and gate flow notes

### Registration System
- Form fields:
  - full name
  - email
  - phone
  - ticket count
  - preferred pass
  - city (optional)
  - special requests (optional)
- Client-side validation and inline status messaging
- Draft persistence via `localStorage`
- Live character counter for special requests
- Registration trust indicators for response and support assurance

### UX + Front-End Enhancements
- Sticky glassmorphic header with active-section highlighting
- Scroll progress indicator
- Responsive mobile navigation with focus handling
- Scroll reveal sequencing and artist spotlight effects
- Scroll-to-top button
- Copy venue address to clipboard helper
- One-click `Add To Calendar` export (`.ics`)
- Calendar export auto-uses the live event datetime from page metadata
- FAQ live search filter with empty-state feedback
- Personal event planner checklist with local persistence
- Planner completion progress tracking
- SEO/event metadata using JSON-LD (`MusicEvent`)
- PWA basics:
  - `manifest.webmanifest`
  - `sw.js` static shell caching

### Design + Color System
- Dark premium base with layered gradients for depth
- Multi-accent palette:
  - Electric Cyan for active/focus states
  - Violet/Plum for primary branding
  - Rose/Amber for highlights and energy accents
- Improved contrast in headings, cards, forms, and map interactions
- Consistent CTA hierarchy between solid and ghost buttons

## Tech Stack

- HTML5 (semantic markup)
- CSS3 (custom properties, responsive layout, animation)
- Vanilla JavaScript (DOM interactions, validation, storage, accessibility)
- GitHub Pages (deployment)

No React/Vue/Tailwind/Bootstrap used.

## Accessibility

- Semantic landmarks and heading hierarchy
- Visible keyboard focus styles (`:focus-visible`)
- Skip link for keyboard users
- ARIA labels for icon-only social controls
- Live region updates for form/copy status
- `prefers-reduced-motion` support

## Performance Notes

- Local optimized image assets
- Lazy loading on non-critical media
- Lightweight vanilla JS
- Service worker caching for static shell files
- Section content visibility optimization in CSS

## Project Structure

```text
Live Concert Event Landing Page/
├─ assets/
│  ├─ aisha-roy.webp
│  ├─ dj-blaze.webp
│  ├─ metal-shadows.webp
│  ├─ venue-map.svg
│  └─ favicon.svg
├─ electric_dragon_concert_hero_1772381931809.png
├─ pro_venue_map_pune_arena_1772383111373.png
├─ index.html
├─ styles.css
├─ script.js
├─ manifest.webmanifest
├─ sw.js
└─ README.md
```

## Run Locally

Open directly:
- Double-click `index.html`

Or run a local server:

```powershell
python -m http.server 5500
```

Then visit:
- `http://localhost:5500`

## Deploy to GitHub Pages

1. Commit and push to `main`
2. Open `Settings > Pages`
3. Choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save and wait for deployment

## Jira Mapping

| Jira | Requirement | Status |
|---|---|---|
| CIMS-14 | Hero banner with event + artist visibility | Implemented |
| CIMS-14 | Event name/date/venue visible | Implemented |
| CIMS-14 | Countdown visual block | Implemented |
| CIMS-15 | Artist name, bio, promo image | Implemented |
| CIMS-15 | Social handles as icons only | Implemented |
| CIMS-16 | Schedule section | Implemented |
| CIMS-16 | Venue layout image | Implemented |
| CIMS-16 | Promoter section | Implemented |
| CIMS-16 | Event rules + FAQs | Implemented |

## Author

- Vishh70

## License

Currently for internship/educational submission usage.
