async function sendAuth(url) {
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!login || !password) {
    alert("Введите login и password");
    return;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ login, password })
  });

  const data = await res.json();

  if (data.status === "success") {
    window.location.href = "/dashboard";
    return;
  }

  window.location.href = "/error";
}

function login() {
  sendAuth("/api/login");
}

function register() {
  sendAuth("/api/register");
}