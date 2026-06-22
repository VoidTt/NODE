const loadBtn = document.getElementById('load-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const imagesContainer = document.getElementById('images-container');
const loaderDiv = document.getElementById('loader');

const state = {
  images: []
};

function getImagesFromPage() {
  return [...document.images]
    .map((img, idx) => ({
      url: img.currentSrc || img.src || '',
      alt: (img.alt || `image_${idx + 1}`).trim(),
      width: img.naturalWidth || img.width || 0,
      height: img.naturalHeight || img.height || 0
    }))
    .filter(({ url }) => /^https?:\/\//i.test(url));
}

function sanitizeFilename(name) {
  return (name || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
}

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]{2,5})$/i);
    if (match) return match[1];
  } catch (_) {}
  return 'jpg';
}

function makeFilename(image, index) {
  const base = sanitizeFilename(image.alt) || `image_${index + 1}`;
  return `${base}.${getExtension(image.url)}`;
}

function downloadImage(url, filename) {
  chrome.downloads.download(
    {
      url,
      filename,
      saveAs: false
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(`Ошибка скачивания ${filename}: ${chrome.runtime.lastError.message}`);
      }
    }
  );
}
function getAllImages() {
    const found = [];

    // img
    document.querySelectorAll('img').forEach((img, i) => {
        found.push({
            type: 'img',
            url: img.currentSrc || img.src,
            alt: img.alt || `img_${i}`
        });
    });

    // background-image
    document.querySelectorAll('*').forEach((el, i) => {
        const bg = getComputedStyle(el).backgroundImage;

        if (bg && bg.includes('url(')) {
            const match = bg.match(/url\(["']?(.*?)["']?\)/);

            if (match) {
                found.push({
                    type: 'background',
                    url: match[1],
                    alt: `background_${i}`
                });
            }
        }
    });

    return found;
}
function setLoader(text, show = true) {
  loaderDiv.textContent = text;
  loaderDiv.classList.toggle('hidden', !show);
}

function clearContainer() {
  imagesContainer.innerHTML = '';
}

function createEmptyMessage(text, isError = false) {
  const p = document.createElement('p');
  p.className = `empty${isError ? ' error' : ''}`;
  p.textContent = text;
  return p;
}

function renderImages(images) {
  clearContainer();

  if (!images.length) {
    imagesContainer.appendChild(createEmptyMessage('Изображения не найдены на этой странице.', true));
    downloadAllBtn.classList.add('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();

  images.forEach((img, idx) => {
    const card = document.createElement('article');
    card.className = 'card';

    const preview = document.createElement('img');
    preview.className = 'preview';
    preview.src = img.url;
    preview.alt = img.alt;
    preview.loading = 'lazy';
    preview.decoding = 'async';
    preview.onerror = () => {
      preview.src =
        'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Crect%20width%3D%2272%22%20height%3D%2272%22%20rx%3D%2214%22%20fill%3D%22%23161f36%22%2F%3E%3Cpath%20d%3D%22M18%2028h36v18H18z%22%20fill%3D%22%23ffb020%22%20fill-opacity%3D%22.18%22%2F%3E%3Cpath%20d%3D%22M24%2042l7-8%205%206%204-4%2012%2010H24z%22%20fill%3D%22%23ffb020%22%20fill-opacity%3D%22.8%22%2F%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2228%22%20r%3D%224%22%20fill%3D%22%23ffb020%22%20fill-opacity%3D%22.8%22%2F%3E%3C%2Fsvg%3E';
    };

    const info = document.createElement('div');
    info.className = 'card-info';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = img.alt || `image_${idx + 1}`;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = `${img.width}×${img.height}`;

    const url = document.createElement('div');
    url.className = 'card-url';
    url.title = img.url;
    url.textContent = img.url;

    info.append(title, meta, url);

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-single-btn';
    downloadBtn.type = 'button';
    downloadBtn.textContent = '⬇️ Скачать';
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadImage(img.url, makeFilename(img, idx));
    });

    card.append(preview, info, downloadBtn);
    fragment.appendChild(card);
  });

  imagesContainer.appendChild(fragment);
  downloadAllBtn.classList.remove('hidden');
}

function downloadAll() {
  if (!state.images.length) return;

  state.images.forEach((img, idx) => {
    setTimeout(() => {
      downloadImage(img.url, makeFilename(img, idx));
    }, idx * 200);
  });
}

function handleResult(results) {
  setLoader('Готово', false);

  const found = results?.[0]?.result;
  state.images = Array.isArray(found) ? found : [];
  renderImages(state.images);
}

loadBtn.addEventListener('click', () => {
  clearContainer();
  downloadAllBtn.classList.add('hidden');
  state.images = [];

  setLoader('Идёт поиск изображений…', true);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs?.[0];

    if (!activeTab?.id) {
      setLoader('Активная вкладка не найдена.', true);
      imagesContainer.appendChild(createEmptyMessage('Нет активной вкладки.', true));
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        func: getImagesFromPage
      },
      (results) => {
        if (chrome.runtime.lastError) {
          setLoader('Ошибка', true);
          imagesContainer.appendChild(
            createEmptyMessage(`Ошибка: ${chrome.runtime.lastError.message}`, true)
          );
          return;
        }

        handleResult(results);
      }
    );
  });
});

downloadAllBtn.addEventListener('click', downloadAll);