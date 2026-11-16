import "./styles.css";

type CheckState = "pass" | "warn" | "fail" | "unknown";

type Capability = {
  name: string;
  detail: string;
  state: CheckState;
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root element #app was not found.");
}

const keyHistory: string[] = [];
let focusIndex = 0;
let keySequence = 0;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character] ?? character;
  });

const getStorageStatus = (): string => {
  try {
    const key = "jellyfin-vidaa-storage-test";
    window.localStorage.setItem(key, "ok");
    const result = window.localStorage.getItem(key);
    window.localStorage.removeItem(key);
    return result === "ok" ? "Available" : "Write/read test failed";
  } catch (error) {
    return `Unavailable (${error instanceof Error ? error.name : "unknown error"})`;
  }
};

const getMediaCapabilities = (): Capability[] => {
  const video = document.createElement("video");
  const audio = document.createElement("audio");
  const mediaSource = (window as unknown as {
    MediaSource?: { isTypeSupported?: (type: string) => boolean };
  }).MediaSource;

  const videoTypes = [
    { name: "H.264 / AVC", mime: 'video/mp4; codecs="avc1.640028"' },
    { name: "HEVC / H.265", mime: 'video/mp4; codecs="hvc1.1.6.L120.B0"' },
    { name: "VP9", mime: 'video/webm; codecs="vp09.00.10.08"' },
    { name: "AV1", mime: 'video/mp4; codecs="av01.0.08M.08"' },
    { name: "MPEG-2", mime: 'video/mpeg' },
    { name: "WebM / VP8", mime: 'video/webm; codecs="vp8, vorbis"' }
  ];

  const audioTypes = [
    { name: "AAC", mime: 'audio/mp4; codecs="mp4a.40.2"' },
    { name: "MP3", mime: "audio/mpeg" },
    { name: "FLAC", mime: 'audio/flac; codecs="flac"' },
    { name: "Opus", mime: 'audio/webm; codecs="opus"' },
    { name: "AC-3", mime: 'audio/mp4; codecs="ac-3"' },
    { name: "E-AC-3", mime: 'audio/mp4; codecs="ec-3"' }
  ];

  const canPlay = (element: HTMLMediaElement, mime: string): string => {
    try {
      return element.canPlayType(mime) || "";
    } catch {
      return "";
    }
  };

  const results: Capability[] = [];

  videoTypes.forEach((type) => {
    const result = canPlay(video, type.mime);
    results.push({
      name: type.name,
      detail: result ? `HTMLMediaElement: ${result}` : "Not reported by canPlayType",
      state: result === "probably" ? "pass" : result === "maybe" ? "warn" : "fail"
    });
  });

  audioTypes.forEach((type) => {
    const result = canPlay(audio, type.mime);
    results.push({
      name: type.name,
      detail: result ? `HTMLMediaElement: ${result}` : "Not reported by canPlayType",
      state: result === "probably" ? "pass" : result === "maybe" ? "warn" : "fail"
    });
  });

  const mseTypes = [
    { name: "MSE · H.264", mime: 'video/mp4; codecs="avc1.640028"' },
    { name: "MSE · HEVC", mime: 'video/mp4; codecs="hvc1.1.6.L120.B0"' },
    { name: "MSE · VP9", mime: 'video/webm; codecs="vp09.00.10.08"' },
    { name: "MSE · AV1", mime: 'video/mp4; codecs="av01.0.08M.08"' }
  ];

  mseTypes.forEach((type) => {
    let supported = false;
    try {
      supported = Boolean(mediaSource && typeof mediaSource.isTypeSupported === "function" && mediaSource.isTypeSupported(type.mime));
    } catch {
      supported = false;
    }
    results.push({
      name: type.name,
      detail: mediaSource && typeof mediaSource.isTypeSupported === "function"
        ? supported ? "MediaSource reports support" : "MediaSource reports unsupported"
        : "MediaSource API unavailable",
      state: mediaSource && typeof mediaSource.isTypeSupported === "function" ? supported ? "pass" : "fail" : "unknown"
    });
  });

  return results;
};

