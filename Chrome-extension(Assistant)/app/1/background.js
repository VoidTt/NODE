chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "download" && msg.url) {
    chrome.downloads.download({
      url: msg.url,
      filename: msg.filename || "file"
    });
  }
});