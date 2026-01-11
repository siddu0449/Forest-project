import { useState } from "react";
import ManagerTabs from "./ManagerTabs";

export default function PasswordManagement() {
  const roles = ["Manager", "Reception", "Gate"];
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  // Load stored passwords from localStorage (simulate backend)
  const getStoredPassword = (role) =>
    localStorage.getItem(`${role.toLowerCase()}Password`) || "admin123";

  const handleChangePassword = () => {
    setMessage(null);

    const stored = getStoredPassword(selectedRole);

    if (oldPassword !== stored) {
      setMessage({ type: "error", text: "Old password is incorrect." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    localStorage.setItem(`${selectedRole.toLowerCase()}Password`, newPassword);
    setMessage({ type: "success", text: `${selectedRole} password updated successfully!` });

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Password Management</h1>

      {/* ✅ TOGGLE BUTTONS */}
      <ManagerTabs />

      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
        {message && (
          <div
            className={`p-3 mb-4 rounded border ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Role Selection */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Select Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Old Password */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={`Enter old password for ${selectedRole}`}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleChangePassword}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
