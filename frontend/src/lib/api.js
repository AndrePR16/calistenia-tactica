const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("ct_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("ct_token", token);
  else localStorage.removeItem("ct_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  leadTest: (answers) => request("/lead-test", { method: "POST", body: answers }),
  purchase: (email, leadId) =>
    request("/purchase", { method: "POST", body: { email, leadId } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  getProfile: () => request("/profile", { auth: true }),
  saveProfile: (answers) =>
    request("/profile", { method: "POST", body: answers, auth: true }),
  onboardingOptions: () => request("/onboarding-options"),
  getDays: () => request("/routines", { auth: true }),
  getDay: (day) => request(`/routines/${day}`, { auth: true }),
  completeDay: (day) =>
    request(`/routines/${day}/complete`, { method: "POST", auth: true }),
};
