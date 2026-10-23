(() => {
  const SEQUENCE_TIMEOUT_MS = 1000;
  const HELP_HOST_ID = "ghkn-help";

  // Top-level GitHub paths that look like "/owner/repo" but are not repos.
  const RESERVED_OWNERS = new Set([
    "settings", "orgs", "organizations", "notifications", "explore",
    "marketplace", "topics", "trending", "collections", "sponsors",
    "search", "pulls", "issues", "codespaces", "features", "login",
    "logout", "new", "enterprise", "about", "pricing", "apps", "users",
  ]);

  // Prefix key → { title, where the sequence is active, second key → shortcut }.
  // A shortcut either navigates to `path` (relative to the repo root, string or function)
  // or calls `run`. `when` overrides the default availability check.
  const SEQUENCES = {
    g: {
      title: "Navigation",
      isActive: () => true,
      shortcuts: {
        "?": { label: "Afficher les raccourcis", run: toggleHelp },
        h: { label: "Accueil", run: () => window.location.assign("/") },
        u: { label: "Mon profil", when: hasLogin, run: () => window.location.assign(`/${currentLogin()}`) },
        m: { label: "Mes repos", when: hasLogin, run: () => window.location.assign(`/${currentLogin()}?tab=repositories`) },
        l: { label: "Mes pull requests", run: () => window.location.assign("/pulls") },
        s: { label: "Settings du repo", path: "settings" },
      },
    },
    s: {
      title: "Settings du repo",
      isActive: isOnRepoSettings,
      shortcuts: {
        g: { label: "General", path: "settings" },
        c: { label: "Collaborators", path: "settings/access" },
        r: { label: "Rulesets", path: "settings/rules" },
        b: { label: "Branches", path: "settings/branches" },
        a: { label: "Actions", path: "settings/actions" },
        w: { label: "Webhooks", path: "settings/hooks" },
        e: { label: "Environments", path: "settings/environments" },
        p: { label: "Pages", path: "settings/pages" },
        y: { label: "Advanced Security", path: "settings/security_analysis" },
        k: { label: "Deploy keys", path: "settings/keys" },
        s: { label: "Secrets (Actions)", path: "settings/secrets/actions" },
        v: { label: "Variables (Actions)", path: "settings/variables/actions" },
        i: { label: "GitHub Apps", path: "settings/installations" },
        l: { label: "Autolink references", path: "settings/key_links" },
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

  function currentLogin() {
    return document.querySelector('meta[name="user-login"]')?.content || null;
  }

  function hasLogin() {
    return currentLogin() !== null;
  }

  // Path shortcuts only make sense inside a repo.
  function isAvailable(shortcut) {
    if (shortcut.when) return shortcut.when();
    return !shortcut.path || currentRepo() !== null;
  }

  function resolvePath(shortcut) {
    return typeof shortcut.path === "function" ? shortcut.path() : shortcut.path;
  }

  function swallow(event) {
    // Stop GitHub's own handlers (e.g. "s" focuses search).
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function closeHelp() {
    document.getElementById(HELP_HOST_ID)?.remove();
  }

  function toggleHelp() {
    if (document.getElementById(HELP_HOST_ID)) {
      closeHelp();
      return;
    }

    const renderSection = (title, shortcuts, prefix) => {
      const rows = Object.entries(shortcuts)
        .filter(([, shortcut]) => isAvailable(shortcut))
        .map(([key, shortcut]) => `
          <tr>
            <td>${prefix ? `<kbd>${prefix}</kbd> ` : ""}<kbd>${key}</kbd></td>
            <td>${shortcut.label}</td>
          </tr>`)
        .join("");
      return rows ? `<h3>${title}</h3><table>${rows}</table>` : "";
    };

    const sections = Object.entries(SEQUENCES)
      .filter(([, sequence]) => sequence.isActive())
      .map(([prefix, sequence]) => renderSection(sequence.title, sequence.shortcuts, prefix))
      .join("");

    // Shadow DOM keeps GitHub's CSS out of the popup (and ours out of GitHub).
    const host = document.createElement("div");
    host.id = HELP_HOST_ID;
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        .backdrop {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .dialog {
          max-width: 480px;
          width: calc(100% - 32px);
          max-height: 80vh;
          overflow-y: auto;
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid var(--borderColor-default, #d0d7de);
          background: var(--bgColor-default, #fff);
          color: var(--fgColor-default, #1f2328);
        }
        h2 { margin: 0 0 8px; font-size: 18px; }
        h3 {
          margin: 16px 0 4px;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--fgColor-muted, #59636e);
        }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 4px 0; }
        td:first-child { width: 80px; white-space: nowrap; }
        kbd {
          display: inline-block;
          min-width: 16px;
          padding: 2px 6px;
          text-align: center;
          font: 12px ui-monospace, SFMono-Regular, Menlo, monospace;
          border: 1px solid var(--borderColor-default, #d0d7de);
          border-radius: 6px;
          background: var(--bgColor-muted, #f6f8fa);
        }
        .hint { margin: 16px 0 0; color: var(--fgColor-muted, #59636e); font-size: 12px; }
      </style>
      <div class="backdrop">
        <div class="dialog" role="dialog" aria-label="Raccourcis clavier">
          <h2>Raccourcis de l'extension</h2>
          ${sections}
          <h3>GitHub (natif)</h3>
          <table>
            <tr>
              <td><kbd>?</kbd></td>
              <td>Raccourcis natifs de GitHub</td>
            </tr>
          </table>
          <p class="hint"><kbd>Esc</kbd> pour fermer</p>
        </div>
      </div>`;

    root.querySelector(".backdrop").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeHelp();
    });
    document.body.appendChild(host);
  }

  function runShortcut(shortcut) {
    if (shortcut.run) {
      shortcut.run();
      return;
    }
    const repo = currentRepo();
    window.location.assign(`/${repo.owner}/${repo.repo}/${resolvePath(shortcut)}`);
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && document.getElementById(HELP_HOST_ID)) {
      swallow(event);
      closeHelp();
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return;
    // Pressing Shift alone (e.g. to type "?") must not break a pending sequence.
    if (event.key === "Shift") return;
    if (isTyping(event.target)) return;

    const key = event.key.toLowerCase();

    if (pendingPrefix) {
      const shortcut = SEQUENCES[pendingPrefix].shortcuts[key];
      resetSequence();
      if (!shortcut || !isAvailable(shortcut)) return;

      swallow(event);
      runShortcut(shortcut);
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
