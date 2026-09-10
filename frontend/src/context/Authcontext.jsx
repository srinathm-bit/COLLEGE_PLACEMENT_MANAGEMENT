import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(localStorage.getItem("access_token"));
  const [role, setRoleState] = useState(localStorage.getItem("role"));

  function login(newToken, newRole) {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("role", newRole);
    setTokenState(newToken);
    setRoleState(newRole);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    setTokenState(null);
    setRoleState(null);
  }

  const value = { token, role, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}