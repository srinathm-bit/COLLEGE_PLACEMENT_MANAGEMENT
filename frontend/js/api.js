const API_BASE_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

function setToken(token) {
  localStorage.setItem("access_token", token);
}

function clearToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
}

function getRole() {
  return localStorage.getItem("role");
}

function setRole(role) {
  localStorage.setItem("role", role);
}

/**
 * Central fetch wrapper. Automatically attaches the Bearer token
 * (if present) and parses JSON. Throws an Error with the API's
 * detail message on non-2xx responses, so callers can just try/catch.
 */
async function apiRequest(path, { method = "GET", body = null, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let requestBody = null;
  if (body !== null) {
    if (isFormData) {
      requestBody = body; // browser sets multipart headers automatically
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (response.status === 204) {
    return null; // no content
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.blob();

  if (!response.ok) {
    const message = (data && data.detail) ? data.detail : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}