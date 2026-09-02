/* =============================================================
   main.js — animation + rendering. Reads everything from CONFIG.
   ============================================================= */
(() => {
"use strict";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COARSE  = matchMedia("(pointer: coarse)").matches;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* Escape anything that comes from the network before it hits innerHTML */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

/* Only allow http(s) links through */
const safeUrl = (u) => {
  if (!u) return "";
  try {
    const url = new URL(u, location.href);
    return (url.protocol === "http:" || url.protocol === "https:") ? url.href : "";
  } catch { return ""; }
};

const isPlaceholder = (v) => !v || /GITHUB_USERNAME|your-handle|example\.com|Your Name/i.test(v);

/* =============================================================
   1. PRELOADER
   ============================================================= */
function preloader() {
  const box  = $("#preloader");
  const fill = $("#preloaderFill");
  const mark = $("#preloaderMark");
  const pct  = $("#preloaderPct");
  if (!box) return;

  mark.textContent = CONFIG.initials || "•";

  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 22 + 8);
    fill.style.width = p + "%";
    if (pct) pct.textContent = Math.round(p) + "%";
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        box.classList.add("is-done");
        document.body.classList.remove("is-locked");
        startHero();
      }, 260);
    }
  }, REDUCED ? 40 : 130);
}

/* =============================================================
   2. THEME
   ============================================================= */
function theme() {
  const root   = document.documentElement;
  const btn    = $("#themeToggle");
  const stored = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
  const start  = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  root.dataset.theme = start;

  btn?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    document.dispatchEvent(new CustomEvent("themechange"));
  });
}

/* =============================================================
   3. CURSOR + MAGNETIC BUTTONS
   ============================================================= */
function cursor() {
  if (REDUCED || matchMedia("(pointer: coarse)").matches) return;

  const dot  = $("#cursorDot");
  const ring = $("#cursorRing");
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;

  addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    document.body.classList.add("cursor-ready");
  }, { passive: true });

  (function loop() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  const hot = "a, button, .pcard, .chip, input, textarea, .filter";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hot)) document.body.classList.add("cursor-hot");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hot)) document.body.classList.remove("cursor-hot");
  });
}

function magnetic() {
  if (REDUCED || matchMedia("(pointer: coarse)").matches) return;

  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest("[data-magnetic]");
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, { passive: true });

  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest("[data-magnetic]");
    if (el) el.style.transform = "";
  });
}

/* Cards get a spotlight that follows the pointer */
function spotlight(card) {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");

    if (REDUCED || COARSE) return;
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    card.classList.add("is-tilt");
    card.style.transform =
      `perspective(1100px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px)`;
  }, { passive: true });

  card.addEventListener("mouseleave", () => {
    card.classList.remove("is-tilt");
    card.style.transform = "";
  });
}

/* =============================================================
   4. NAV: sticky, active link, indicator, mobile menu
   ============================================================= */
