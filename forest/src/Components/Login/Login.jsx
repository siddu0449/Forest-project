import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import bgLogin from "../Images/Bg Login.jpg"; // background image

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Validate all fields
    if (!username || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    // Users credentials
    const USERS = {
      manager: { password: "manager@123", role: ROLES.MANAGER },
      reception: { password: "reception@123", role: ROLES.RECEPTION },
      gate: { password: "gate@123", role: ROLES.GATE },
    };

    const user = USERS[username];

    // Validate username, password, and role
    if (!user || user.password !== password || user.role !== role) {
      alert("Invalid credentials or role");
      return;
    }

    // Save login info in localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);

    // Redirect based on role
    switch (role) {
      case ROLES.RECEPTION:
        navigate("/reception");
        break;
      case ROLES.MANAGER:
        navigate("/manager"); // implement manager dashboard later
        break;
      case ROLES.GATE:
        navigate("/gate"); // implement gate dashboard later
        break;
      default:
        navigate("/"); // fallback
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${bgLogin})` }}
      ></div>

      {/* Login Form */}
      <form
        className="relative z-10 bg-white bg-opacity-90 p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={handleLogin}
      >
        <h2 className="text-xl font-bold mb-4 text-green-800 text-center">
          Forest Department Login
        </h2>

        {/* Role Dropdown */}
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

        {/* Login Button */}
        <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
          Login
        </button>
      </form>
    </div>
  );
}
