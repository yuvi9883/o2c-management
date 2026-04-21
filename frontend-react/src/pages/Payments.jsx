import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getPayments, getPaymentSummary, markPaymentAsPaid } from "../Services/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        getPayments(),
        getPaymentSummary(),
      ]);
      setPayments(paymentsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError("Failed to load payments. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (id) => {
    setPayingId(id);
    try {
      await markPaymentAsPaid(id);
      await fetchData(); // refresh list and summary
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payment.");
    } finally {
      setPayingId(null);
    }
  };

  const pending = payments.filter((p) => p.status === "PENDING");
  const completed = payments.filter((p) => p.status === "COMPLETED");

  const methodLabel = {
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    CHEQUE: "Cheque",
    CASH: "Cash",
    CARD: "Card",
  };

  const fmt = (val) =>
    val != null ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹0.00";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-black underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: fmt(summary?.totalCollected), sub: `${summary?.completedCount || 0} completed` },
          { label: "Pending Payments", value: fmt(summary?.totalPending), sub: `${summary?.pendingCount || 0} awaiting` },
          { label: "Total Payments", value: payments.length, sub: "all records" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-2xl font-black text-black mb-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Payments — with PAY button */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-black">Pending Payments</h3>
            <p className="text-xs text-gray-400">Click "Pay" to mark as completed</p>
          </div>
          {pending.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No pending payments.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice", "Customer", "Amount", "Method", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-black text-xs">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{p.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-black text-xs">{fmt(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {methodLabel[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handlePay(p.id)}
                        disabled={payingId === p.id}
                        className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg
                          hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {payingId === p.id ? "Processing..." : "Pay →"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Completed Payments */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-black">Completed Payments</h3>
            <p className="text-xs text-gray-400">Successfully collected</p>
          </div>
          {completed.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No completed payments yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice", "Customer", "Method", "Amount", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-black text-xs">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{p.customerName}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {methodLabel[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-black text-xs">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