function nav() {
  const bar       = $("#nav");
  const progress  = $("#scrollProgress");
  const links     = $$(".nav__link");
  const indicator = $("#navIndicator");
  const burger    = $("#navBurger");
  const menu      = $("#mobileMenu");

  function moveIndicator(el) {
    if (!el || !indicator) return;
    indicator.style.width     = el.offsetWidth + "px";
    indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    indicator.style.opacity   = "1";
  }

  function onScroll() {
    const y   = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.classList.toggle("is-stuck", y > 24);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
  }

  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* active section highlighting */
  const sections = $$("section[id]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = "#" + en.target.id;
      links.forEach((l) => {
        const on = l.getAttribute("href") === id;
        l.classList.toggle("is-active", on);
        if (on) moveIndicator(l);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  links.forEach((l) => l.addEventListener("mouseenter", () => moveIndicator(l)));
  $("#navLinks")?.addEventListener("mouseleave", () => {
    moveIndicator($(".nav__link.is-active"));
  });
  addEventListener("resize", () => moveIndicator($(".nav__link.is-active")));
  requestAnimationFrame(() => moveIndicator($(".nav__link.is-active")));

  /* mobile menu */
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("is-locked", open);
  }
  burger?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$(".mobile-menu__link").forEach((l) => l.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
}

/* =============================================================
   5. SCROLL REVEAL (re-runnable for injected content)
   ============================================================= */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-in");
    obs.unobserve(en.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

function observeReveals(scope = document) {
  $$(".reveal", scope).forEach((el) => {
    if (!el.classList.contains("is-in")) revealObserver.observe(el);
  });
}

/* =============================================================
   6. HERO: split heading, typewriter
   ============================================================= */
function splitTitle() {
  const el = $("#heroTitle");
  if (!el) return;

  const words = (CONFIG.name || "Your Name").trim().split(/\s+/);
  el.innerHTML = "";
  let i = 0;

  words.forEach((word, w) => {
    const span = document.createElement("span");
    span.className = "word" + (w === words.length - 1 && words.length > 1 ? " grad" : "");
    span.style.display = "inline-block";

    [...word].forEach((ch) => {
      const c = document.createElement("span");
      c.className = "char";
      c.textContent = ch;
      c.style.animationDelay = (0.35 + i * 0.035) + "s";
      i++;
      span.appendChild(c);
    });

    el.appendChild(span);
    if (w < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

function startHero() {
  $("#heroTitle")?.classList.add("is-in");
  observeReveals();
  $$(".hero .reveal").forEach((el) => el.classList.add("is-in"));
}

function typewriter() {
  const out   = $("#typewriter");
  const words = (CONFIG.roles && CONFIG.roles.length) ? CONFIG.roles : [CONFIG.role || "Developer"];
  if (!out) return;

  if (REDUCED) { out.textContent = words[0]; return; }

  let w = 0, i = 0, deleting = false;

  (function step() {
    const word = words[w % words.length];
    i += deleting ? -1 : 1;
    out.textContent = word.slice(0, i);

    let wait = deleting ? 45 : 85;
    if (!deleting && i === word.length) { wait = 1900; deleting = true; }
    else if (deleting && i === 0)       { deleting = false; w++; wait = 320; }

    setTimeout(step, wait);
  })();
}


/* =============================================================
   7. STATIC CONTENT FROM CONFIG
   ============================================================= */
const ICONS = {
  github:   '<svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.89.87 2.35.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.75-1.95C21.4 8.75 22 11 22 14v7h-4v-6.2c0-1.5-.03-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V21h-4V9z"/></svg>',
  twitter:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.6l-5.2-6.8L5.5 22H2.4l7.6-8.7L1.2 2h6.8l4.7 6.2L18.9 2zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20z"/></svg>',
  leetcode: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 2.3a1.4 1.4 0 0 1 2 2l-3 3.1 4.6 4.7a1.4 1.4 0 0 1-2 2l-4.6-4.7-3.2 3.3a3.3 3.3 0 0 0 0 4.6l3.2 3.2a3.3 3.3 0 0 0 4.6 0l2.3-2.3a1.4 1.4 0 0 1 2 2l-2.3 2.3a6.1 6.1 0 0 1-8.6 0l-3.2-3.2a6.1 6.1 0 0 1 0-8.6l7.2-7.4zM21 12.9h-6.6a1.4 1.4 0 1 1 0-2.8H21a1.4 1.4 0 1 1 0 2.8z"/></svg>',
  mail:     '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 7 9 6 9-6"/></svg>'
};

function socialsHTML() {
  const s = CONFIG.socials || {};
  const list = [];
  ["github", "linkedin", "twitter", "leetcode"].forEach((k) => {
    const url = safeUrl(s[k]);
    if (url && !isPlaceholder(s[k])) list.push({ url, icon: ICONS[k], label: k });
  });
  if (CONFIG.email && !isPlaceholder(CONFIG.email)) {
    list.push({ url: "mailto:" + CONFIG.email, icon: ICONS.mail, label: "email" });
  }
  return list.map(i =>
    `<a class="social" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(i.label)}" data-magnetic>${i.icon}</a>`
  ).join("");
}

function renderStatic() {
  const year = new Date().getFullYear();
  $("#year").textContent = year;
  $("#footerName").innerHTML = `&copy; ${year} ${esc(CONFIG.name)}`;
  $("#navLogo").textContent = CONFIG.initials || "•";
  $("#avatarFallback").textContent = CONFIG.initials || "•";
  document.title = `${CONFIG.name} — ${CONFIG.role}`;

  $("#heroTagline").textContent = CONFIG.tagline || "";
  $("#heroStatusText").textContent = CONFIG.available
    ? "Available for opportunities"
    : `${CONFIG.role} · ${CONFIG.location}`;

  const social = socialsHTML();
  $("#heroSocials").innerHTML    = social;
  $("#mobileSocials").innerHTML  = social;
  $("#contactSocials").innerHTML = social;

  /* résumé button */
  const rb = $("#resumeBtn");
  if (CONFIG.resume) { rb.href = CONFIG.resume; } else { rb.remove(); }

  /* contact e-mail */
  const mail = $("#contactMail");
  if (CONFIG.email) { mail.href = "mailto:" + CONFIG.email; mail.textContent = CONFIG.email; }
  else { mail.remove(); }

  /* bio */
  $("#aboutBio").innerHTML = (CONFIG.bio || []).map(p => `<p>${esc(p)}</p>`).join("");

  /* facts */
  $("#aboutFacts").innerHTML = (CONFIG.facts || [])
    .map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("");

  /* skills */
  $("#skills").innerHTML = Object.entries(CONFIG.skills || {}).map(([group, items]) => `
    <div class="skill-group reveal">
      <h3>${esc(group)}</h3>
      <div class="chips">${items.map(i => `<span class="chip">${esc(i)}</span>`).join("")}</div>
    </div>`).join("");

  /* drop any stat tile switched off in CONFIG.showStats */
  const wanted = CONFIG.showStats || {};
  $$("#stats .stat").forEach((tile) => {
    if (wanted[tile.dataset.stat] === false) tile.remove();
  });
  if (!$("#stats").children.length) $("#stats").remove();

  $$(".skill-group").forEach(g =>
    $$(".chip", g).forEach((c, i) => c.style.setProperty("--i", i)));

  /* marquee — every skill, duplicated so the loop is seamless */
  const all = Object.values(CONFIG.skills || {}).flat();
  const run = all.map(s => `<span class="marquee__item">${esc(s)}</span>`).join("");
  $("#marqueeTrack").innerHTML = run + run;

  /* experience */
  $("#timeline").innerHTML = (CONFIG.experience || []).map(x => `
    <article class="tl-item reveal">
      <span class="tl-item__period">${esc(x.period)}</span>
      <h3 class="tl-item__role">${esc(x.role)}</h3>
      <p class="tl-item__company">${esc(x.company)}</p>
      <ul class="tl-item__points">${(x.points || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <div class="chips">${(x.stack || []).map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div>
    </article>`).join("");

  /* education */
  if ((CONFIG.education || []).length) {
    $("#educationWrap").hidden = false;
    $("#education").innerHTML = CONFIG.education.map(e => `
      <div class="edu-card reveal">
        <h4>${esc(e.degree)}</h4>
        <p>${esc(e.school)}</p>
        ${e.note ? `<p>${esc(e.note)}</p>` : ""}
        <span class="tl-item__period">${esc(e.period)}</span>
      </div>`).join("");
  }

  renderWork();
  observeReveals();
}

/* =============================================================
   8. GITHUB — stats, project cards, language breakdown
   ============================================================= */
const state = { repos: [], filter: "All", shown: 0, step: 6 };

function countUp(el, target) {
  if (REDUCED) { el.textContent = target; return; }
  const dur = 1100, t0 = performance.now();
  (function tick(now) {
    const p = clamp((now - t0) / dur, 0, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

function relTime(iso) {
  const d = (Date.now() - new Date(iso)) / 86400000;
  if (d < 1)   return "today";
  if (d < 2)   return "yesterday";
  if (d < 30)  return Math.floor(d) + "d ago";
  if (d < 365) return Math.floor(d / 30) + "mo ago";
  return Math.floor(d / 365) + "y ago";
}

function skeletons(n = 6) {
  $("#projectsGrid").innerHTML = Array.from({ length: n }, () => `
    <div class="pcard pcard--skeleton">
      <div class="sk" style="height:20px;width:55%"></div>
      <div class="sk" style="height:12px;width:100%"></div>
      <div class="sk" style="height:12px;width:78%"></div>
      <div class="sk" style="height:12px;width:40%;margin-top:auto"></div>
    </div>`).join("");
}

function showState(html) {
  $("#projectsGrid").innerHTML = `<div class="state">${html}</div>`;
  $("#loadMore").hidden = true;
  $("#filters").innerHTML = "";
}

function cardHTML(r, featured) {
  const url  = safeUrl(r.html_url);
  const live = safeUrl(r.homepage);
  const desc = r.description || "No description yet — open the repo for details.";
  const topics = (r.topics || []).slice(0, 4);

  return `
  <article class="pcard${featured ? " is-featured" : ""}" data-lang="${esc(r.language || "Other")}">
    ${featured ? '<span class="pcard__badge">Featured</span>' : ""}
    <div class="pcard__top">
      <svg class="pcard__icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
      <div class="pcard__links">
        ${live ? `<a class="pcard__link" href="${esc(live)}" target="_blank" rel="noopener noreferrer" aria-label="Live demo of ${esc(r.name)}" title="Live demo">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
        <a class="pcard__link" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Source code of ${esc(r.name)}" title="View source">
          ${ICONS.github}</a>
      </div>
    </div>

    <h3 class="pcard__name"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></h3>
    <p class="pcard__desc">${esc(desc)}</p>

    ${topics.length ? `<div class="pcard__topics">${topics.map(t => `<span class="topic">#${esc(t)}</span>`).join("")}</div>` : ""}

    <div class="pcard__meta">
      ${r.language ? `<span><i class="lang-dot" style="background:${esc(langColor(r.language))}"></i>${esc(r.language)}</span>` : ""}
      <span title="Stars">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 .25l2.4 4.9 5.35.78-3.87 3.78.91 5.34L8 12.53l-4.79 2.52.91-5.34L.25 5.93l5.35-.78z"/></svg>
        ${r.stargazers_count}
      </span>
      <span title="Forks">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M5 3.25a1.75 1.75 0 1 0-2.5 1.58v1.42A2.75 2.75 0 0 0 5.25 9h1.5v2.17a1.75 1.75 0 1 0 1.5 0V9h1.5a2.75 2.75 0 0 0 2.75-2.75V4.83a1.75 1.75 0 1 0-1.5 0v1.42c0 .69-.56 1.25-1.25 1.25h-4.5C4.56 7.5 4 6.94 4 6.25V4.83c.6-.28 1-.88 1-1.58z"/></svg>
        ${r.forks_count}
      </span>
      <span style="margin-left:auto">${esc(relTime(r.pushed_at || r.updated_at))}</span>
    </div>
  </article>`;
}

function visibleRepos() {
  return state.filter === "All"
    ? state.repos
    : state.repos.filter(r => (r.language || "Other") === state.filter);
}

function renderProjects() {
  const grid = $("#projectsGrid");
  const list = visibleRepos();
  const slice = list.slice(0, state.shown);
  const featured = new Set(CONFIG.featured || []);

  if (!slice.length) {
    grid.innerHTML = `<div class="state"><b>Nothing here yet</b>No public repositories match this filter.</div>`;
    $("#loadMore").hidden = true;
    return;
  }

  grid.innerHTML = slice.map((r, i) => cardHTML(r, featured.has(r.name))).join("");
  $$(".pcard", grid).forEach((c, i) => {
    c.style.animationDelay = Math.min(i, 8) * 55 + "ms";
    // a filled animation outranks inline styles — clear it so tilt can take over
    c.addEventListener("animationend", () => { c.style.animation = "none"; }, { once: true });
    spotlight(c);
  });

  $("#loadMore").hidden = list.length <= state.shown;
}

function renderFilters() {
  const counts = new Map();
  state.repos.forEach(r => {
    const l = r.language || "Other";
    counts.set(l, (counts.get(l) || 0) + 1);
  });

  const langs = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const all = [["All", state.repos.length], ...langs];

  $("#filters").innerHTML = all.map(([name, n]) =>
    `<button class="filter${name === state.filter ? " is-active" : ""}" role="tab" data-lang="${esc(name)}">${esc(name)}<b>${n}</b></button>`
  ).join("");

  $$("#filters .filter").forEach(btn => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.lang;
      state.shown = CONFIG.maxProjects || 12;
      $$("#filters .filter").forEach(b => b.classList.toggle("is-active", b === btn));
      renderProjects();
    });
  });
}

function renderLangPanel() {
  const counts = new Map();
  state.repos.forEach(r => {
    if (!r.language) return;
    counts.set(r.language, (counts.get(r.language) || 0) + 1);
  });
  if (!counts.size) return;

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top    = sorted.slice(0, 8);
  const total  = sorted.reduce((s, [, n]) => s + n, 0);

  $("#langPanel").hidden = false;
  $("#langBar").innerHTML = top.map(([l, n]) =>
    `<span data-w="${(n / total * 100).toFixed(1)}" style="background:${esc(langColor(l))}" title="${esc(l)}"></span>`
  ).join("");

  $("#langLegend").innerHTML = top.map(([l, n]) =>
    `<li><i class="lang-dot" style="background:${esc(langColor(l))}"></i><b>${esc(l)}</b> <i>${(n / total * 100).toFixed(0)}%</i></li>`
  ).join("");

  // animate the bar in once the panel scrolls into view
  const io = new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    $$("#langBar span").forEach(s => { s.style.width = s.dataset.w + "%"; });
    obs.disconnect();
  }, { threshold: 0.3 });
  io.observe($("#langPanel"));

  observeReveals();
  return sorted.length;
}

/* =============================================================
   7b. SELECTED WORK — curated cards, enriched with GitHub data
        when CONFIG.projects[].repo matches a real repository.
   ============================================================= */
function workCardHTML(p, i, repo) {
  const src  = repo ? safeUrl(repo.html_url) : "";
  const demo = safeUrl(p.demo) || (repo ? safeUrl(repo.homepage) : "");
  const num  = String(i + 1).padStart(2, "0");

  const meta = repo
    ? `${repo.language ? `<span><i class="lang-dot" style="background:${esc(langColor(repo.language))}"></i>${esc(repo.language)}</span>` : ""}
       <span title="Stars"><svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 .25l2.4 4.9 5.35.78-3.87 3.78.91 5.34L8 12.53l-4.79 2.52.91-5.34L.25 5.93l5.35-.78z"/></svg>${repo.stargazers_count}</span>
       <span style="margin-left:auto">Updated ${esc(relTime(repo.pushed_at || repo.updated_at))}</span>`
    : `<span class="status">${esc(p.status || "Project")}</span>`;

  return `
  <article class="work-card reveal">
    <div class="work-card__head">
      <div>
        <span class="work-card__idx">${num}</span>
        <h3 class="work-card__title">${esc(p.title)}</h3>
      </div>
      <div class="work-card__links">
        ${demo ? `<a class="pcard__link" href="${esc(demo)}" target="_blank" rel="noopener noreferrer" title="Live demo" aria-label="Live demo of ${esc(p.title)}">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}
        ${src ? `<a class="pcard__link" href="${esc(src)}" target="_blank" rel="noopener noreferrer" title="View source" aria-label="Source code of ${esc(p.title)}">${ICONS.github}</a>` : ""}
      </div>
    </div>

    <p class="work-card__desc">${esc(p.description)}</p>
    <div class="chips">${(p.stack || []).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
    <div class="work-card__meta">${meta}${demo && !repo ? `<span class="status status--live">Live</span>` : ""}</div>
  </article>`;
}

function renderWork(repoMap) {
  const host = $("#work");
  const list = CONFIG.projects || [];
  if (!host || !list.length) { host?.remove(); return; }

  host.innerHTML = list
    .map((p, i) => workCardHTML(p, i, p.repo && repoMap ? repoMap.get(p.repo) : null))
    .join("");

  $$(".work-card", host).forEach(spotlight);
  observeReveals(host);
}

async function loadGitHub() {
  const username = CONFIG.github;
  const profile  = "https://github.com/" + username;
  $("#ghProfileLink").href = profile;

  /* Not configured yet — say so instead of failing silently. */
  if (isPlaceholder(username)) {
    $("#aboutBadgeText").textContent = "Add your GitHub username";
    showState(`<b>Almost there</b>Open <code>js/config.js</code> and set
      <code>github: "your-username"</code>. Your repositories, stars and
      language stats will then load automatically.`);
    return;
  }

  skeletons(CONFIG.maxProjects >= 6 ? 6 : 3);

  try {
    const [user, repos] = await Promise.all([
      GitHubAPI.user(username),
      GitHubAPI.repos(username)
    ]);

    /* ---- profile bits ---- */
    if (user.avatar_url) {
      const img = $("#ghAvatar");
      img.src = user.avatar_url;
      img.alt = `${CONFIG.name} on GitHub`;
      img.hidden = false;
      img.addEventListener("load", () => $("#avatarFallback").remove(), { once: true });
      img.addEventListener("error", () => img.remove(), { once: true });
    }
    $("#aboutBadgeText").textContent = "@" + user.login;
    $("#aboutBadge").style.cursor = "pointer";
    $("#aboutBadge").addEventListener("click", () => open(profile, "_blank", "noopener"));

    /* ---- filter + order the repos ---- */
    const hidden   = new Set(CONFIG.hidden || []);
    const featured = CONFIG.featured || [];

    let list = repos.filter(r =>
      !hidden.has(r.name) &&
      r.name.toLowerCase() !== username.toLowerCase() &&   // profile README repo
      (CONFIG.showForks || !r.fork)
    );

    list.sort((a, b) => {
      const fa = featured.indexOf(a.name), fb = featured.indexOf(b.name);
      if (fa !== -1 || fb !== -1) return (fa === -1 ? 999 : fa) - (fb === -1 ? 999 : fb);
      if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
      return new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at);
    });

    state.repos = list;
    state.shown = CONFIG.maxProjects || 12;

    /* enrich the curated cards with real repo data */
    renderWork(new Map(repos.map(r => [r.name, r])));

    renderFilters();
    renderProjects();
    const langCount = renderLangPanel() || 0;

    /* ---- stats ---- */
    const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const statsBox = $("#stats");
    if (statsBox) {
      const up = (sel, value) => { const el = $(sel); if (el) countUp(el, value); };
      const statsIO = new IntersectionObserver((en, obs) => {
        if (!en[0].isIntersecting) return;
        up("#statRepos",     user.public_repos || list.length);
        up("#statStars",     stars);
        up("#statFollowers", user.followers || 0);
        up("#statLangs",     langCount);
        obs.disconnect();
      }, { threshold: 0.4 });
      statsIO.observe(statsBox);
    }

  } catch (err) {
    $("#aboutBadgeText").textContent = "@" + username;

    if (err.code === "not-found") {
      showState(`<b>User not found</b>GitHub has no account called
        <code>${esc(username)}</code>. Check the <code>github</code> value in
        <code>js/config.js</code>.`);
    } else if (err.code === "rate-limited") {
      const mins = err.reset ? Math.max(1, Math.ceil((err.reset - Date.now()) / 60000)) : 0;
      showState(`<b>GitHub rate limit reached</b>The public API allows 60 requests
        per hour per IP.${mins ? ` Try again in about ${mins} minute${mins > 1 ? "s" : ""}.` : ""}
        <br /><a class="btn btn--ghost btn--sm" style="margin-top:1rem"
        href="${esc(profile)}" target="_blank" rel="noopener">Browse my repos on GitHub</a>`);
    } else {
      showState(`<b>Could not reach GitHub</b>Check your connection, then reload.
        <br /><a class="btn btn--ghost btn--sm" style="margin-top:1rem"
        href="${esc(profile)}" target="_blank" rel="noopener">Browse my repos on GitHub</a>`);
    }
  }
}

/* =============================================================
   9. CONTACT FORM
   ============================================================= */
function contactForm() {
  const form = $("#contactForm");
  const note = $("#formNote");
  const btn  = $("#cfSubmit");
  if (!form) return;

  const setNote = (msg, kind) => {
    note.textContent = msg;
    note.className = "form-note" + (kind ? " is-" + kind : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name  = $("#cfName").value.trim();
    const email = $("#cfEmail").value.trim();
    const msg   = $("#cfMsg").value.trim();
    let bad = false;

    [["#cfName", name], ["#cfEmail", email], ["#cfMsg", msg]].forEach(([sel, val]) => {
      const field = $(sel).parentElement;
      const ok = sel === "#cfEmail" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : val.length > 0;
      field.classList.toggle("has-error", !ok);
      if (!ok) bad = true;
    });

    if (bad) { setNote("Please fill in every field with a valid email.", "bad"); return; }

    /* Honeypot: a real person never fills a field they cannot see.
       Pretend it worked so the bot has nothing to learn from. */
    const bot = $("#cfBot");
    if (bot && bot.value) {
      form.reset();
      setNote("Thanks, I will get back to you shortly.", "ok");
      return;
    }

    /* No access key yet - hand off to the visitor's own mail client.
       mailto: fires no callback, so never claim it succeeded. */
    const endpoint = CONFIG.formEndpoint;
    const key      = CONFIG.formAccessKey;
    const isScript = /script\.google\.com/.test(endpoint || "");
    const hasKey   = key && !/paste|your[-_ ]?key/i.test(key);
    const ready    = endpoint && (isScript || hasKey);

    if (!ready) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body    = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
      location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
      setNote(`Opening your mail app. If nothing happens, write to ${CONFIG.email} directly.`);
      return;
    }

    btn.disabled = true;
    setNote("Sending…");

    try {
      /* Apps Script must be a "simple" request. Sending application/json
         would trigger a CORS preflight, and Apps Script does not answer
         OPTIONS on its redirect - so use text/plain and parse it server side. */
      const res = await fetch(endpoint, {
        method: "POST",
        headers: isScript
          ? { "Content-Type": "text/plain;charset=utf-8" }
          : { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(isScript
          ? { name, email, message: msg, botcheck: "" }
          : {
              access_key: key,
              name,
              email,
              message:   msg,
              subject:   `Portfolio enquiry from ${name}`,
              from_name: "Portfolio site",
              botcheck:  false
            })
      });
      /* Both providers answer 200 with { success: false } on a rejected
         submission, so the status code alone is not enough. */
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "send failed");
      form.reset();
      setNote("Thanks — I'll get back to you shortly.", "ok");
    } catch (err) {
      console.error("Contact form:", err);
      setNote(`Could not send. Email me directly at ${CONFIG.email}.`, "bad");
    } finally {
      btn.disabled = false;
    }
  });

  $$(".field input, .field textarea").forEach(i =>
    i.addEventListener("input", () => i.parentElement.classList.remove("has-error"))
  );
}

/* =============================================================
   SIGNATURE: live architecture diagram
   Packets travel the real SVG paths via getPointAtLength, so the
   motion follows the curves exactly rather than approximating them.
   Nodes brighten when a packet lands, and when the cursor nears.
   ============================================================= */
function architecture() {
  const svg   = $("#arch");
  const layer = $("#archPackets");
  if (!svg || !layer) return;

  const nodes = {};
  $$(".arch__node", svg).forEach((n) => { nodes[n.dataset.node] = { el: n, p: 0 }; });

  const paths = $$(".arch__edge", svg);
  if (REDUCED || !paths.length) return;      // the static diagram stands on its own

  const edges = paths.map((el) => ({ el, len: el.getTotalLength() }));

  /* edge index, direction, speed (laps/sec), start phase, node it lands on */
  const SPEC = [
    { e: 0, dir:  1, sp: .42, t: .00, to: "api"    },
    { e: 0, dir: -1, sp: .30, t: .55, to: "client" },
    { e: 1, dir:  1, sp: .38, t: .20, to: "mongo"  },
    { e: 1, dir: -1, sp: .28, t: .78, to: "api"    },
    { e: 2, dir:  1, sp: .46, t: .45, to: "redis"  },
    { e: 3, dir:  1, sp: .55, t: .12, to: "jwt"    }
  ];

  const NS = "http://www.w3.org/2000/svg";
  const packets = SPEC.map((s) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "3");
    c.setAttribute("class", "arch__packet");
    layer.appendChild(c);
    return Object.assign({}, s, { el: c });
  });

  /* Cursor proximity is measured in viewport space and read from window
     events, so elements stacked above the diagram cannot swallow it. */
  let mx = -9999, my = -9999, centers = null;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const invalidate = () => { centers = null; };
  addEventListener("resize", invalidate, { passive: true });
  addEventListener("scroll", invalidate, { passive: true });

  function measure() {
    centers = {};
    for (const k in nodes) {
      const r = nodes[k].el.getBoundingClientRect();
      centers[k] = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  }

  /* Stop the loop entirely once the hero scrolls away. */
  let running = false, last = 0;
  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    packets.forEach((pk) => {
      pk.t += pk.sp * dt;
      if (pk.t >= 1) {
        pk.t -= 1;
        const n = nodes[pk.to];
        if (n) n.p = 1;
      }
      const edge = edges[pk.e];
      const at   = pk.dir === 1 ? pk.t : 1 - pk.t;
      const pt   = edge.el.getPointAtLength(at * edge.len);
      pk.el.setAttribute("cx", pt.x.toFixed(1));
      pk.el.setAttribute("cy", pt.y.toFixed(1));
    });

    if (!centers) measure();
    for (const k in nodes) {
      const n = nodes[k];
      const c = centers[k];
      if (c) {
        const d = Math.hypot(mx - c.x, my - c.y);
        if (d < 170) n.p = Math.max(n.p, 1 - d / 170);
      }
      n.p *= 0.945;
      n.el.style.setProperty("--p", n.p.toFixed(3));
    }

    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) start();
    else running = false;
  }, { threshold: 0 }).observe(svg);
}

/* =============================================================
   11. SHOWCASE EFFECTS
   ============================================================= */
/* --- line-mask reveal on headings --------------------------- */
function maskHeadings() {
  $$("[data-mask]").forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((line, i) =>
      `<span class="mask"><span class="mask__i" style="--md:${i * 0.09}s">${line.trim()}</span></span>`
    ).join("");
  });
}

/* --- decode/scramble the 01 02 03 section numbers ----------- */
function scrambleNumbers() {
  const pool = "0123456789#$%&/*";
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      const el = en.target, final = el.textContent, t0 = performance.now(), dur = 620;
      if (REDUCED) return;
      (function frame(now) {
        const p = (now - t0) / dur;
        if (p >= 1) { el.textContent = final; return; }
        el.textContent = [...final]
          .map((c, i) => (p * final.length > i ? c : pool[(Math.random() * pool.length) | 0]))
          .join("");
        requestAnimationFrame(frame);
      })(t0);
    });
  }, { threshold: 1 });
  $$(".section__num").forEach((n) => io.observe(n));
}

/* --- timeline rail that fills as you scroll ----------------- */
function timelineRail() {
  const tl = $("#timeline");
  if (!tl || !tl.children.length) return;

  const rail = document.createElement("span");
  rail.className = "timeline__progress";
  tl.prepend(rail);

  const items = $$(".tl-item", tl);

  return function update() {
    const r = tl.getBoundingClientRect();
    const mid = innerHeight * 0.62;
    const done = clamp((mid - r.top) / r.height, 0, 1);
    rail.style.height = (done * 100).toFixed(2) + "%";

    items.forEach((it) => {
      const b = it.getBoundingClientRect();
      it.classList.toggle("is-lit", b.top < mid);
    });
  };
}

/* --- hero parallax + fade on scroll ------------------------- */
function heroMotion() {
  const hero  = $(".hero");
  const inner = $(".hero__inner");
  const bg    = $(".hero__bg");
  const grid  = $(".grid-overlay");
  if (!hero || REDUCED) return null;

  /* pointer parallax — the background layers only, so the CSS
     keyframes on the aurora blobs keep running untouched */
  if (!COARSE) {
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    addEventListener("mousemove", (e) => {
      tx = (e.clientX / innerWidth  - 0.5);
      ty = (e.clientY / innerHeight - 0.5);
      if (!running) { running = true; requestAnimationFrame(drift); }
    }, { passive: true });

    function drift() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (bg)   bg.style.transform   = `translate(${cx * 26}px, ${cy * 26}px)`;
      if (grid) grid.style.transform = `translate(${cx * -46}px, ${cy * -46}px)`;
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(drift);
      else running = false;
    }
  }

  return function update() {
    const h = hero.offsetHeight;
    const p = clamp(scrollY / h, 0, 1);
    if (inner) {
      inner.style.transform = `translateY(${p * 90}px)`;
      inner.style.opacity   = String(1 - p * 1.15);
    }
  };
}

/* --- marquee speeds up and skews with scroll velocity ------- */
function marqueeMotion() {
  const wrap  = $(".marquee");
  const track = $("#marqueeTrack");
  if (!wrap || !track || REDUCED) return null;

  let last = scrollY, vel = 0;

  let idle = true;

  function decay() {
    vel *= 0.9;
    if (Math.abs(vel) < 0.06) {           // settled — stop touching the DOM
      vel = 0;
      wrap.style.transform = "";
      track.style.animationDuration = "";
      idle = true;
      return;
    }
    wrap.style.transform = `skewX(${clamp(vel * -0.09, -7, 7).toFixed(2)}deg)`;
    track.style.animationDuration =
      (34 / (1 + Math.min(Math.abs(vel) / 22, 2.6))).toFixed(2) + "s";
    requestAnimationFrame(decay);
  }

  return function update() {
    vel = scrollY - last;
    last = scrollY;
    if (idle && Math.abs(vel) > 0.06) { idle = false; requestAnimationFrame(decay); }
  };
}

/* --- back-to-top button with a progress ring ---------------- */
function backToTop() {
  const btn = $("#toTop");
  const arc = $("#toTopArc");
  if (!btn) return null;

  const C = 2 * Math.PI * 21;
  btn.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" })
  );

  return function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p   = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    btn.classList.toggle("is-on", scrollY > 500);
    if (arc) arc.style.strokeDashoffset = String(C * (1 - p));
  };
}

