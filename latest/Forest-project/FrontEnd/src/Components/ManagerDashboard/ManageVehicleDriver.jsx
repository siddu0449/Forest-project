import { useEffect, useState } from "react";
import ManagerTabs from "./ManagerTabs";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManageVehicleDriver() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- DRIVERS ----------------
  const [drivers, setDrivers] = useState([]);
  const [driverName, setDriverName] = useState("");

  // ---------------- VEHICLES ----------------
  const [vehicles, setVehicles] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Load data from backend
  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, [selectedDate]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vehicle-driver/drivers?date=${selectedDate}`);
      const data = await response.json();
      console.log('Drivers response:', data);
      if (data.success) {
        setDrivers(data.data);
        // Backup to localStorage
        localStorage.setItem("drivers", JSON.stringify(data.data));
      } else {
        console.error('Failed to fetch drivers:', data.message);
      }
    } catch (err) {
      console.error('Fetch drivers error:', err);
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem("drivers")) || [];
      setDrivers(stored);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vehicle-driver/vehicles?date=${selectedDate}`);
      const data = await response.json();
      console.log('Vehicles response:', data);
      if (data.success) {
        setVehicles(data.data);
        // Backup to localStorage
        localStorage.setItem("vehicles", JSON.stringify(data.data));
      } else {
        console.error('Failed to fetch vehicles:', data.message);
      }
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem("vehicles")) || [];
      setVehicles(stored);
    } finally {
      setLoading(false);
    }
  };

  // Check if driver is available on selected date
  const isDriverAvailable = (driver) => {
    return driver.availableOnDate !== false;
  };

  // Check if vehicle is available on selected date
  const isVehicleAvailable = (vehicle) => {
    return vehicle.availableOnDate !== false;
  };

  // ---------------- DRIVER ACTIONS ----------------
  const addDriver = async () => {
    if (!driverName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/vehicle-driver/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: driverName })
      });

      const data = await response.json();
      if (data.success) {
        setDriverName("");
        fetchDrivers();
        alert('Driver added successfully!');
      } else {
        alert(data.message || 'Failed to add driver');
      }
    } catch (err) {
      console.error('Add driver error:', err);
      alert('Failed to add driver');
    }
  };

  const toggleDriverAvailability = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vehicle-driver/drivers/${id}/toggle-availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      const data = await response.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert(data.message || 'Failed to update availability');
      }
    } catch (err) {
      console.error('Toggle driver availability error:', err);
      alert('Failed to update availability');
    }
  };

  const toggleDriver = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vehicle-driver/drivers/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        fetchDrivers();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle driver status error:', err);
      alert('Failed to update status');
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const response = await fetch(`${API_URL}/vehicle-driver/drivers/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchDrivers();
        alert('Driver deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete driver');
      }
    } catch (err) {
      console.error('Delete driver error:', err);
      alert('Failed to delete driver');
    }
  };

  // ---------------- VEHICLE ACTIONS ----------------
  const addVehicle = async () => {
    if (!vehicleNumber.trim() || !ownerName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/vehicle-driver/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: vehicleNumber,
          owner: ownerName,
          capacity: 10
        })
      });

      const data = await response.json();
      if (data.success) {
        setVehicleNumber("");
        setOwnerName("");
        fetchVehicles();
        alert('Vehicle added successfully!');
      } else {
        alert(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      console.error('Add vehicle error:', err);
      alert('Failed to add vehicle');
    }
  };

  const toggleVehicleAvailability = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vehicle-driver/vehicles/${id}/toggle-availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      const data = await response.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.message || 'Failed to update availability');
      }
    } catch (err) {
      console.error('Toggle vehicle availability error:', err);
      alert('Failed to update availability');
    }
  };

  const toggleVehicle = async (id) => {
    try {
      const response = await fetch(`${API_URL}/vehicle-driver/vehicles/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle vehicle status error:', err);
      alert('Failed to update status');
    }
  };

  const deleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch(`${API_URL}/vehicle-driver/vehicles/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchVehicles();
        alert('Vehicle deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete vehicle');
      }
    } catch (err) {
      console.error('Delete vehicle error:', err);
      alert('Failed to delete vehicle');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Manage Vehicle & Driver
      </h1>

      <ManagerTabs />

      {/* Date Selector */}
      <div className="mb-6 bg-blue-50 p-4 rounded shadow">
        <label className="font-semibold mr-3">Select Date to Manage Availability:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
        <p className="text-sm text-gray-600 mt-2">
          Toggle availability for drivers and vehicles on <span className="font-bold">{selectedDate}</span>
        </p>
      </div>

      {/* ================= DRIVERS ================= */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Drivers</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Driver Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDriver()}
            className="border p-2 rounded w-64"
          />
          <button
            onClick={addDriver}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Add Driver
          </button>
        </div>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Driver Name</th>
              <th className="p-2 border">Overall Status</th>
              <th className="p-2 border">Availability on {selectedDate}</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const availableOnDate = isDriverAvailable(d);
              return (
                <tr key={d.id} className="text-center">
                  <td className="p-2 border font-semibold">{d.name}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded text-sm ${
                      d.active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <span className={`px-3 py-1 rounded font-semibold ${
                      availableOnDate 
                        ? "bg-green-200 text-green-800" 
                        : "bg-red-200 text-red-800"
                    }`}>
                      {availableOnDate ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => toggleDriverAvailability(d.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          availableOnDate
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {availableOnDate ? "Mark Unavailable" : "Mark Available"}
                      </button>
                      <button
                        onClick={() => toggleDriver(d.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          d.active
                            ? "bg-gray-500 text-white hover:bg-gray-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        {d.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteDriver(d.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-gray-500 text-center">
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

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Vehicle Number (e.g., KA-01-AB-1234)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="border p-2 rounded flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addVehicle()}
            className="border p-2 rounded flex-1 min-w-[200px]"
          />
          <button
            onClick={addVehicle}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Vehicle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border whitespace-nowrap">Vehicle Number</th>
                <th className="p-2 border whitespace-nowrap">Owner Name</th>
                <th className="p-2 border whitespace-nowrap">Overall Status</th>
                <th className="p-2 border whitespace-nowrap">Availability on {selectedDate}</th>
                <th className="p-2 border whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map((v) => {
                const availableOnDate = isVehicleAvailable(v);
                return (
                  <tr key={v.id} className="text-center">
                    <td className="p-2 border whitespace-nowrap font-semibold">{v.number}</td>
                    <td className="p-2 border whitespace-nowrap">{v.owner}</td>
                    <td className="p-2 border whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-sm ${
                        v.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {v.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      <span className={`px-3 py-1 rounded font-semibold ${
                        availableOnDate 
                          ? "bg-green-200 text-green-800" 
                          : "bg-red-200 text-red-800"
                      }`}>
                        {availableOnDate ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td className="p-2 border">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => toggleVehicleAvailability(v.id)}
                          className={`px-2 py-1 text-sm rounded whitespace-nowrap ${
                            availableOnDate
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {availableOnDate ? "Mark Unavailable" : "Mark Available"}
                        </button>

                        <button
                          onClick={() => toggleVehicle(v.id)}
                          className={`px-2 py-1 text-sm rounded whitespace-nowrap ${
                            v.active
                              ? "bg-gray-500 text-white hover:bg-gray-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          {v.active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteVehicle(v.id)}
                          className="bg-red-600 text-white px-2 py-1 text-sm rounded whitespace-nowrap hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-gray-500 text-center">
                    No vehicles added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
