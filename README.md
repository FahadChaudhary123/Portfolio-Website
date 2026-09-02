# Portfolio Website — Muhammad Fahad Taj

A modern, interactive developer portfolio designed to showcase my skills, projects,
experience and achievements. Clean premium design with smooth scroll animations,
interactive project cards, animated text, responsive layouts and engaging transitions.

Built as a single page with **live GitHub integration**. No build step, no
dependencies, no framework — open `index.html` and it works.

**Live:** https://fahadchaudhary123.github.io/Portfolio-Website/

## Quick start

1. Open **`js/config.js`** — it is the only file you need to edit. It is already
   filled in from the résumé: name, role, skills, three jobs, education, ten
   projects and the GitHub username `FahadChaudhary123`.
2. Serve the folder (the GitHub API needs `http://`, not `file://`):

   ```bash
   python -m http.server 5173
   # then open http://localhost:5173
   ```

## What loads from GitHub automatically

| On the page              | From the API                                    |
|--------------------------|-------------------------------------------------|
| Project cards            | `GET /users/:user/repos` — name, description, topics, stars, forks, last push |
| Repo + live-demo links   | `html_url` and `homepage` on each repo          |
| Profile photo            | `avatar_url`                                    |
| Stats row                | public repos, total stars, followers, languages |
| Language breakdown bar   | computed across all public repos                |
| Language filter chips    | computed across all public repos                |

It uses the **public** API, so there is no token and nothing to keep secret.
Responses are cached in `localStorage` for 30 minutes, which keeps you well
inside the 60-requests-per-hour limit. Rate-limit, 404 and offline cases all
render a readable message with a fallback link to your GitHub profile.

### Controlling which repos show

```js
featured:    ["my-best-project"],  // pinned to the top with a "Featured" badge
hidden:      ["dotfiles"],         // never shown
showForks:   false,                // hide forked repos
maxProjects: 12                    // shown before the "Show more" button
```

Repos are ordered: featured first, then most stars, then most recently pushed.
Add **topics** to your repos on GitHub — they render as `#tags` on each card.

## Selected work vs. GitHub grid

The Projects section has two halves:

1. **Selected work** — the curated `projects:` array in `js/config.js`. Every
   project from the résumé lives here, including private and company work.
   Give an entry `repo: "exact-repo-name"` and the card automatically gains a
   source link, star count, language dot and "updated N ago" from the API.
   Entries with no repo show a `status:` label instead ("Company project",
   "Private repo", "In progress"…). `demo:` adds a live-site button.
2. **Live from GitHub** — every public repository, with language filters and a
   language-breakdown bar.

## Your résumé

`assets/resume.pdf` is already in place (exported from
`Muhammad_Fahad_Taj_Resume.docx`). Replace that file whenever you update the
résumé — the button picks it up automatically. Set `resume: ""` to hide it.

## Making the contact form send

**The form delivers nothing until you set one of these up.** Until then it falls
back to opening the visitor's own mail client, which many desktop browsers cannot
do -- so treat this as required, not optional. Pick either option; `js/main.js`
detects which one you configured.

### Option A -- Web3Forms (fastest, ~60 seconds)

1. Open <https://web3forms.com>, enter `fchaudhary043@gmail.com`
2. They email you an access key (a UUID). No account, no password.
3. Paste it into `js/config.js`:

   ```js
   formAccessKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
   formEndpoint:  "https://api.web3forms.com/submit",
   ```

250 messages/month free. The key is visible in your published page source -- that
is by design, it is what lets the form work without a server. Worst case someone
reuses it to mail you; request a new key and swap the line.

### Option B -- Google Apps Script (free, no third party, nothing exposed)

Runs entirely on your own Google account, and can log every message to a Google
Sheet as well as emailing you.

1. Follow the setup comment at the top of `google-apps-script/Code.gs`
2. Deploy it as a Web app with **Execute as: Me** and **Who has access: Anyone**
3. Paste the `/exec` URL into `js/config.js` and leave the key empty:

   ```js
   formAccessKey: "",
   formEndpoint:  "https://script.google.com/macros/s/AKfy.../exec",
   ```

Gmail sends up to 100 emails/day on a free account.

One implementation detail worth knowing: the browser posts to Apps Script as
`text/plain`, not `application/json`. Sending JSON would trigger a CORS preflight,
and Apps Script does not answer `OPTIONS` on its redirect, so the request would
fail. The body is still JSON -- `Code.gs` parses it with `JSON.parse`.

### Shared behaviour

- A hidden honeypot field (`botcheck`) catches naive spam bots. It sits off-screen
  rather than `display:none`, because bots skip hidden inputs. Both the client and
  `Code.gs` check it, and a caught bot sees a normal success message.
- Both providers answer `200` with `{ "success": false }` on a rejected
  submission, so the code checks the JSON body, not just the status code.
- Web3Forms' free tier only accepts browser requests. Testing with `curl` returns
  `403` -- expected, not a broken key.
- Any failure shows your email address rather than a dead end.

## Deploying to GitHub Pages

```bash
git init && git add . && git commit -m "portfolio"
git branch -M main
git remote add origin https://github.com/<you>/<you>.github.io.git
git push -u origin main
```

Then **Settings → Pages → Source: main / root**. Live at
`https://<you>.github.io`. Netlify and Vercel work too — drag the folder in,
no build command.

## Structure

```
index.html          markup only
css/style.css       tokens, components, responsive, reduced-motion
js/config.js        >>> your content lives here <<<
js/github.js        GitHub API client + cache + language colours
js/main.js          animations, rendering, form
assets/favicon.svg
```

## Motion

Everything is transform/opacity only, and all scroll work runs through a single
rAF-batched loop (`scrollEngine` in `js/main.js`) rather than one listener per effect.

| Effect | Where |
|---|---|
| Preloader with live % counter | top of page load |
| Per-character name reveal + gradient shimmer | hero heading |
| Typewriter role cycler | hero |
| Pointer parallax on the aurora/grid layers | hero background |
| Nodes brighten as a packet lands, and as the cursor nears them | architecture diagram |
| Scroll parallax + fade-out | hero content |
| **Live architecture diagram** — React client / Express API / MongoDB / Redis / JWT, with request packets travelling the real SVG paths | hero (desktop) |
| Line-mask reveal (`data-mask`) | every section title |
| Decode/scramble animation | the 01–04 section numbers |
| Scroll-velocity skew + speed-up | skills marquee |
| Rail that fills as you scroll, lighting each node | experience timeline |
| Staggered chip pop-in | skill groups |
| 3D pointer tilt + spotlight glow | every project card |
| Cursor expands into a labelled disc ("View" / "Open") | cards and external links |
| Count-up numbers | GitHub stats |
| Animated width transition | language breakdown bar |
| Circular scroll-progress ring | back-to-top button |
| Circular clip-path wipe | mobile menu |
| Film grain overlay | whole page |

`prefers-reduced-motion: reduce` disables all of it and pins every element to its
final state — nothing is left invisible or mid-transform.

## Notes

- Dark/light theme, remembered in `localStorage`.
- Everything from the network is escaped before it reaches `innerHTML`, and only
  `http(s)` links are rendered.
- `prefers-reduced-motion` disables the particles, marquee and all transitions.
- Works down to 320px wide; there is a print stylesheet too.
