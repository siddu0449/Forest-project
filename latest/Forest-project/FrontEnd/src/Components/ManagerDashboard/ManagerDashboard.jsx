import { useEffect, useMemo, useState } from "react";
import ManagerTabs from "./ManagerTabs";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManagerDashboard() {
  const [visitors, setVisitors] = useState([]);
  const [vehicleAssignments, setVehicleAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Load visitors and assignments from API
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both bookings and vehicle assignments
      const [bookingsRes, assignmentsRes] = await Promise.all([
        fetch(`${API_URL}/bookings?safariDate=${selectedDate}`),
        fetch(`${API_URL}/vehicle-assignments?date=${selectedDate}`)
      ]);
      
      const bookingsData = await bookingsRes.json();
      const assignmentsData = await assignmentsRes.json();
      
      if (bookingsData.success) {
        setVisitors(bookingsData.data);
        localStorage.setItem("visitorList", JSON.stringify(bookingsData.data));
      } else {
        setError(bookingsData.message || 'Failed to fetch bookings');
        const storedData = JSON.parse(localStorage.getItem("visitorList")) || [];
        setVisitors(storedData.filter(v => v.safariDate === selectedDate));
      }

      if (assignmentsData.success) {
        setVehicleAssignments(assignmentsData.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
      const storedData = JSON.parse(localStorage.getItem("visitorList")) || [];
      setVisitors(storedData.filter(v => v.safariDate === selectedDate));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = fetchData; // Alias for button

  // Filter by date and merge with vehicle assignments
  const dateVisitors = useMemo(() => {
    const filtered = visitors.filter((v) => v.safariDate === selectedDate);
    
    filtered.sort((a, b) => Number(a.token) - Number(b.token));
    // Merge vehicle assignment data into visitors
    return filtered.map(visitor => {
      // Find vehicle assignments that include this visitor's token
      const assignments = vehicleAssignments.filter(va => 
        va.passengers && va.passengers.some(p => p.token === visitor.token)
      );
      
      if (assignments.length > 0) {
        // If multiple vehicles (large group), show all vehicles and drivers
        const vehicles = assignments.map(a => a.vehicleNumber).join(', ');
        const drivers = assignments.map(a => a.driverName || '-').join(', ');
        return {
          ...visitor,
          vehicleNumber: vehicles,
          driverName: drivers
        };
      }
      
      return visitor;
    });
  }, [visitors, selectedDate, vehicleAssignments]);

  // ✅ FIXED SUMMARY CALCULATIONS
  const summary = useMemo(() => {
    const totalVisitors = dateVisitors.length;

    const paid = dateVisitors.filter(
      (v) => v.paymentDone === true
    ).length;

    const pending = totalVisitors - paid;

    const totalSeats = dateVisitors
  .filter(v => v.paymentDone)
  .reduce((sum, v) => sum + (parseInt(v.totalSeats) || 0), 0);


    const totalAdults = dateVisitors.reduce((sum, v) => {
      return sum + (parseInt(v.adults) || 0);
    }, 0);

    const totalChildren = dateVisitors.reduce((sum, v) => {
      return sum + (parseInt(v.children) || 0);
    }, 0);

    const totalAmount = dateVisitors.reduce((sum, v) => {
      const amount = parseFloat(v.paymentAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const paidAmount = dateVisitors
      .filter(v => v.paymentDone)
      .reduce((sum, v) => sum + (parseFloat(v.paymentAmount) || 0), 0);

    const pendingAmount = totalAmount - paidAmount;

    // Group by time slot
const slotData = dateVisitors
  .filter(v => v.paymentDone)
  .reduce((acc, v) => {
    const slot = v.timeSlot || "Unknown";

    if (!acc[slot]) {
      acc[slot] = { count: 0, seats: 0, amount: 0 };
    }

    acc[slot].count += 1;
    acc[slot].seats += parseInt(v.totalSeats) || 0;
    acc[slot].amount += parseFloat(v.paymentAmount) || 0;

    return acc;
  }, {});


    return { 
      totalVisitors, 
      paid, 
      pending, 
      totalSeats, 
      totalAdults,
      totalChildren,
      totalAmount,
      paidAmount,
      pendingAmount,
      slotData
    };
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
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4 text-blue-600">
          Loading bookings data...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard title="Visitors Token" value={summary.totalVisitors} />
        <SummaryCard title="Paid" value={summary.paid} color="green" />
        <SummaryCard title="Pending" value={summary.pending} color="red" />
        <SummaryCard title="Total Seats" value={summary.totalSeats} />
        <SummaryCard
  title="Total Collection"
  value={`₹${summary.paidAmount.toLocaleString()}`}
  color="blue"
/>

      </div>

      {/* Time Slot Breakdown */}
      {Object.keys(summary.slotData).length > 0 && (
        <div className="mb-6 bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Time Slot Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(summary.slotData).map(([slot, data]) => (
              <div key={slot} className="border rounded p-3">
                <p className="font-semibold text-blue-700">{slot}</p>
                <p className="text-sm text-gray-600">Bookings: <span className="font-bold">{data.count}</span></p>
                <p className="text-sm text-gray-600">Seats: <span className="font-bold">{data.seats}</span></p>
                <p className="text-sm text-gray-600">Revenue: <span className="font-bold">₹{data.amount.toLocaleString()}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <th className="p-2 border">UTR</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Vehicle</th>
              <th className="p-2 border">Driver</th>
            </tr>
          </thead>

          <tbody>
            {dateVisitors.map((v) => {
              const vehicle = v.vehicleNumber || "-";
              const driver = v.driverName || "-";

              return (
                <tr key={`${v.token}-${v.id}`} className="text-center">

                  <td className="p-2 border font-bold text-blue-700">
                    {v.token}
                  </td>
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">{v.phone}</td>
                  <td className="p-2 border">{v.timeSlot}</td>
                  <td className="p-2 border">{v.totalSeats || 0}</td>
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
                  <td className="p-2 border text-xs">
                    {v.utrNumber || "-"}
                  </td>
                  <td className="p-2 border">
                    {v.paymentAmount
                      ? `₹${parseFloat(v.paymentAmount).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="p-2 border font-semibold text-indigo-700">{vehicle}</td>
                  <td className="p-2 border font-semibold text-purple-700">{driver}</td>
                </tr>
              );
            })}

            {dateVisitors.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="11"
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
