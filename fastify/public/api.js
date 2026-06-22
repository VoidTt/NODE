async function sendText(action) {
  const input = document.getElementById("input-text");
  const result = document.getElementById("result");
  const text = input.value.trim();

  if (!text) {
    result.textContent = "Введите текст";
    return;
  }

  const res = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, action })
  });

  const data = await res.json();
  result.textContent = data.result ?? data.status ?? "Нет ответа";
}

window.sendText = sendText;