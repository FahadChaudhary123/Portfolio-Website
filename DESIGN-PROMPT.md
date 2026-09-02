# The design prompt behind this site

> **Honest note:** I never received this prompt. The actual request was one line —
> *"portfolio website as i am associate software also get the access of my github
> and so project link"* — plus a résumé PDF and a GitHub username. Everything below
> is the set of decisions I made, written back out as the brief that *would* have
> produced this site. Reuse it, hand it to another model, or argue with it.
>
> Placeholders look like `{{THIS}}`. Fill them in and the prompt is portable to any
> portfolio, not just this one.

---

## The prompt

You are building a personal portfolio site for **{{NAME}}, {{JOB TITLE}}**.
The audience is hiring managers and technical interviewers who will spend
**under 60 seconds** on the page. Every decision serves that: they must learn
what this person builds, see proof, and find a way to contact them, fast.

### 1. Stack and constraints

- **Vanilla HTML, CSS and JavaScript. No framework, no build step, no dependencies.**
  It must run by opening a static server on the folder. This is deliberate: a
  portfolio that needs a toolchain is a portfolio that breaks two years later,
  and it deploys to GitHub Pages / Netlify / Vercel with no pipeline.
- Split into `index.html`, `css/style.css`, `js/config.js`, `js/github.js`,
  `js/main.js`. **All content lives in `config.js`** as a single object — name,
  bio, skills, jobs, education, projects, socials. The owner should never touch
  markup to update their own site.
- No external runtime dependencies. Google Fonts is the only network asset
  besides the GitHub API.

### 2. Content architecture

In order, one page, anchor-scrolled:

1. **Hero** — status pill, name, rotating role, one-sentence value line, three
   CTAs (work / contact / résumé), social row.
2. **Skills marquee** — an infinite ticker of the tech stack, breaking hero from body.
3. **About** — avatar, two-paragraph bio, a facts table (role / company /
   location / education), and a small stats row.
4. **Experience** — reverse-chronological timeline, each role with bullets and a stack.
   Education below it.
5. **Projects** — *two halves* (see §4).
6. **Contact** — a large invitation, the email as a link, and a working form.
7. **Footer.**

### 3. Visual direction

- **Dark-first**, with a real light theme — not an inverted afterthought. Toggle
  persists in `localStorage`, defaults to the OS preference.
- Ground: near-black `#0b0d12`, panels one step lighter. Surfaces are
  `rgba(255,255,255,.035)` over the ground, not opaque greys, so they read as
  glass rather than boxes.
- **One accent gradient**, indigo `#7c5cff` → cyan `#22d3ee`, used sparingly:
  primary buttons, the gradient word in the hero, the timeline rail, stat
  numbers. If everything is accented, nothing is.
- Type: **Space Grotesk** for display, **Inter** for body, **JetBrains Mono** for
  anything technical (dates, section numbers, tech chips). The mono is a signal
  to a technical reader.
- Fluid sizing via `clamp()` everywhere — no breakpoint-stepped font sizes.
- Everything is a CSS custom property on `:root`, redefined once under
  `[data-theme="light"]`. Never hard-code a colour in a component.
- Generous vertical rhythm: 7rem section padding on desktop, 5rem below 820px.

### 4. The GitHub integration — and the trap in it

Pull live from the **public** GitHub REST API (`/users/:u` and `/users/:u/repos`).
No token, nothing secret, cache responses in `localStorage` for 30 minutes so
repeat visits stay inside the 60-requests/hour unauthenticated limit.

From the API, render: project cards (name, description, topics as `#tags`, stars,
forks, last-push time), the repo link, a live-demo link when `homepage` is set,
the avatar, a language-breakdown bar, and language filter chips.

**Handle every failure visibly.** Rate-limited, 404 on a wrong username, and
offline must each render a readable message with a fallback link to the GitHub
profile — never an empty grid, never a silent nothing.

> **The trap:** do not let the API be the only source of projects. Most junior
> and mid-level engineers have a handful of public repos and a résumé listing
> three times as many projects, because the good ones are company work, private,
> or academic. A purely API-driven grid hides their best work.
>
> So build **two halves**:
>
> 1. **Selected work** — a curated `projects: []` array in the config, one entry
>    per résumé project. Each entry may carry `repo: "exact-name"`, and if that
>    matches a real repository the card *automatically* gains the source link,
>    star count, language dot and "updated N ago". Entries with no repo show an
>    honest `status:` label instead — *Company project*, *Private repo*,
>    *In progress*, *Final Year Project*. Never fabricate a link.
> 2. **Live from GitHub** — the full public repo grid, with filters and the
>    language bar.
>
> Curation carries the substance; the API supplies proof and freshness.

