const DEFAULT_SETTINGS = {
  theme: "dark",
  accent: "#ff8800"
};

const themeSelect = document.getElementById("theme");
const accentInput = document.getElementById("accent");
const saveBtn = document.getElementById("save");

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

async function applyTheme(settings = await getSettings()) {
  document.body.classList.toggle("light", settings.theme === "light");
  document.documentElement.style.setProperty("--accent", settings.accent);
  document.documentElement.style.setProperty("--accent-hover", brighten(settings.accent, 12));
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
  await applyTheme(settings);
}

(async () => {
  const settings = await getSettings();
  themeSelect.value = settings.theme;
  accentInput.value = settings.accent;
  await applyTheme(settings);
})();

saveBtn.addEventListener("click", async () => {
  const settings = {
    theme: themeSelect.value,
    accent: accentInput.value
  };

  await saveSettings(settings);
  saveBtn.textContent = "Сохранено";
  setTimeout(() => {
    saveBtn.textContent = "Сохранить";
  }, 900);
});