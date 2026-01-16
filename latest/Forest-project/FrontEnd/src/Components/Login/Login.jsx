import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import bgLogin from "../Images/Bg Login.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password || !role) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      // Call backend API for authentication
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Store login info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("username", username);

      // Navigate based on role
      switch (role) {
        case ROLES.RECEPTION:
          navigate("/reception");
          break;
        case ROLES.MANAGER:
          navigate("/manager");
          break;
        case ROLES.GATE:
          navigate("/gate");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${bgLogin})` }}
      ></div>

      <form
        className="relative z-10 bg-white bg-opacity-90 p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={handleLogin}
      >
        <h2 className="text-xl font-bold mb-4 text-green-800 text-center">
          Forest Department Login
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Role */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">Select Role</option>
          <option value={ROLES.MANAGER}>Manager</option>
          <option value={ROLES.RECEPTION}>Reception</option>
          <option value={ROLES.GATE}>Gate</option>
        </select>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* Login */}
        <button 
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