const getBrowserChecks = (): Capability[] => {
  const checks: Capability[] = [];
  const has = (name: string, supported: boolean, detailWhenMissing: string): void => {
    checks.push({
      name,
      detail: supported ? "Available" : detailWhenMissing,
      state: supported ? "pass" : "warn"
    });
  };

  has("Fetch API", typeof window.fetch === "function", "Unavailable");
  has("Promise", typeof window.Promise === "function", "Unavailable");
  has("ES module support", "noModule" in document.createElement("script"), "Not detected");
  has("MediaSource Extensions", "MediaSource" in window, "Unavailable");
  has("Fullscreen API", Boolean(document.documentElement.requestFullscreen), "Unavailable or restricted");
  has("localStorage", getStorageStatus() === "Available", getStorageStatus());
  has("WebSocket", typeof window.WebSocket === "function", "Unavailable");
  has("requestAnimationFrame", typeof window.requestAnimationFrame === "function", "Unavailable");
  has("Picture-in-Picture", "pictureInPictureEnabled" in document, "Not detected");
  has("Gamepad API", "getGamepads" in navigator, "Not detected");

  return checks;
};

const capabilityRow = (item: Capability): string => `
  <div class="capability-row">
    <span class="status-dot status-${item.state}" aria-hidden="true"></span>
    <div class="capability-copy">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.detail)}</span>
    </div>
    <span class="state-label state-${item.state}">${item.state.toUpperCase()}</span>
  </div>`;

