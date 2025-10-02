import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🔑 Auth state comes from server, not localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  // Check auth from backend on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/check-auth", { credentials: "include" });
        const data = await res.json();
        setIsAuthenticated(data.authenticated); // true/false from server
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 🚪 Handle logout → call backend
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
  };

  // 🔓 Handle login success → backend already set session
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    // still loading check-auth
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Protected Home */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterPage />
            )
          }
        />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
