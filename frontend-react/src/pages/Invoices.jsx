import { useState, useEffect } from "react";
import { getInvoices } from "../Services/api";

const statusStyle = {
  PAID:    "bg-black text-white",
  PENDING: "bg-gray-200 text-gray-700",
  OVERDUE: "bg-gray-800 text-white",
};

const statusLabel = { PAID: "Paid", PENDING: "Pending", OVERDUE: "Overdue" };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInvoices()
      .then((res) => setInvoices(res.data))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All"
      ? invoices
      : invoices.filter((i) => i.status === filter.toUpperCase());

  const fmt = (val) =>
    val != null ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading invoices...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    );
  }

  const summary = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    pending: invoices.filter((i) => i.status === "PENDING").length,
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: summary.total, sub: "all time" },
          { label: "Paid", value: summary.paid, sub: "completed" },
          { label: "Pending", value: summary.pending, sub: "awaiting payment" },
          { label: "Overdue", value: summary.overdue, sub: "action required" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-black text-black mb-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-2">
        {["All", "Paid", "Pending", "Overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filter === f ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f}
            <span className="ml-2 text-xs opacity-60">
              {f === "All" ? invoices.length : invoices.filter((i) => i.status === f.toUpperCase()).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Invoice #", "Order ID", "Customer", "Invoice Date", "Due Date", "Status", "Amount"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">No invoices found.</td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-bold text-black">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{inv.orderId || "—"}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{inv.customerName || "—"}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{fmtDate(inv.invoiceDate)}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[inv.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[inv.status] || inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-black">{fmt(inv.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
