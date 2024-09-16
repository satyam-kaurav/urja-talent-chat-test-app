import React, { useState } from "react";
import "../styles/Login.css"; // Import the CSS file for styling

const Login_Roles = [
  { value: "admin", text: "Admin" },
  { value: "operation", text: "Operation" },
  { value: "account", text: "Account" },
  { value: "teacher", text: "Teacher" },
  { value: "parent", text: "Parent" },
];

const de_value = {
  admin: "admin",
  operation: "employee",
  account: "employee",
  teacher: "teacher",
  parent: "parent",
};

export default function Login({ setUser }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(Login_Roles[0].value); // Default to the first role

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    setLoading(true);
    setError(null); // Clear previous errors

    const url = `http://localhost:4000/${role}/login`;
    const body =
      role === "admin" ? { username: email, password } : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Send the email/username and password
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { data } = await response.json();

      const user = data[de_value[role]] || "admin";
      const token = role === "admin" ? data : data.token;

      const user_info = {
        is_login: true,
        _id: user._id,
        uid: user.uid,
        name: user.visibleName || user.name || "Admin",
        image: user.image_key || null,
        phone: user.phone || null,
        role: user.role || role,
        token: token,
      };

      console.log(user_info);

      setUser(user_info);
    } catch (err) {
      console.error(err);
      setError("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>

        <label htmlFor="role">Login as:</label>
        <select name="role" value={role} onChange={handleRoleChange}>
          {Login_Roles.map(({ value, text }, index) => (
            <option key={index} value={value}>
              {text}
            </option>
          ))}
        </select>

        <label htmlFor="email">{role === "admin" ? "Username" : "Email"}</label>
        <input
          name="email"
          type={role === "admin" ? "text" : "email"}
          placeholder={
            role === "admin" ? "Enter your username" : "Enter your email"
          }
          required
        />

        <label htmlFor="password">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
