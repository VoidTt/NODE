const TOP_ACTIONS = document.getElementById("top-actions");
const FUNCTIONS_CONTAINER = document.getElementById("functions-container");

const DEFAULT_SETTINGS = {
  theme: "dark",
  accent: "#ff8800"
};

function brighten(hex, percent) {
  const value = String(hex || "").replace("#", "").trim();
  if (value.length !== 6) return "#ff9f2f";

  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return "#ff9f2f";

  const step = Math.round((255 * percent) / 100);
  const r = Math.min(255, ((num >> 16) & 255) + step);
  const g = Math.min(255, ((num >> 8) & 255) + step);
  const b = Math.min(255, (num & 255) + step);

  return `rgb(${r}, ${g}, ${b})`;
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

async function applyTheme() {
  const settings = await getSettings();
  document.body.classList.toggle("light", settings.theme === "light");
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.documentElement.style.setProperty("--accent-hover", brighten(settings.accent, 12));
}

function isRestrictedUrl(url) {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("chrome-extension://")
  );
}

function getSafeTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];

    if (!tab?.id || !tab.url) {
      alert("Нет активной вкладки");
      return;
    }

    if (isRestrictedUrl(tab.url)) {
      alert("Открой обычный сайт");
      return;
    }

    callback(tab.id);
  });
}

function runInTab(func) {
  getSafeTab((tabId) => {
    chrome.scripting.executeScript({ target: { tabId }, func }, () => {
      if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
      }
    });
  });
}

function addTopButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  TOP_ACTIONS.appendChild(btn);
  return btn;
}

function registerFunction(def) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = def?.name || "Функция";

  const body = document.createElement("div");

  card.append(title, body);

  try {
    if (typeof def?.render === "function") {
      def.render(body, getSafeTab);
    } else {
      const note = document.createElement("div");
      note.className = "small-note";
      note.textContent = "Модуль без render()";
      body.append(note);
    }
  } catch (e) {
    const note = document.createElement("div");
    note.className = "small-note";
    note.textContent = "Ошибка модуля";
    body.append(note);
    console.error(def?.name, e);
  }

  FUNCTIONS_CONTAINER.appendChild(card);
}

function toggleOverlay() {
  const existing = document.getElementById("my-overlay");
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement("div");
  panel.id = "my-overlay";
  panel.style.cssText = [
    "position:fixed",
    "top:20px",
    "right:20px",
    "z-index:2147483647",
    "width:320px",
    "background:#111827",
    "color:#fff",
    "border:1px solid rgba(255,255,255,.12)",
    "border-radius:16px",
    "box-shadow:0 20px 50px rgba(0,0,0,.35)",
    "overflow:hidden",
    "font:14px system-ui,sans-serif"
  ].join(";");

  const header = document.createElement("div");
  header.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:space-between",
    "gap:10px",
    "padding:10px 12px",
    "cursor:move",
    "background:rgba(255,255,255,.06)"
  ].join(";");

  const title = document.createElement("div");
  title.textContent = "Assistant";
  title.style.fontWeight = "700";

  const close = document.createElement("button");
  close.textContent = "✕";
  close.style.cssText = [
    "border:0",
    "background:transparent",
    "color:#fff",
    "font-size:16px",
    "cursor:pointer",
    "padding:0 2px"
  ].join(";");

  const content = document.createElement("div");
  content.textContent = "Панель открыта.";
  content.style.cssText = [
    "padding:12px",
    "line-height:1.5",
    "color:rgba(255,255,255,.82)"
  ].join(";");

  header.append(title, close);
  panel.append(header, content);
  document.body.appendChild(panel);

  close.addEventListener("click", () => panel.remove());

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let panelX = 0;
  let panelY = 0;

  header.addEventListener("pointerdown", (e) => {
    dragging = true;
    const rect = panel.getBoundingClientRect();
    panelX = rect.left;
    panelY = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    panel.style.left = `${panelX}px`;
    panel.style.top = `${panelY}px`;
    panel.style.right = "auto";
    header.setPointerCapture(e.pointerId);
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    panel.style.left = `${panelX + (e.clientX - startX)}px`;
    panel.style.top = `${panelY + (e.clientY - startY)}px`;
  });

  const stop = () => {
    dragging = false;
  };

  header.addEventListener("pointerup", stop);
  header.addEventListener("pointercancel", stop);
}

