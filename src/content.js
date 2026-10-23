(() => {
  const SEQUENCE_TIMEOUT_MS = 1000;

  // Top-level GitHub paths that look like "/owner/repo" but are not repos.
  const RESERVED_OWNERS = new Set([
    "settings", "orgs", "organizations", "notifications", "explore",
    "marketplace", "topics", "trending", "collections", "sponsors",
    "search", "pulls", "issues", "codespaces", "features", "login",
    "logout", "new", "enterprise", "about", "pricing", "apps", "users",
  ]);

  // Prefix key → { where the sequence is active, second key → path relative to the repo root }.
  const SEQUENCES = {
    g: {
      isActive: () => true,
      shortcuts: {
        s: "settings",
      },
    },
    s: {
      isActive: isOnRepoSettings,
      shortcuts: {
        g: "settings",
        c: "settings/access",
        r: "settings/rules",
        b: "settings/branches",
        a: "settings/actions",
        w: "settings/hooks",
        e: "settings/environments",
        p: "settings/pages",
        y: "settings/security_analysis",
        k: "settings/keys",
        s: "settings/secrets/actions",
        v: "settings/variables/actions",
        i: "settings/installations",
        l: "settings/key_links",
      },
    },
  };

  let pendingPrefix = null;
  let pendingTimer = null;

  function resetSequence() {
    pendingPrefix = null;
    clearTimeout(pendingTimer);
  }

  function isTyping(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  }

  function currentRepo() {
    const [owner, repo] = window.location.pathname.split("/").filter(Boolean);
    if (!owner || !repo || RESERVED_OWNERS.has(owner)) return null;
    return { owner, repo };
  }

  function isOnRepoSettings() {
    const [, , section] = window.location.pathname.split("/").filter(Boolean);
    return currentRepo() !== null && section === "settings";
  }

  function swallow(event) {
    // Stop GitHub's own handlers (e.g. "s" focuses search).
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTyping(event.target)) return;

    const key = event.key.toLowerCase();

    if (pendingPrefix) {
      const path = SEQUENCES[pendingPrefix].shortcuts[key];
      const repo = currentRepo();
      resetSequence();
      if (!path || !repo) return;

      swallow(event);
      window.location.assign(`/${repo.owner}/${repo.repo}/${path}`);
      return;
    }

    const sequence = SEQUENCES[key];
    if (!sequence || !sequence.isActive()) return;

    // Let "g" through so GitHub's native "g" sequences keep working.
    if (key !== "g") swallow(event);
    pendingPrefix = key;
    pendingTimer = setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);
  }

  // Capture phase on window so we run before GitHub's listeners.
  window.addEventListener("keydown", onKeyDown, true);
})();
