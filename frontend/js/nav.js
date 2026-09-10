/**
 * Renders a top nav bar with a logout button, and redirects to login
 * if there's no token or the role doesn't match what's expected on this page.
 */
function renderNav(expectedRole, pageTitle) {
  const token = getToken();
  const role = getRole();

  if (!token || role !== expectedRole) {
    window.location.href = "login.html";
    return;
  }

  const nav = document.createElement("nav");
  nav.innerHTML = `
    <span class="brand">CPMS — ${pageTitle}</span>
    <button id="logoutBtn">Logout</button>
  `;
  document.body.prepend(nav);

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearToken();
    window.location.href = "login.html";
  });
}