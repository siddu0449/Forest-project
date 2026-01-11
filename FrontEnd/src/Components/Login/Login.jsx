import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import bgLogin from "../Images/Bg Login.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
 


  // 🔐 Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showManagerPassword, setShowManagerPassword] = useState(false);

  const navigate = useNavigate();

  const MANAGER_SECURITY_ANSWER = "forest123";
  const MANAGER_PASSWORD = "manager@123";

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    const USERS = {
      manager: { password: "manager@123", role: ROLES.MANAGER },
      reception: { password: "reception@123", role: ROLES.RECEPTION },
      gate: { password: "gate@123", role: ROLES.GATE },
    };

    const user = USERS[username];

    if (!user || user.password !== password || user.role !== role) {
      alert("Invalid credentials or role");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", username);

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
  };

  const handleSecurityCheck = () => {
    if (securityAnswer === MANAGER_SECURITY_ANSWER) {
      setShowManagerPassword(true);
    } else {
      alert("Wrong answer");
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
        <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
          Login
        </button>

        {/* Forgot Password Toggle */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => {
              setShowForgot(!showForgot);
              setShowManagerPassword(false);
              setSecurityAnswer("");
            }}
            className="text-sm text-green-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* 🔐 Forgot Password Section */}
        {showForgot && (
          <div className="mt-4 border-t pt-4">
            <p className="font-semibold text-sm mb-2 text-gray-700">
              Manager Security Question
            </p>

            <p className="text-sm mb-2">
              What is the forest secret code?
            </p>

            <input
              type="text"
              placeholder="Enter answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <button
              type="button"
              onClick={handleSecurityCheck}
              className="w-full bg-blue-600 text-white py-1 rounded"
            >
              Verify Answer
            </button>

            {/* ✅ Show Manager Password */}
            {showManagerPassword && (
              <div className="mt-3 bg-green-100 border border-green-400 p-2 rounded text-center">
                <p className="text-sm font-semibold text-green-800">
                  Manager Password
                </p>
                <p className="font-bold">{MANAGER_PASSWORD}</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
