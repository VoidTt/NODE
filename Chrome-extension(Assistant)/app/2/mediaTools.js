export function registerFunctions(register) {
  register({
    name: "📥 Скачать изображения",
    render: (container, getTabId) => {
      container.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="load-btn">Загрузить</button>
          <button id="download-all-btn" style="display:none;">Скачать все</button>
        </div>
        <div id="loader" style="display:none;margin-top:8px;">Загрузка...</div>
        <div id="images-container" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;"></div>
      `;

      const loadBtn = container.querySelector("#load-btn");
      const downloadAllBtn = container.querySelector("#download-all-btn");
      const loaderDiv = container.querySelector("#loader");
      const imagesContainer = container.querySelector("#images-container");

      let currentImages = [];

      function selectImagesFromPage() {
        return Array.from(document.querySelectorAll("img"))
          .map((img, idx) => ({
            url: img.currentSrc || img.src || "",
            alt: img.alt || `image_${idx + 1}`,
            width: img.width || 0,
            height: img.height || 0
          }))
          .filter((img) => img.url && img.url.startsWith("http"));
      }

      function downloadImage(url, filename) {
        chrome.runtime.sendMessage({ type: "download", url, filename });
      }

      function makeName(img, idx) {
        const base = (img.alt || `image_${idx + 1}`).replace(/[\\/:*?"<>|]/g, "").trim();
        return `${base || `image_${idx + 1}`}.jpg`;
      }

      function renderImages(images) {
        imagesContainer.innerHTML = "";

        images.forEach((img, idx) => {
          const card = document.createElement("div");
          card.style.cssText = `
            display:flex;
            flex-direction:column;
            gap:6px;
            padding:8px;
            border-radius:12px;
            background: rgba(255,255,255,0.05);
          `;

          const preview = document.createElement("img");
          preview.src = img.url;
          preview.alt = img.alt;
          preview.style.cssText = "width:100%;max-height:120px;object-fit:cover;border-radius:8px;";

          const info = document.createElement("div");
          info.style.cssText = "font-size:12px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
          info.textContent = `${img.alt} • ${img.width}×${img.height}`;

          const btn = document.createElement("button");
          btn.textContent = "⬇️ Скачать";
          btn.onclick = () => downloadImage(img.url, makeName(img, idx));

          card.append(preview, info, btn);
          imagesContainer.appendChild(card);
        });

        downloadAllBtn.style.display = images.length ? "inline-block" : "none";
      }

      loadBtn.onclick = () => {
        loaderDiv.style.display = "block";

        getTabId((tabId) => {
          chrome.scripting.executeScript(
            { target: { tabId }, func: selectImagesFromPage },
            (res) => {
              loaderDiv.style.display = "none";
              currentImages = res?.[0]?.result || [];
              renderImages(currentImages);
            }
          );
        });
      };

      downloadAllBtn.onclick = () => {
        currentImages.forEach((img, i) => {
          setTimeout(() => {
            downloadImage(img.url, `${img.alt || "image"}_${i}.jpg`);
          }, i * 200);
        });
      };
    }
  });

  register({
    name: "🎬 Видео",
    render: (container, getTabId) => {
      container.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="speed-btn">x2</button>
          <button id="mute-btn">Mute</button>
          <button id="download-video-btn">Скачать видео</button>
        </div>
      `;

      const speedBtn = container.querySelector("#speed-btn");
      const muteBtn = container.querySelector("#mute-btn");
      const downloadVideoBtn = container.querySelector("#download-video-btn");

      speedBtn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => document.querySelectorAll("video").forEach((v) => (v.playbackRate = 2))
        });
      });

      muteBtn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => document.querySelectorAll("video").forEach((v) => (v.muted = true))
        });
      });

      downloadVideoBtn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => Array.from(document.querySelectorAll("video")).map((v) => v.currentSrc || v.src || v.querySelector("source")?.src || "").filter(Boolean)
        }, (res) => {
          const urls = res?.[0]?.result || [];
          urls.forEach((url, i) => {
            chrome.runtime.sendMessage({ type: "download", url, filename: `video_${i + 1}.mp4` });
          });
        });
      });
    }
  });
}