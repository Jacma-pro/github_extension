(() => {
  const SEQUENCE_TIMEOUT_MS = 1000;

  // Top-level GitHub paths that look like "/owner/repo" but are not repos.
  const RESERVED_OWNERS = new Set([
    "settings", "orgs", "organizations", "notifications", "explore",
    "marketplace", "topics", "trending", "collections", "sponsors",
    "search", "pulls", "issues", "codespaces", "features", "login",
    "logout", "new", "enterprise", "about", "pricing", "apps", "users",
  ]);

  // Second key after "g" → path relative to the repo root.
  const REPO_SHORTCUTS = {
    s: "settings",
  };

  let pendingG = false;
  let pendingTimer = null;

  function resetSequence() {
    pendingG = false;
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

  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTyping(event.target)) return;

    const key = event.key.toLowerCase();

    if (pendingG) {
      const path = REPO_SHORTCUTS[key];
      const repo = currentRepo();
      resetSequence();
      if (!path || !repo) return;

      // Stop GitHub's own handlers (e.g. "s" focuses search).
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(`/${repo.owner}/${repo.repo}/${path}`);
      return;
    }

    if (key === "g") {
      pendingG = true;
      pendingTimer = setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);
    }
  }

  // Capture phase on window so we run before GitHub's listeners.
  window.addEventListener("keydown", onKeyDown, true);
})();
