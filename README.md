# Simple Macro Guide

Static educational site for **simplemacroguide.com**  
Brand: Simple Macro Guide · Entity: Joshua Israel Ventures LLC

## Local preview

From this directory:

```bash
cd /path/to/simplemacroguide
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in a browser.

Or with Python 2 (legacy): `python -m SimpleHTTPServer 8080`.

No build step is required. HTML, CSS, and JS are ready to serve as-is.

## Namecheap / cPanel `public_html` upload

1. Log in to Namecheap (or your host) cPanel.
2. Open **File Manager** → navigate to `public_html` (or the subdomain folder for simplemacroguide.com).
3. Upload **all contents** of this project folder (not necessarily the parent folder name itself):
   - `index.html` at the web root
   - folders: `topics/`, `glossary/`, `countries/`, `calculators/`, `contact/`, `disclaimer/`, `css/`, `js/`
   - `robots.txt`, `sitemap.xml`
4. Prefer uploading a ZIP of the contents and extracting in File Manager if many files.
5. Ensure the domain’s document root points at that `public_html` (or subdomain directory).
6. Visit `https://simplemacroguide.com/` and spot-check: home, a topic page, glossary anchors, inflation calculator, and contact mailto subject `[Contact: simplemacroguide]`.

Optional: add a host-level HTTPS redirect (cPanel → Domains / Force HTTPS).

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Home |
| `topics/` | Index + 6 pillar articles |
| `glossary/` | ~30 terms with anchors |
| `countries/` | Index, US, UK snapshots |
| `calculators/` | Index + inflation adjuster |
| `contact/` | Mailto contact form |
| `disclaimer/` | Educational / not advice |
| `css/styles.css` | Shared styles |
| `js/main.js` | Nav, contact mailto, calculator |
| `robots.txt` / `sitemap.xml` | Crawlers |

## Notes

- Content is original educational prose. Not investment advice.
- Country pages link to World Bank, ONS, and FRED; illustrative figures are labelled EXAMPLE.
- Inflation calculator uses compound average rate; works offline.

## Content map (SEO expansion)

- `/explainers/` — long-form original posts (Phillips curve, QE, real rates, PPP, fiscal multipliers, recessions)
- `/data/` — how to read CPI via FRED/ONS
- `/sources/` — primary source directory
- `/llms.txt` — machine-readable site summary