### 5. Motion system

Motion is the differentiator here, but it has to read as **craft, not decoration**.
The test for every effect: would a senior front-end engineer look at this and see
technique, or see a template?

Build these:

| Effect | Applied to |
|---|---|
| Preloader with a live % counter | page load |
| Per-character stagger reveal | the hero name |
| Typewriter cycling job titles | hero |
| Pointer parallax on background layers | hero aurora + grid |
| Scroll parallax and fade-out | hero content |
| Connected-particle canvas | hero background |
| Line-mask reveal (text slides from behind a clipped edge) | every section title |
| Decode/scramble animation | the `01`–`04` section numbers |
| Scroll-velocity skew and speed-up | the skills marquee |
| A rail that fills with scroll, lighting each node | the experience timeline |
| Staggered pop-in | skill chips |
| 3D pointer tilt plus a spotlight glow | project cards |
| Cursor expanding into a labelled disc ("View" / "Open") | cards, external links |
| Count-up numbers | stats |
| Circular scroll-progress ring | back-to-top button |
| Circular clip-path wipe | mobile menu |
| Film grain | whole page |

**Rules that matter more than the list:**

- Animate **transform and opacity only**. Nothing that triggers layout.
- **One** rAF-batched scroll loop for every scroll-driven effect — not one
  listener per effect.
- Any loop that runs at rest must park itself and restart on demand.
- `prefers-reduced-motion: reduce` disables all of it *and pins every element to
  its final state*. Anything that starts at `opacity: 0` or a translated position
  must be explicitly forced visible, or reduced-motion users get a blank page.

### 6. Correctness and accessibility

- Escape **everything** from the network before it reaches `innerHTML`. Repo
  descriptions and topics are attacker-controllable in principle. Allow only
  `http(s)` URLs through.
- Skip link, visible `:focus-visible` rings, real `aria-label`s on icon-only
  buttons, `aria-expanded` on the menu toggle, `aria-live` on the projects grid.
- Keyboard: Escape closes the mobile menu.
- Works to 320px wide. Include a print stylesheet — someone will print this.
- Respect `prefers-color-scheme` on first visit.

### 7. Quality bar — reject these

- Section titles that fade in as one lump. Reveal per line, from behind a mask.
- More than one accent colour doing work.
- Placeholder lorem, invented metrics, or a link that goes nowhere.
- A "0" displayed anywhere. If a number is unflattering, make it a config toggle
  and switch it off — don't render weakness with confidence.
- Effects layered because they're possible. Restraint reads as more senior than
  volume; if something feels like too much, it is.

### 8. Deliverables

The working site, plus a `README.md` that explains the config, both project
halves, and how to deploy. Verify before claiming done: HTML nesting parses, CSS
braces balance, `node --check` passes on every JS file, every ID queried by JS
exists in the markup, and every asset serves 200.

---

## What actually shaped this build

Decisions above that came from **{{NAME}}'s own material**, not from taste:

- **Two-halves projects section** — driven by finding only 3 public repos against
  a résumé listing 8 projects. Without that check I'd have shipped a grid of three
  cards and called it done.
- **Curated `status:` labels** — *Company project* for the Ayshx real-estate work,
  *Final Year Project* for the personality-trait system. Honest framing beats
  either omitting them or implying they're public.
- **Hiding the stars/followers tiles** — real numbers that undersold the work.
  Made a toggle, not a deletion, so it reverses in one word later.

## Three bugs this prompt exists to prevent

Each of these was real, and each would have shipped silently:

1. **A filled CSS animation outranks inline styles.** Project cards entered with
   `animation-fill-mode: both`, whose final `transform: none` keyframe overrode
   every tilt transform the JS wrote. The cards must drop the animation on
   `animationend` and hand off to inline transforms.
2. **CSS transitions fighting per-frame JS writes.** A `transition: transform` on
   an element whose transform you also rewrite every frame produces smeared,
   laggy motion. Pick one.
3. **`[hidden]` loses to component display rules.** `.btn { display: inline-flex }`
   beats the UA's `[hidden] { display: none }`. Add
   `[hidden] { display: none !important }` to the reset or your hidden buttons
   stay on screen.
