document.title = "CPMS - Admin Dashboard";

document.body.innerHTML = `
  <div class="container wide">
    <h1>Admin Dashboard</h1>
    <div class="card-grid">
      <a class="card" href="admin-students.html">
        <h3>Student List</h3>
        <p>View and manage all registered students</p>
      </a>
      <a class="card" href="admin-companies.html">
        <h3>Company List</h3>
        <p>View and manage all registered companies</p>
      </a>
    </div>
  </div>`;

const apiScript = document.createElement("script");
apiScript.src = "../js/api.js";
document.body.appendChild(apiScript);

apiScript.onload = () => {
  const navScript = document.createElement("script");
  navScript.src = "../js/nav.js";
  navScript.onload = () => renderNav("admin", "Admin Dashboard");
  document.body.appendChild(navScript);
};