import { useEffect, useMemo, useState } from "react";
import ManagerTabs from "./ManagerTabs";

export default function ManagerDashboard() {
  const [visitors, setVisitors] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Load visitors
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("visitorList")) || [];
    setVisitors(data);
  }, []);

  // Filter by date
  const dateVisitors = useMemo(() => {
    return visitors.filter((v) => v.safariDate === selectedDate);
  }, [visitors, selectedDate]);

  // ✅ FIXED SUMMARY CALCULATIONS
  const summary = useMemo(() => {
    const totalVisitors = dateVisitors.length;

    const paid = dateVisitors.filter(
      (v) => v.paymentDone === true
    ).length;

    const pending = totalVisitors - paid;

    const totalSeats = dateVisitors.reduce((sum, v) => {
      const seats = parseInt(v.seats, 10);
      return sum + (isNaN(seats) ? 0 : seats);
    }, 0);

    const totalAmount = dateVisitors.reduce((sum, v) => {
      const amount = parseFloat(v.paymentAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return { totalVisitors, paid, pending, totalSeats, totalAmount };
  }, [dateVisitors]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Manager Dashboard
      </h1>

      {/* Toggle buttons */}
      <ManagerTabs />

      {/* Date Selector */}
      <div className="mb-6 flex gap-3 items-center">
        <label className="font-semibold">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard title="Visitors" value={summary.totalVisitors} />
        <SummaryCard title="Paid" value={summary.paid} color="green" />
        <SummaryCard title="Pending" value={summary.pending} color="red" />
        <SummaryCard title="Total Seats" value={summary.totalSeats} />
        <SummaryCard
          title="Total Collection"
          value={`₹ ${summary.totalAmount}`}
          color="blue"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Token</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Time Slot</th>
              <th className="p-2 border">Seats</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Mode</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Vehicle</th>
              <th className="p-2 border">Driver</th>
            </tr>
          </thead>

          <tbody>
            {dateVisitors.map((v) => {
              // ✅ NORMALIZE DATA
              const vehicle =
                v.vehicle ||
                v.vehicleNumber ||
                v.vehicleNo ||
                "-";

              const driver =
                v.driver ||
                v.driverName ||
                v.assignedDriver ||
                "-";

              return (
                <tr key={v.id} className="text-center">
                  <td className="p-2 border font-bold text-blue-700">
                    {v.token}
                  </td>
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">{v.phone}</td>
                  <td className="p-2 border">{v.timeSlot}</td>
                  <td className="p-2 border">{v.seats || 0}</td>
                  <td className="p-2 border">
                    {v.paymentDone ? (
                      <span className="text-green-700 font-semibold">
                        Paid
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-2 border">
                    {v.paymentMode || "-"}
                  </td>
                  <td className="p-2 border">
                    {v.paymentAmount
                      ? `₹${v.paymentAmount}`
                      : "-"}
                  </td>
                  <td className="p-2 border">{vehicle}</td>
                  <td className="p-2 border">{driver}</td>
                </tr>
              );
            })}

            {dateVisitors.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="p-4 text-center text-gray-500"
                >
                  No data for selected date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Summary Card */
function SummaryCard({ title, value, color = "gray" }) {
  const colors = {
    gray: "bg-gray-200 text-gray-800",
    green: "bg-green-200 text-green-800",
    red: "bg-red-200 text-red-800",
    blue: "bg-blue-200 text-blue-800",
  };

  return (
    <div className={`p-4 rounded shadow ${colors[color]}`}>
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
