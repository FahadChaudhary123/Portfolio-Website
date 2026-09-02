/* =============================================================
   github.js — live data from the public GitHub REST API.
   No token required. Responses are cached in localStorage for
   30 minutes so repeat visits do not burn the 60 req/hour limit.
   ============================================================= */

const GitHubAPI = (() => {
  const API   = "https://api.github.com";
  const TTL   = 30 * 60 * 1000;          // 30 minutes
  const PREFIX = "gh-cache:";

  /* ---------- tiny localStorage cache (fails silently) ---------- */
  function readCache(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const { t, v } = JSON.parse(raw);
      if (Date.now() - t > TTL) { localStorage.removeItem(PREFIX + key); return null; }
      return v;
    } catch { return null; }
  }

  function writeCache(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value })); }
    catch { /* quota or private mode — caching is optional */ }
  }

  /* ---------- fetch with friendly errors ---------- */
  async function get(path) {
    const res = await fetch(API + path, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (res.status === 404) {
      const err = new Error("not-found");
      err.code = "not-found";
      throw err;
    }
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
      const err = new Error("rate-limited");
      err.code  = "rate-limited";
      err.reset = reset || 0;
      throw err;
    }
    if (!res.ok) {
      const err = new Error("http-" + res.status);
      err.code = "http";
      throw err;
    }
    return res.json();
  }

  /* ---------- public API ---------- */
  async function user(username) {
    const cached = readCache("user:" + username);
    if (cached) return cached;
    const data = await get("/users/" + encodeURIComponent(username));
    writeCache("user:" + username, data);
    return data;
  }

  async function repos(username) {
    const cached = readCache("repos:" + username);
    if (cached) return cached;

    // up to 200 repos (2 pages); plenty for a portfolio
    const all = [];
    for (let page = 1; page <= 2; page++) {
      const batch = await get(
        `/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`
      );
      all.push(...batch);
      if (batch.length < 100) break;
    }

    // keep only the fields we render — smaller cache, faster parse
    const slim = all.map(r => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      topics: r.topics || [],
      fork: r.fork,
      archived: r.archived,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at
    }));

    writeCache("repos:" + username, slim);
    return slim;
  }

  return { user, repos };
})();

/* =============================================================
   Official-ish GitHub language colours (the common ones).
   Anything unknown falls back to a neutral grey.
   ============================================================= */
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219",       HTML: "#e34c26",       CSS: "#563d7c",
  SCSS: "#c6538c",       "C++": "#f34b7d",      C: "#555555",
  "C#": "#178600",       Go: "#00ADD8",         Rust: "#dea584",
  PHP: "#4F5D95",        Ruby: "#701516",       Swift: "#F05138",
  Kotlin: "#A97BFF",     Dart: "#00B4AB",       Shell: "#89e051",
  Vue: "#41b883",        Svelte: "#ff3e00",     Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B", Dockerfile: "#384d54",
  Makefile: "#427819",   R: "#198CE7",          Lua: "#000080",
  Perl: "#0298c3",       Scala: "#c22d40",      Elixir: "#6e4a7e",
  Haskell: "#5e5086",    "Objective-C": "#438eff", "Vim script": "#199f4b",
  PowerShell: "#012456", Assembly: "#6E4C13",   SQL: "#e38c00",
  Astro: "#ff5a03",      MDX: "#fcb32c",        TeX: "#3D6117"
};

function langColor(lang) {
  return LANG_COLORS[lang] || "#8b949e";
}
