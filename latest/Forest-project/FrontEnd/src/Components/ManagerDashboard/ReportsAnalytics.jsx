import { useState } from "react";
import ManagerTabs from "./ManagerTabs";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ReportsAnalytics() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      setError("Please select both From and To dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError("From date cannot be after To date");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_URL}/bookings/report?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 Report Data:', data.data);
        console.log('🚫 Unpaid Bookings:', data.data.unpaidBookings);
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!reportData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary worksheet data
    const summaryData = [
      ["Safari Visitor Report"],
      [""],
      ["Report Period", `${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`],
      [""],
      ["Summary Statistics"],
      ["Total Visitors", reportData.totalVisitors],
      ["Total Seats Booked", reportData.totalSeats],
      ["Total Payments (₹)", reportData.totalPayments],
      [""],
      ["Payment Breakdown"],
      ["Payments Completed", reportData.paymentsCompleted],
      ["Payments Pending", reportData.paymentsPending],
      ["Unpaid/Deleted Bookings", reportData.unpaidBookings?.length || 0],
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Report Summary");

    // Unpaid bookings worksheet
    if (reportData.unpaidBookings && reportData.unpaidBookings.length > 0) {
      const unpaidData = [
        ["Unpaid/Deleted Bookings - Payment Timeout"],
        [""],
        ["Token", "Name", "Phone", "Email", "Safari Date", "Time Slot", "Adults", "Children", "Total Seats", "Amount (₹)", "Deleted At", "Reason"]
      ];

      reportData.unpaidBookings.forEach(booking => {
        unpaidData.push([
          booking.token,
          booking.name,
          booking.phone,
          booking.email,
          new Date(booking.safariDate).toLocaleDateString(),
          booking.timeSlot,
          booking.adults,
          booking.children,
          booking.totalSeats,
          booking.totalAmount,
          new Date(booking.deletedAt).toLocaleString(),
          booking.reason
        ]);
      });

      const wsUnpaid = XLSX.utils.aoa_to_sheet(unpaidData);
      wsUnpaid['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 12 },
        { wch: 15 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 20 }, { wch: 35 }
      ];
      XLSX.utils.book_append_sheet(wb, wsUnpaid, "Unpaid Bookings");
    }

    // Generate filename with date range
    const filename = `Safari_Report_${fromDate}_to_${toDate}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">📊 Reports & Analytics</h2>
<ManagerTabs />
      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Date Range</h3>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Download Button */}
          <div className="flex justify-end">
            <button
              onClick={downloadExcel}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition flex items-center gap-2"
            >
              <span>📥</span>
              Download Excel Report
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Visitors</p>
                  <p className="text-3xl font-bold mt-1">{reportData.totalVisitors}</p>
                </div>
                <div className="text-4xl opacity-80">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Seats Booked</p>
                  <p className="text-3xl font-bold mt-1">{reportData.totalSeats}</p>
                </div>
                <div className="text-4xl opacity-80">💺</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Payments</p>
                  <p className="text-3xl font-bold mt-1">₹{reportData.totalPayments.toLocaleString()}</p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Unpaid (Deleted)</p>
                  <p className="text-3xl font-bold mt-1">{reportData.unpaidBookings?.length || 0}</p>
                </div>
                <div className="text-4xl opacity-80">🚫</div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Payments Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{reportData.paymentsCompleted}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Payments Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{reportData.paymentsPending}</p>
              </div>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Report Period:</strong> {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </p>
          </div>

          {/* Unpaid/Deleted Bookings Section */}
          {reportData.unpaidBookings && reportData.unpaidBookings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-700">
                  🚫 Unpaid Bookings - Payment Timeout (15 min)
                </h3>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {reportData.unpaidBookings.length} Deleted
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                These bookings were automatically deleted because payment was not completed within 15 minutes.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Token</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Safari Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Time Slot</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Seats</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Deleted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.unpaidBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-blue-600">#{booking.token}</td>
                        <td className="px-4 py-3">{booking.name}</td>
                        <td className="px-4 py-3 text-xs">{booking.email}</td>
                        <td className="px-4 py-3">{booking.phone}</td>
                        <td className="px-4 py-3">{new Date(booking.safariDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs">{booking.timeSlot}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {booking.totalSeats} ({booking.adults}A + {booking.children}C)
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600">₹{booking.totalAmount}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {new Date(booking.deletedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> These visitors did not complete payment within the 15-minute window. 
                  Their bookings were automatically removed to free up slots for other visitors.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && !error && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-600">Select a date range and click "Generate Report" to view analytics</p>
        </div>
      )}
    </div>
  );
}
