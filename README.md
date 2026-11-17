# iamandelib.github.io

My personal portfolio: a single static page with four terminal-style skins (Dark, Light, Matrix, VT320), a command palette and a tiny shell. Plain HTML, CSS and JavaScript, no build step, no trackers. GitHub star counts and dev.to articles refresh live in the browser and fall back to the numbers baked into the page.

## Editing content

- All text lives in `index.html`; each section has an id (`whoami`, `projects`, `work`, `research`, `writing`, `skills`, `education`, `afk`, `contact`).
- Project cards carry `data-repo="<repo>"` and a `data-stars` number; leave `data-stars` out for projects with no stars yet.
- Styles and skins: `css/site.css` (skin tokens are at the top). Behaviour: `js/site.js`.
- Check changes with `pytest -q tests`, and preview with `python3 -m http.server`.
- The social card is `img/og.png` (1200x630).

## Licences

- Code and content: MIT, see `LICENSE`.
- Fonts in `fonts/`: JetBrains Mono and Departure Mono, both SIL Open Font License 1.1 (see the `OFL-*.txt` files there).
