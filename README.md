# abhishek.bio

A static personal website for Abhishek Chakravarty. This folder contains everything required to host the site: `index.html`, `styles.css`, `script.js`, `theme.js`, `chess.js`, `book.js`, and `assets/`. There are no dependencies, install commands, or build steps.

Open `index.html` in a browser to preview it locally. Edit the text and project links in that file; styling lives in `styles.css`.

## Deploy from GitHub to Cloudflare Pages

Repository: [mkmaker/abhishek](https://github.com/mkmaker/abhishek). The site files live at the repository root.

In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository**, then select this repository. Use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `.` |
| Root directory | Leave blank |
| Environment variables | None |

Save and deploy. Cloudflare publishes the static files and applies `_headers`. Future pushes to `main` publish automatically. Preview changes locally with a static server or open `index.html` directly.

See [Cloudflare’s static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) and [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).

## Connect abhishek.bio

After checking the `pages.dev` deployment, open its **Custom domains → Set up a domain**, enter `abhishek.bio`, and follow the setup prompts. The apex domain must be an active Cloudflare zone in the same account as the Pages project. Use the custom-domain flow before manually pointing DNS to Pages.

Preserve unrelated DNS records, including `commonplace.abhishek.bio`, other subdomains and email. If the domain requires a nameserver move, copy and verify its existing records first. This website only needs the apex `abhishek.bio` connection.

See [Cloudflare’s custom-domain guide](https://developers.cloudflare.com/pages/configuration/custom-domains/). Deployment settings were checked against official documentation on 25 October 2026.

## Site behavior and artwork

The page starts in dark mode. The theme button switches between dark and light and saves the preference in the visitor’s browser. Project rows expand using native browser controls. Intro links to Botflow and OgHero open the matching project story. The page itself has no data submission or analytics. The Starter Story card is a native play button across the full card; clicking its image, title or card text loads YouTube’s privacy-enhanced player. The overlay is removed before the iframe receives focus, so playback controls stay usable. Its separate YouTube link opens the source directly. The Indie Hackers image and all its card text form one link to the article. Both custom HTML/CSS covers use the existing portrait and Youform mark, with no external media request before activation.

The header illustration was edited with the built-in image tool to add a musical keyboard, chess knight, books and a symbolic family keepsake to the original computer/cursor collage. It uses a transparent 1440px WebP. Its exact edit prompt is saved in `assets/builder-collage-personal.webp.json`. The family image is a generic silhouette, not a portrait of the actual family. The real portrait comes from [Youform’s public image](https://youform.com/assets/images/abhishek.jpg), and the official Youform logo comes from [its brand mark](https://youform.com/assets/images/brand-mark.svg). DM Sans is self-hosted with its license.

The personal section includes a playable piano: click or tap its keys, use Enter/Space on a focused key, or use A–K (with W/E/T/Y/U for black notes) while focus is within the instrument. Sound starts only after an explicit key action. Motion includes a single artwork arrival, disclosure transitions, and theme crossfading, with reduced-motion support.

Interviews: [Indie Hackers](https://www.indiehackers.com/post/tech/competing-on-price-to-carve-out-an-18k-mrr-foothold-Hp57IRVPq7v51y4jVDiD), 19 March 2026; [Starter Story](https://www.youtube.com/watch?v=_KaFS4Dxs5k), 2 August 2025. Original video-headline revenue figures are historical publication-time milestones. The publication’s original thumbnail is not used on this site.

The **Play** link opens the personal corner. Chess has its own full-width row with a highlighted goal: reach e5 from a1 in four moves. Drag the knight or choose a marked destination; arrow keys move focus, Enter/Space selects, and Undo/Reset let visitors try again. Its instructions and board stack below 650px.

The bookshelf below contains five favorites supplied by Abhishek. Click any spine to open that book’s author, title, synopsis and official details link where available. These are brief overviews, not the full books. Click the right page to view the next book and the left page to return; the buttons, keyboard Left/Right, and horizontal swipes also work. Navigation stops at the first and last books. Close or Escape returns focus to the selected spine. Source links open independently. The reading region is named for the selected title, and reduced motion removes the page-turn animation and spine lift.

Reading-list titles and author details were checked against [Paulo Coelho’s foundation](https://fondationpaulocoelho.com/books/paulo-coelho-the-alchemist/), [Robert Cialdini](https://cialdini.com/books/influence), [Don’t Sweat the Small Stuff](https://dontsweat.com/books/), and [Rich Dad](https://richdad.com/products/books/rich-dad-poor-dad/). Abhishek confirmed Fatal Volley as a 1994 mystery and suspense novel by Robert S. Ross; its page includes those details. The book illustrations, board, and knight are HTML/CSS and original SVG; they require no external assets or libraries.

The intro’s code, piano and chess icons are local SVG symbols paired with text links. They jump to the projects, playable piano and knight puzzle.

The header includes X and LinkedIn links alongside the theme control, including on phones. The social section shows three equal columns on desktop and stacks into full-width rows below 760px.

## Readability review

The 25 October 2026 review increased headings and project names to semibold, raised ordinary reading text to 16–18px, enlarged instructions and actions, and emphasized the existing Youform statistics. Book descriptions stay at 16px and their pages grow with the content. Piano note labels, keyboard focus, chess destination dots and book page numbers were adjusted to meet their applicable contrast thresholds. Desktop and phone layouts, light/dark themes, local links and keyboard interactions were checked in the local preview. Live domain, cache and response-header checks remain for after deployment.
