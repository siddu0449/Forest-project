import { NavLink } from "react-router-dom";

export default function ManagerTabs() {
  const tabClass = ({ isActive }) =>
    `px-4 py-2 rounded font-semibold transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-300 hover:bg-gray-400"
    }`;

  return (
    <div className="flex gap-3 mb-6">
      <NavLink to="/manager/dashboard" className={tabClass}>
        Dashboard
      </NavLink>

      <NavLink to="/manager/manage" className={tabClass}>
        Manage Vehicle & Driver
      </NavLink>

      <NavLink to="/manager/password" className={tabClass}>
        Password Management
      </NavLink>
    </div>
  );
}
