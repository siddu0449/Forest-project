import { useEffect, useState, useMemo } from "react";

export default function GateDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Load visitors and vehicles from localStorage
  useEffect(() => {
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const loadData = () => {
    const visitorList = JSON.parse(localStorage.getItem("visitorList")) || [];
    const vehicleList = JSON.parse(localStorage.getItem("vehicles")) || [];

    const normalizedVisitors = visitorList.map((v) => ({
      ...v,
      safariStatus: v.safariStatus || "pending",
      isActiveTrip: v.isActiveTrip ?? false,
    }));

    setVisitors(normalizedVisitors);
    setVehicles(vehicleList);
  };

  // Filter visitors for selected date and payment done
 // Filter visitors for selected date and payment done
const gateVisitors = useMemo(() => {
  return visitors
    .filter((v) => v.safariDate === selectedDate && v.paymentDone)
    .map((v) => {
      // Find vehicle info for this visitor
      let vehicleNumber = "";
      let driverName = "";

      for (const veh of vehicles) {
        const passenger = veh.passengers.find(
          (p) => p.name === v.name && p.phone === v.phone
        );
        if (passenger) {
          // Only assign vehicle if driverName exists
          if (veh.driverName) {
            vehicleNumber = veh.vehicleNumber;
            driverName = veh.driverName;
          }
          break;
        }
      }

      // Skip visitors whose assigned vehicle has no driver
      if (!driverName) return null;

      return { ...v, vehicle: vehicleNumber, driver: driverName };
    })
    .filter(Boolean); // remove nulls
}, [visitors, vehicles, selectedDate]);


  const updateStorage = (updated) => {
    localStorage.setItem("visitorList", JSON.stringify(updated));
    setVisitors(updated);
  };

  // ▶ START SAFARI
  const startSafari = (id) => {
    const updated = visitors.map((v) =>
      v.id === id
        ? {
            ...v,
            safariStatus: "started",
            gateInTime: Date.now(),
            isActiveTrip: true,
          }
        : v
    );
    updateStorage(updated);
  };

  // ⏹ END SAFARI
  const endSafari = (id) => {
    const updated = visitors.map((v) =>
      v.id === id
        ? {
            ...v,
            safariStatus: "completed",
            gateOutTime: Date.now(),
            isActiveTrip: false,
          }
        : v
    );
    updateStorage(updated);
  };

  return (
    <div className="min-h-screen p-4 bg-green-50">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Gate Dashboard</h1>

      <div className="mb-4 flex items-center gap-2">
        <label className="font-semibold">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-green-200">
            <tr>
              <th className="p-2 border">Token</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Vehicle</th>
              <th className="p-2 border">Driver</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {gateVisitors.map((v) => {
              const isCompleted = v.safariStatus === "completed";

              return (
                <tr
                  key={v.id}
                  className={`text-center ${isCompleted ? "bg-gray-100 text-gray-500" : ""}`}
                >
                  <td className="p-2 border font-bold text-blue-700">{v.token}</td>
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">{v.phone}</td>
                  <td className="p-2 border">{v.vehicle || "-"}</td>
                  <td className="p-2 border">{v.driver || "-"}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => startSafari(v.id)}
                      disabled={v.safariStatus !== "pending"}
                      className={`px-2 py-1 rounded text-white ${
                        v.safariStatus === "pending" ? "bg-blue-600" : "bg-gray-400"
                      }`}
                    >
                      Start
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => endSafari(v.id)}
                      disabled={v.safariStatus !== "started"}
                      className={`px-2 py-1 rounded text-white ${
                        v.safariStatus === "started" ? "bg-green-700" : "bg-gray-400"
                      }`}
                    >
                      End
                    </button>
                  </td>
                  <td className="p-2 border font-semibold capitalize">{v.safariStatus}</td>
                </tr>
              );
            })}

            {gateVisitors.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No gate entries for selected date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
