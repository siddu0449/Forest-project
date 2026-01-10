import { useEffect, useState } from "react";
import ManagerTabs from "./ManagerTabs";

export default function ManageVehicleDriver() {
  // ---------------- DRIVERS ----------------
  const [drivers, setDrivers] = useState([]);
  const [driverName, setDriverName] = useState("");

  // ---------------- VEHICLES ----------------
  const [vehicles, setVehicles] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState("");

  // Load data
  useEffect(() => {
    setDrivers(JSON.parse(localStorage.getItem("drivers")) || []);
    setVehicles(JSON.parse(localStorage.getItem("vehicles")) || []);
  }, []);

  // Save helpers
  const saveDrivers = (data) => {
    setDrivers(data);
    localStorage.setItem("drivers", JSON.stringify(data));
  };

  const saveVehicles = (data) => {
    setVehicles(data);
    localStorage.setItem("vehicles", JSON.stringify(data));
  };

  // ---------------- DRIVER ACTIONS ----------------
  const addDriver = () => {
    if (!driverName.trim()) return;

    const updated = [
      ...drivers,
      { id: Date.now(), name: driverName, active: true },
    ];
    saveDrivers(updated);
    setDriverName("");
  };

  const toggleDriver = (id) => {
    saveDrivers(
      drivers.map((d) =>
        d.id === id ? { ...d, active: !d.active } : d
      )
    );
  };

  const deleteDriver = (id) => {
    saveDrivers(drivers.filter((d) => d.id !== id));
  };

  // ---------------- VEHICLE ACTIONS ----------------
  const addVehicle = () => {
    if (!vehicleNumber.trim()) return;

    const updated = [
      ...vehicles,
      { id: Date.now(), number: vehicleNumber, active: true },
    ];
    saveVehicles(updated);
    setVehicleNumber("");
  };

  const toggleVehicle = (id) => {
    saveVehicles(
      vehicles.map((v) =>
        v.id === id ? { ...v, active: !v.active } : v
      )
    );
  };

  const deleteVehicle = (id) => {
    saveVehicles(vehicles.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Manage Vehicle & Driver
      </h1>

      <ManagerTabs />

      {/* ================= DRIVERS ================= */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Drivers</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Driver Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button
            onClick={addDriver}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add Driver
          </button>
        </div>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="text-center">
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">
                  {d.active ? "Present" : "Absent"}
                </td>
                <td className="p-2 border flex justify-center gap-3">
                  <button
                    onClick={() => toggleDriver(d.id)}
                    className={`px-3 py-1 rounded ${
                      d.active
                        ? "bg-green-600 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => deleteDriver(d.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500">
                  No drivers added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VEHICLES ================= */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Vehicles</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button
            onClick={addVehicle}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add Vehicle
          </button>
        </div>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Vehicle Number</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="text-center">
                <td className="p-2 border">{v.number}</td>
                <td className="p-2 border">
                  {v.active ? "Available" : "Not Available"}
                </td>
                <td className="p-2 border flex justify-center gap-3">
                  <button
                    onClick={() => toggleVehicle(v.id)}
                    className={`px-4 py-1 rounded ${
                      v.active
                        ? "bg-green-600 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {v.active ? "Available" : "Unavailable"}
                  </button>
                  <button
                    onClick={() => deleteVehicle(v.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500">
                  No vehicles added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