const capabilities = getBrowserChecks();
const mediaCapabilities = getMediaCapabilities();
const userAgent = navigator.userAgent || "Not exposed";
const viewport = `${window.innerWidth} × ${window.innerHeight}`;
const screenSize = `${window.screen.width} × ${window.screen.height}`;
const pixelRatio = String(window.devicePixelRatio || 1);
const connection = (navigator as Navigator & { connection?: { effectiveType?: string; type?: string } }).connection;
const connectionLabel = connection?.effectiveType || connection?.type || "Not exposed by browser";
const memory = (performance as Performance & { memory?: { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number } }).memory;
const memoryLabel = typeof memory?.usedJSHeapSize === "number" && typeof memory.jsHeapSizeLimit === "number"
  ? `${Math.round(memory.usedJSHeapSize / 1048576)} MB used / ${Math.round(memory.jsHeapSizeLimit / 1048576)} MB heap limit`
  : "Not exposed by browser";

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">J</div>
        <div>
          <div class="brand-title">Jellyfin <span>VIDAA</span></div>
          <div class="brand-subtitle">DEVICE INSPECTOR · DEVELOPMENT BUILD</div>
        </div>
      </div>
      <div class="build-chip"><span class="live-dot"></span> LOCAL DIAGNOSTICS</div>
    </header>

    <main class="content">
      <section class="intro">
        <div>
          <p class="eyebrow">MILESTONE 0.1 · HARDWARE DISCOVERY</p>
          <h1>Know the device<br /><span>before we build for it.</span></h1>
          <p class="intro-copy">A first-pass survey of this browser's web, media and remote-control capabilities. Results are observations, not a guarantee that a codec or feature will play every file.</p>
        </div>
        <div class="device-badge">
          <span class="device-badge-icon">▣</span>
          <span>TV TARGET</span>
          <strong>Hisense 85Q7STUK</strong>
          <small>Firmware V01.09.60V.Q0612</small>
          <small class="muted">Target profile supplied by project owner</small>
        </div>
      </section>

      <section class="summary-grid" aria-label="Device summary">
        <article class="summary-card"><span>SCREEN</span><strong>${escapeHtml(screenSize)}</strong><small>Device screen dimensions</small></article>
        <article class="summary-card"><span>VIEWPORT</span><strong>${escapeHtml(viewport)}</strong><small>Current browser viewport</small></article>
        <article class="summary-card"><span>PIXEL RATIO</span><strong>${escapeHtml(pixelRatio)}×</strong><small>Device pixel ratio</small></article>
        <article class="summary-card"><span>NETWORK TYPE</span><strong class="summary-small">${escapeHtml(connectionLabel)}</strong><small>May not be exposed</small></article>
      </section>

      <div class="section-heading"><div><p class="eyebrow">01 / PLATFORM</p><h2>Browser & system</h2></div><span class="section-note">Read-only feature detection</span></div>
      <section class="two-column">
        <article class="panel">
          <div class="panel-heading"><h3>Browser checks</h3><span class="panel-icon">◈</span></div>
          <div id="browser-checks" class="capability-list">${capabilities.map(capabilityRow).join("")}</div>
        </article>
        <article class="panel">
          <div class="panel-heading"><h3>Environment</h3><span class="panel-icon">⌘</span></div>
          <dl class="data-list">
            <div><dt>Platform</dt><dd>${escapeHtml(navigator.platform || "Not exposed")}</dd></div>
            <div><dt>Language</dt><dd>${escapeHtml(navigator.language || "Not exposed")}</dd></div>
            <div><dt>Online status</dt><dd id="online-status">${navigator.onLine ? "Online" : "Offline"}</dd></div>
            <div><dt>Local storage</dt><dd>${escapeHtml(getStorageStatus())}</dd></div>
            <div><dt>JS heap</dt><dd>${escapeHtml(memoryLabel)}</dd></div>
            <div><dt>Current URL</dt><dd class="wrap-value">${escapeHtml(window.location.href)}</dd></div>
          </dl>
          <details class="user-agent-details"><summary>Show full user agent</summary><code>${escapeHtml(userAgent)}</code></details>
        </article>
      </section>

      <div class="section-heading"><div><p class="eyebrow">02 / MEDIA</p><h2>Declared media support</h2></div><span class="section-note">Browser-reported capability only</span></div>
      <section class="panel media-panel">
        <div class="media-explainer"><span class="info-icon">i</span><p><strong>Important:</strong> <code>canPlayType()</code> and MediaSource checks are hints. They do not prove hardware decoding, container compatibility, HDR support, audio passthrough or successful playback. We will verify those with real samples on the television.</p></div>
        <div class="media-columns">
          <div><div class="subheading"><h3>Video codecs</h3><span>HTMLMediaElement</span></div><div class="capability-list">${mediaCapabilities.filter((item) => !item.name.startsWith("MSE")).slice(0, 6).map(capabilityRow).join("")}</div></div>
          <div><div class="subheading"><h3>Audio codecs</h3><span>HTMLMediaElement</span></div><div class="capability-list">${mediaCapabilities.filter((item) => !item.name.startsWith("MSE")).slice(6, 12).map(capabilityRow).join("")}</div></div>
        </div>
        <div class="subheading mse-heading"><h3>Media Source Extensions</h3><span>Appendable stream formats</span></div>
        <div class="mse-grid">${mediaCapabilities.filter((item) => item.name.startsWith("MSE")).map(capabilityRow).join("")}</div>
      </section>

      <div class="section-heading"><div><p class="eyebrow">03 / INPUT</p><h2>Remote-control test</h2></div><span class="section-note">Use the TV remote or a keyboard</span></div>
      <section class="two-column remote-layout">
        <article class="panel">
          <div class="panel-heading"><h3>Try the controls</h3><span class="panel-icon">✣</span></div>
          <p class="panel-copy">Move focus between these tiles using the directional buttons. Press OK / Enter to activate. Back/Escape is logged but will not navigate away in this test.</p>
          <div class="remote-grid" role="group" aria-label="Remote navigation test">
            <button class="remote-tile" data-focusable data-row="0" data-col="1" type="button">▲<small>UP</small></button>
            <button class="remote-tile" data-focusable data-row="1" data-col="0" type="button">◀<small>LEFT</small></button>
            <button class="remote-tile remote-centre" data-focusable data-row="1" data-col="1" type="button">OK<small>SELECT</small></button>
            <button class="remote-tile" data-focusable data-row="1" data-col="2" type="button">▶<small>RIGHT</small></button>
            <button class="remote-tile" data-focusable data-row="2" data-col="1" type="button">▼<small>DOWN</small></button>
          </div>
          <p id="remote-result" class="remote-result" aria-live="polite">Waiting for a remote-control input…</p>
        </article>
        <article class="panel">
          <div class="panel-heading"><h3>Input event log</h3><button class="text-button" id="clear-keys" type="button">CLEAR</button></div>
          <div class="key-log" id="key-log" aria-live="polite"><div class="empty-log">No key events captured yet.</div></div>
          <div class="key-hints"><span>Also tested: Back</span><span>Media play/pause</span><span>Channel / volume keys</span></div>
        </article>
      </section>

      <div class="section-heading"><div><p class="eyebrow">04 / CONNECTIVITY</p><h2>Jellyfin server check</h2></div><span class="section-note">No login or password required</span></div>
      <section class="panel server-panel">
        <p class="panel-copy">Enter the base URL of a Jellyfin server. This performs a request to <code>/System/Info/Public</code> only. It does not sign in, store credentials or change anything on your server.</p>
        <form id="server-form" class="server-form">
          <label for="server-url">Jellyfin server URL</label>
          <div class="server-controls"><input id="server-url" name="server-url" type="url" inputmode="url" autocomplete="url" placeholder="http://192.168.1.20:8096" /><button class="primary-button" id="server-test" type="submit">TEST CONNECTION</button></div>
        </form>
        <div class="server-result" id="server-result" aria-live="polite"><span class="status-dot status-unknown"></span><span>Waiting for a server address.</span></div>
      </section>

      <footer class="footer"><span>JELLYFIN VIDAA · UNOFFICIAL COMMUNITY PROJECT</span><span>Diagnostic build · No telemetry</span></footer>
    </main>
  </div>
