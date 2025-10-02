import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", form);
      alert(res.data);
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data || "⚠️ Register failed");
    }
  };

  return (
    <div className="auth-container">
  <div className="card">
    <div className="card2">
      <form className="form" onSubmit={handleRegister}>
        <p id="heading">Register</p>

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
            Sign Up
          </button>
          <a href="/login" className="button2">
            Login
          </a>
        </div>
      </form>
    </div>
  </div>
</div>

  );
};

export default RegisterPage;
