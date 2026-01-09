import { useEffect, useState, useMemo } from "react";

export default function ReceptionDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState("reception");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    const storedVisitors = JSON.parse(localStorage.getItem("visitorList")) || [];
    setVisitors(storedVisitors);

    const storedVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    setVehicles(storedVehicles);
  }, []);

  /* -------------------- TIMER -------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => {
        const updated = prev
          .map(v => {
            if (!v.paymentDone && v.timeLeft > 0) {
              return { ...v, timeLeft: v.timeLeft - 1 };
            }
            return v;
          })
          .filter(v => !(v.timeLeft === 0 && !v.paymentDone));

        localStorage.setItem("visitorList", JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* -------------------- FILTER -------------------- */
  const filteredVisitors = useMemo(
    () => visitors.filter(v => v.safariDate === selectedDate),
    [visitors, selectedDate]
  );

  const formatTime = sec => {
    if (!sec || sec <= 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* -------------------- AUTO ASSIGN VEHICLES -------------------- */
  const autoAssignVehicle = visitor => {
    setVehicles(prev => {
      let updated = [...prev];

      const allSubTokens = Array.from(
        { length: visitor.totalSeats },
        (_, i) => `${visitor.token}-${String.fromCharCode(65 + i)}`
      );

      const usedSubTokens = updated.flatMap(v =>
        v.passengers
          .filter(p => p.subToken.startsWith(`${visitor.token}-`))
          .map(p => p.subToken)
      );

      const remainingSubTokens = allSubTokens.filter(
        st => !usedSubTokens.includes(st)
      );

      let remainingSeats = remainingSubTokens.length;
      let index = 0;

      while (remainingSeats > 0) {
        let vehicle = updated.find(v => v.seatsFilled < 6 && v.status !== "moved");

        if (!vehicle) {
          vehicle = {
            vehicleNumber: updated.length + 1,
            seatsFilled: 0,
            capacity: 6,
            passengers: [],
            driverName: "",
            status: "waiting"
          };
          updated.push(vehicle);
        }

        const available = vehicle.capacity - vehicle.seatsFilled;
        const assignCount = Math.min(available, remainingSeats);

        for (let i = 0; i < assignCount; i++) {
          vehicle.passengers.push({
            subToken: remainingSubTokens[index],
            name: visitor.name,
            phone: visitor.phone
          });
          index++;
        }

        vehicle.seatsFilled += assignCount;
        remainingSeats -= assignCount;

        if (vehicle.seatsFilled === vehicle.capacity) {
          vehicle.status = "ready";
        }
      }

      localStorage.setItem("vehicles", JSON.stringify(updated));
      return updated;
    });
  };

  /* -------------------- PAYMENT -------------------- */
  const markPaymentDone = id => {
    const visitor = visitors.find(v => v.id === id);
    if (!visitor.paymentMode) return alert("Please select payment mode");

    const updatedVisitors = visitors.map(v =>
      v.id === id ? { ...v, paymentDone: true, timeLeft: null } : v
    );

    setVisitors(updatedVisitors);
    localStorage.setItem("visitorList", JSON.stringify(updatedVisitors));

    autoAssignVehicle(visitor);
  };

  const setPaymentMode = (id, mode) => {
    const updated = visitors.map(v =>
      v.id === id ? { ...v, paymentMode: mode } : v
    );
    setVisitors(updated);
    localStorage.setItem("visitorList", JSON.stringify(updated));
  };

  /* -------------------- DRIVER -------------------- */
  const setDriver = (vehicleNumber, driverName) => {
    const updated = vehicles.map(v =>
      v.vehicleNumber === vehicleNumber ? { ...v, driverName } : v
    );
    setVehicles(updated);
    localStorage.setItem("vehicles", JSON.stringify(updated));
  };

  /* -------------------- MOVE SAFARI -------------------- */
  const moveToSafari = vehicleNumber => {
    const vehicle = vehicles.find(v => v.vehicleNumber === vehicleNumber);
    if (!vehicle.driverName) return alert("Select driver first");

    const updated = vehicles.map(v =>
      v.vehicleNumber === vehicleNumber ? { ...v, status: "moved" } : v
    );
    setVehicles(updated);
    localStorage.setItem("vehicles", JSON.stringify(updated));
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen p-4 bg-green-50">
      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setActiveTab("reception")}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "reception"
              ? "bg-green-700 text-white"
              : "bg-white border text-green-700"
          }`}
        >
          Reception Dashboard
        </button>

        <button
          onClick={() => setActiveTab("vehicle")}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "vehicle"
              ? "bg-green-700 text-white"
              : "bg-white border text-green-700"
          }`}
        >
          Vehicle Dashboard
        </button>
      </div>

      {/* -------------------- RECEPTION UI -------------------- */}
      {activeTab === "reception" && (
        <>
          <h1 className="text-2xl font-bold mb-4 text-green-800">
            Reception Dashboard
          </h1>

          <div className="mb-4 flex gap-2 items-center">
            <label className="font-semibold">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-green-200">
                <tr>
                  <th className="p-2 border">Token</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time Slot</th>
                  <th className="p-2 border">Seats</th>
                  <th className="p-2 border">Payment Mode</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Timer</th>
                  <th className="p-2 border">Payment Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map(v => (
                  <tr key={v.id} className="text-center">
                    <td className="p-2 border font-bold text-blue-700">{v.token}</td>
                    <td className="p-2 border">{v.name}</td>
                    <td className="p-2 border">{v.phone}</td>
                    <td className="p-2 border">{v.safariDate}</td>
                    <td className="p-2 border">{v.timeSlot}</td>
                    <td className="p-2 border">{v.totalSeats}</td>
                    <td className="p-2 border">
                      {v.paymentDone ? (
                        v.paymentMode
                      ) : (
                        <select
                          value={v.paymentMode || ""}
                          onChange={e => setPaymentMode(v.id, e.target.value)}
                          className="border p-1 rounded"
                        >
                          <option value="">Select</option>
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                        </select>
                      )}
                    </td>
                    <td className="p-2 border">{v.paymentAmount || "-"}</td>
                    <td className="p-2 border text-red-600">
                      {v.paymentDone ? "-" : formatTime(v.timeLeft)}
                    </td>
                    <td className="p-2 border">
                      <button
                        disabled={v.paymentDone}
                        onClick={() => markPaymentDone(v.id)}
                        className={`px-2 py-1 rounded text-white ${
                          v.paymentDone ? "bg-green-700" : "bg-red-500"
                        }`}
                      >
                        {v.paymentDone ? "Paid" : "Pending"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* -------------------- VEHICLE DASHBOARD -------------------- */}
      {activeTab === "vehicle" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-green-800 mb-4">
            Vehicle Dashboard
          </h2>

          {/* Date selector */}
          <div className="mb-4 flex gap-2 items-center">
            <label className="font-semibold">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          {vehicles
            .filter(v =>
              v.passengers.some(p => {
                const vis = visitors.find(
                  vis => vis.name === p.name && vis.phone === p.phone
                );
                return vis?.safariDate === selectedDate;
              })
            )
            .map(v => {
              const isMoved = v.status === "moved";
              return (
                <details
                  key={v.vehicleNumber}
                  className={`border p-4 mb-4 rounded ${
                    isMoved ? "bg-gray-100 text-gray-500" : ""
                  }`}
                >
                  <summary className="cursor-pointer font-bold text-lg flex justify-between items-center">
                    Vehicle {v.vehicleNumber} ({v.seatsFilled}/6)
                    {isMoved && <span className="text-sm italic">Moved</span>}
                  </summary>

                  <table className="w-full border mt-2">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-1">Sub Token</th>
                        <th className="border p-1">Name</th>
                        <th className="border p-1">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.passengers.map((p, i) => (
                        <tr key={i}>
                          <td className="border p-1 text-center">{p.subToken}</td>
                          <td className="border p-1">{p.name}</td>
                          <td className="border p-1">{p.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-2 flex gap-2 items-center">
                    <label className="font-semibold mr-2">Driver:</label>
                    <select
                      value={v.driverName}
                      onChange={e => setDriver(v.vehicleNumber, e.target.value)}
                      className="border p-1 rounded"
                      disabled={isMoved}
                    >
                      <option value="">Select Driver</option>
                      <option value="Ramesh">Ramesh</option>
                      <option value="Suresh">Suresh</option>
                      <option value="Mahesh">Mahesh</option>
                    </select>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="px-4 py-1 rounded bg-gray-300 text-white cursor-not-allowed" disabled>
                      Next
                    </button>

                    <button
                      onClick={() => moveToSafari(v.vehicleNumber)}
                      disabled={v.seatsFilled !== 6 || !v.driverName || isMoved}
                      className={`px-4 py-1 rounded text-white ${
                        v.seatsFilled === 6 && v.driverName && !isMoved
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {isMoved ? "Moved" : "Move to Safari"}
                    </button>
                  </div>
                </details>
              );
            })}
        </div>
      )}
    </div>
  );
}