/* --- cursor grows into a labelled disc over cards ----------- */
function cursorLabels() {
  const label = $("#cursorLabel");
  if (!label || REDUCED || COARSE) return;

  document.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".work-card, .pcard");
    const link = e.target.closest("a[target='_blank']");
    const text = link ? "Open" : card ? "View" : "";
    if (!text) return;
    label.textContent = text;
    document.body.classList.add("cursor-label");
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".work-card, .pcard, a[target='_blank']")) {
      document.body.classList.remove("cursor-label");
    }
  });
}

/* --- one rAF-batched scroll loop for every scroll effect ---- */
function scrollEngine(updaters) {
  const jobs = updaters.filter(Boolean);
  if (!jobs.length) return;

  let queued = false;
  function run() { queued = false; jobs.forEach((fn) => fn()); }

  addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(run);
  }, { passive: true });

  addEventListener("resize", run, { passive: true });
  run();
}

function effects() {
  maskHeadings();
  scrambleNumbers();
  cursorLabels();
  scrollEngine([timelineRail(), heroMotion(), marqueeMotion(), backToTop()]);
}

/* =============================================================
   10. BOOT
   ============================================================= */
document.body.classList.add("is-locked");

theme();
splitTitle();
renderStatic();
nav();
cursor();
magnetic();
typewriter();
architecture();
contactForm();
effects();
loadGitHub();

$("#loadMore")?.addEventListener("click", () => {
  state.shown += state.step;
  renderProjects();
});

preloader();

/* Safety net: never let the preloader trap the page. */
setTimeout(() => {
  const p = $("#preloader");
  if (p && !p.classList.contains("is-done")) {
    p.classList.add("is-done");
    document.body.classList.remove("is-locked");
    startHero();
  }
}, 4000);

})();