`;

const focusableElements = (): HTMLButtonElement[] =>
  Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-focusable]"));

const setFocus = (index: number): void => {
  const elements = focusableElements();
  if (elements.length === 0) return;
  focusIndex = (index + elements.length) % elements.length;
  elements[focusIndex].focus();
};

const navigateRemote = (key: string): boolean => {
  const directions: Record<string, { row: number; col: number }> = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 }
  };
  const direction = directions[key];
  if (!direction) return false;

  const elements = focusableElements();
  const current = document.activeElement as HTMLElement | null;
  const currentElement = current?.matches("[data-focusable]") ? current : elements[focusIndex];
  if (!currentElement) return false;

  const currentRow = Number(currentElement.dataset.row || 0);
  const currentCol = Number(currentElement.dataset.col || 0);
  const candidates = elements
    .map((element) => ({
      element,
      row: Number(element.dataset.row || 0),
      col: Number(element.dataset.col || 0)
    }))
    .filter((item) => {
      if (direction.row < 0) return item.row < currentRow && item.col === currentCol;
      if (direction.row > 0) return item.row > currentRow && item.col === currentCol;
      if (direction.col < 0) return item.col < currentCol && item.row === currentRow;
      return item.col > currentCol && item.row === currentRow;
    })
    .sort((a, b) => {
      const distanceA = Math.abs(a.row - currentRow) + Math.abs(a.col - currentCol);
      const distanceB = Math.abs(b.row - currentRow) + Math.abs(b.col - currentCol);
      return distanceA - distanceB;
    });

  if (candidates.length > 0) {
    setFocus(elements.indexOf(candidates[0].element));
  }
  return true;
};

const renderKeyLog = (): void => {
  const log = document.querySelector<HTMLDivElement>("#key-log");
  if (!log) return;
  if (keyHistory.length === 0) {
    log.innerHTML = '<div class="empty-log">No key events captured yet.</div>';
    return;
  }
  log.innerHTML = keyHistory.map((entry) => `<div class="key-entry">${entry}</div>`).join("");
};

const describeKey = (event: KeyboardEvent): string => {
  const key = event.key || "Unidentified";
  const code = event.code || "No code";
  const numeric = event.keyCode ? ` · keyCode ${event.keyCode}` : "";
  return `${key} · ${code}${numeric}`;
};

window.addEventListener("keydown", (event: KeyboardEvent) => {
  const entry = describeKey(event);
  keyHistory.unshift(`<span class="event-number">${("0" + String(++keySequence)).slice(-2)}</span><span>${escapeHtml(entry)}</span>`);
  if (keyHistory.length > 8) keyHistory.length = 8;
  renderKeyLog();

  const remoteResult = document.querySelector<HTMLParagraphElement>("#remote-result");
  if (event.key === "Enter" || event.key === "Select") {
    remoteResult && (remoteResult.textContent = `Select / OK detected (${entry}).`);
  } else if (["Escape", "Backspace", "BrowserBack", "Back", "GoBack", "XF86Back"].indexOf(event.key) !== -1 || event.keyCode === 4) {
    event.preventDefault();
    remoteResult && (remoteResult.textContent = `Back detected (${entry}). No navigation performed.`);
  } else if (navigateRemote(event.key)) {
    event.preventDefault();
    remoteResult && (remoteResult.textContent = `Directional input detected (${entry}).`);
  } else if (event.key.startsWith("Media") || ["AudioVolumeUp", "AudioVolumeDown", "AudioVolumeMute"].indexOf(event.key) !== -1) {
    remoteResult && (remoteResult.textContent = `Media / volume input detected (${entry}).`);
  }
});

document.querySelectorAll<HTMLButtonElement>("button[data-focusable]").forEach((button, index) => {
  button.addEventListener("focus", () => {
    focusIndex = index;
  });
  button.addEventListener("click", () => {
    const result = document.querySelector<HTMLParagraphElement>("#remote-result");
    if (result) result.textContent = `Button activated: ${button.querySelector("small")?.textContent || button.textContent?.trim() || "unknown"}.`;
  });
});

// Start with the centre/OK tile focused so a TV remote can immediately use D-pad navigation.
setFocus(2);

const clearButton = document.querySelector<HTMLButtonElement>("#clear-keys");
clearButton?.addEventListener("click", () => {
  keyHistory.length = 0;
  renderKeyLog();
});

const onlineStatus = document.querySelector<HTMLElement>("#online-status");
window.addEventListener("online", () => {
  if (onlineStatus) onlineStatus.textContent = "Online";
});
window.addEventListener("offline", () => {
  if (onlineStatus) onlineStatus.textContent = "Offline";
});

const serverForm = document.querySelector<HTMLFormElement>("#server-form");
const serverInput = document.querySelector<HTMLInputElement>("#server-url");
const serverResult = document.querySelector<HTMLDivElement>("#server-result");
const serverButton = document.querySelector<HTMLButtonElement>("#server-test");

serverForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!serverInput || !serverResult || !serverButton) return;

  let serverUrl: URL;
  try {
    serverUrl = new URL(serverInput.value.trim());
    if (!/^https?:$/.test(serverUrl.protocol)) throw new Error("Use an HTTP or HTTPS URL.");
  } catch (error) {
    serverResult.innerHTML = `<span class="status-dot status-fail"></span><span>${escapeHtml(error instanceof Error ? error.message : "Enter a valid server URL.")}</span>`;
    return;
  }

  serverUrl.pathname = `${serverUrl.pathname.replace(/\/$/, "")}/System/Info/Public`;
  serverUrl.search = "";
  serverUrl.hash = "";
  serverButton.disabled = true;
  serverButton.textContent = "CHECKING…";
  serverResult.innerHTML = '<span class="status-dot status-unknown"></span><span>Requesting public server information…</span>';

  const started = Date.now();
  try {
    const response = await fetch(serverUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    const elapsed = Date.now() - started;
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText || "response"}`);
    }
    const info = await response.json() as { ServerName?: string; Version?: string; ProductName?: string };
    const name = info.ServerName || info.ProductName || "Jellyfin server";
    const version = info.Version ? ` · Jellyfin ${info.Version}` : "";
    serverResult.innerHTML = `<span class="status-dot status-pass"></span><span><strong>${escapeHtml(name)}</strong>${escapeHtml(version)} · ${elapsed} ms · Public info endpoint responded.</span>`;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown request error";
    const corsHint = reason === "Failed to fetch"
      ? " The browser may be blocking this cross-origin request (CORS), or the server may be unreachable."
      : "";
    serverResult.innerHTML = `<span class="status-dot status-fail"></span><span><strong>Connection test failed:</strong> ${escapeHtml(reason)}${escapeHtml(corsHint)}</span>`;
  } finally {
    serverButton.disabled = false;
    serverButton.textContent = "TEST CONNECTION";
  }
});
