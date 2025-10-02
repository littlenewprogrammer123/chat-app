import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", form);
      alert(res.data.message);

      // save username and notify App
      localStorage.setItem("user", res.data.username);
      if (onLoginSuccess) onLoginSuccess(res.data.username);

      // redirect to chat
      navigate("/");
    } catch (err) {
      alert(err.response?.data || "⚠️ Login failed");
    }
  };

  return (
    <div className="auth-container">
  <div className="card">
    <div className="card2">
      <form className="form" onSubmit={handleLogin}>
        <p id="heading">Login</p>

        <div className="field">
          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="Username"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>

        <div className="btn">
          <button className="button1" type="submit">
            Login
          </button>
          <a href="/register" className="button2">
            Sign Up
          </a>
        </div>
      </form>
    </div>
  </div>
</div>

  );
};

export default LoginPage;
