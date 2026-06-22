export function registerFunctions(register) {
  register({
    name: "🎨 CSS Inspector",
    render: (container, getTabId) => {
      const btn = document.createElement("button");
      btn.textContent = "Инспектор";
      btn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const flag = "__assistantCssInspector";
            if (window[flag]) {
              document.onmouseover = null;
              window[flag] = false;
              return "off";
            }

            document.onmouseover = (e) => {
              e.target.style.outline = "2px solid red";
            };

            window[flag] = true;
            return "on";
          }
        });
      });
      container.appendChild(btn);
    }
  });

  register({
    name: "🔍 Поиск текста",
    render: (container, getTabId) => {
      const input = document.createElement("input");
      input.placeholder = "Введите текст";
      input.style.width = "100%";
      input.style.marginBottom = "8px";

      const btn = document.createElement("button");
      btn.textContent = "Найти";

      btn.onclick = () => getTabId((tabId) => {
        const text = input.value.trim();
        if (!text) return;

        chrome.scripting.executeScript({
          target: { tabId },
          func: (searchText) => {
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const nodes = [];
            let node;

            while ((node = walk.nextNode())) {
              if (node.nodeValue && node.nodeValue.includes(searchText)) {
                nodes.push(node);
              }
            }

            nodes.forEach((textNode) => {
              const span = document.createElement("span");
              span.innerHTML = textNode.nodeValue.split(searchText).join(`<mark>${searchText}</mark>`);
              textNode.parentNode.replaceChild(span, textNode);
            });
          },
          args: [text]
        });
      });

      container.append(input, btn);
    }
  });

  register({
    name: "🧾 Все ссылки",
    render: (container, getTabId) => {
      const btn = document.createElement("button");
      btn.textContent = "Скопировать ссылки";

      btn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => Array.from(document.querySelectorAll("a")).map((a) => a.href)
        }, async (res) => {
          const links = res?.[0]?.result || [];
          await navigator.clipboard.writeText(links.join("\n"));
        });
      });

      container.appendChild(btn);
    }
  });

  register({
    name: "⚡ Обновить страницу",
    render: (container) => {
      const btn = document.createElement("button");
      btn.textContent = "Перезагрузить";
      btn.onclick = () => location.reload();
      container.appendChild(btn);
    }
  });

  register({
    name: "📦 localStorage сайта",
    render: (container, getTabId) => {
      const btn = document.createElement("button");
      btn.textContent = "Показать storage";

      btn.onclick = () => getTabId((tabId) => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => ({ ...localStorage })
        }, (res) => {
          const data = res?.[0]?.result || {};
          alert(JSON.stringify(data, null, 2));
        });
      });

      container.appendChild(btn);
    }
  });

  register({
    name: "📸 Скриншот страницы",
    render: (container) => {
      const btn = document.createElement("button");
      btn.textContent = "Сделать скриншот";

      btn.onclick = () => {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
          if (!dataUrl) return;

          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "screenshot.png";
          a.click();
        });
      };

      container.appendChild(btn);
    }
  });
}