const roleSelect = document.getElementById("role");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = "block";
  successBox.style.display = "none";
}

function showSuccess(message) {
  successBox.textContent = message;
  successBox.style.display = "block";
  errorBox.style.display = "none";
}

// Maps the selected role to its specific login endpoint —
// matches the three separate login routes built in the backend.
const LOGIN_ENDPOINTS = {
  student: "/api/auth/student/login",
  admin: "/api/auth/admin/login",
  company: "/api/auth/company/login",
};

const DASHBOARD_PAGES = {
  student: "student-dashboard.html",
  admin: "admin-dashboard.html",
  company: "company-dashboard.html",
};

loginBtn.addEventListener("click", async () => {
  errorBox.style.display = "none";
  successBox.style.display = "none";

  const role = roleSelect.value;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  try {
    const data = await apiRequest(LOGIN_ENDPOINTS[role], {
      method: "POST",
      body: { email, password },
    });

    setToken(data.access_token);
    setRole(role);
    showSuccess("Login successful — redirecting...");

    setTimeout(() => {
      window.location.href = DASHBOARD_PAGES[role];
    }, 500);
  } catch (err) {
    showError(err.message);
  }
});