async function toggleMiniPlayer() {
  const existing = document.getElementById("assistant-mini-player");
  if (existing) {
    existing.remove();
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    }
    return;
  }

  const video = document.querySelector("video");
  if (!video) {
    alert("Видео не найдено");
    return;
  }

  if (video.requestPictureInPicture) {
    try {
      await video.play().catch(() => {});
      await video.requestPictureInPicture();
      return;
    } catch (e) {
      console.warn(e);
    }
  }

  const box = document.createElement("div");
  box.id = "assistant-mini-player";
  box.style.cssText = [
    "position:fixed",
    "right:20px",
    "bottom:20px",
    "width:340px",
    "z-index:2147483647",
    "border-radius:16px",
    "overflow:hidden",
    "background:#000",
    "box-shadow:0 20px 50px rgba(0,0,0,.5)",
    "resize:both"
  ].join(";");

  const toolbar = document.createElement("div");
  toolbar.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:space-between",
    "gap:8px",
    "padding:8px",
    "background:rgba(255,255,255,0.08)",
    "color:#fff",
    "cursor:move"
  ].join(";");

  const title = document.createElement("div");
  title.textContent = "Мини-плеер";
  title.style.fontWeight = "700";

  const close = document.createElement("button");
  close.textContent = "✕";
  close.style.cssText = [
    "border:0",
    "background:transparent",
    "color:#fff",
    "font-size:16px",
    "cursor:pointer",
    "padding:0 2px"
  ].join(";");

  const player = document.createElement("video");
  player.controls = true;
  player.autoplay = true;
  player.playsInline = true;
  player.muted = video.muted;
  player.style.cssText = "display:block;width:100%;height:auto;background:#000;";

  const source = video.currentSrc || video.src || video.querySelector("source")?.src || "";
  if (source) {
    player.src = source;
  } else {
    const clone = video.cloneNode(true);
    clone.controls = true;
    clone.autoplay = true;
    clone.playsInline = true;
    clone.style.cssText = "display:block;width:100%;height:auto;background:#000;";
    box.append(toolbar, clone);
    document.body.appendChild(box);
    close.addEventListener("click", () => box.remove());
    return;
  }

  toolbar.append(title, close);
  box.append(toolbar, player);
  document.body.appendChild(box);

  close.addEventListener("click", () => box.remove());

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let boxX = 0;
  let boxY = 0;

  toolbar.addEventListener("pointerdown", (e) => {
    dragging = true;
    const rect = box.getBoundingClientRect();
    boxX = rect.left;
    boxY = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    box.style.left = `${boxX}px`;
    box.style.top = `${boxY}px`;
    box.style.right = "auto";
    box.style.bottom = "auto";
    toolbar.setPointerCapture(e.pointerId);
  });

  toolbar.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    box.style.left = `${boxX + (e.clientX - startX)}px`;
    box.style.top = `${boxY + (e.clientY - startY)}px`;
  });

  const stop = () => {
    dragging = false;
  };

  toolbar.addEventListener("pointerup", stop);
  toolbar.addEventListener("pointercancel", stop);
}

function renderStaticButtons() {
  addTopButton("Панель", () => runInTab(toggleOverlay));
  addTopButton("Мини-плеер", () => runInTab(toggleMiniPlayer));
  addTopButton("Настройки", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("assist_src/settings.html")
    });
  });
}

async function loadModulesSafely() {
  try {
    const registry = await import("./func_src/registry.js");
    const modules = Array.isArray(registry.default) ? registry.default : [];

    for (const modFile of modules) {
      try {
        const mod = await import(`./func_src/${modFile}`);
        if (typeof mod.registerFunctions === "function") {
          mod.registerFunctions(registerFunction);
        }
      } catch (e) {
        console.error(modFile, e);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    applyTheme();
  }
});

applyTheme();
renderStaticButtons();
loadModulesSafely();