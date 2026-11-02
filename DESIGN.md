# Notes — A / 阅读手记

This is the approved A editorial-template rewrite with the 2 + 4 brand fusion.
The site is buildless and works both on GitHub Pages and as a local offline copy.

## Design

The homepage follows the accepted A prototype: horizontal `notes` masthead and rule;
“在阅读之间，让想法慢慢生长。” editorial opener; the latest note paired with fine-line
orb artwork; recent reading below, with compact category/search/source controls.
The old archive panel and date spine are not used. English titles stay secondary.

Article pages use one continuous, comfortable reading column. Horizontal branding,
light metadata and rule-separated sections replace the old fixed-left rail and
stacked rounded cards. The right TOC becomes a sticky, collapsible mobile menu.
Original text, provenance, figures, code tabs and tables are preserved.

## Files

- `design.css`: shared palette, typography, masthead, footer and accessibility.
- `home.css` + `catalog.js`: editorial homepage, local search/filter URL state.
- `reader.css` + `reading.js`: shared reader and responsive accessible TOC.
- `*/article-components.css`: only original article-specific diagrams/components.
- `lightbox.css` + `site.js`: standalone image/table viewer and keyboard focus management.
- `logo.svg`, `favicon.svg`, PNG/ICO equivalents: approved deep-purple page-window identity.

No runtime fetch, package install, build, server or external font is required.
Open `index.html` directly. Explicit internal `index.html` links preserve public
article destinations while supporting local `file://` navigation.

## Validation

`python checks/verify-content.py` compares all 30 article main-text streams,
images, tables, code, links and image bytes to baseline
`962999b19cf1dbed2e6ad49046bf144a8304c760`. Results are saved to
`checks/content-preservation.json`. The checker uses Python+lxml and the git
baseline; neither is required to read the site. Shared JS is syntax-checked with
`node --check`. Visual/browser checks are performed separately by the parent task.

## Approved 2 + 4 brand fusion

The deep-purple page-window mark (#583B8D) pairs with a black bold Times/Georgia
`notes` wordmark. Near-white paper (#FBFBFA), neutral rules and black editorial
titles retain the full A layout. Purple is reserved for the logo, interactive
focus/links and selected emphasis. Article-specific illustration colors and code
components are unchanged. The 22px Highlights heading and all 105 separated
lead titles / 47 plain points remain intact.
