import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../Services/api";

const statusStyle = {
  SHIPPED:    "bg-black text-white",
  PENDING:    "bg-gray-200 text-gray-700",
  PROCESSING: "bg-gray-700 text-white",
  DELIVERED:  "bg-gray-100 text-gray-800 border border-gray-300",
  CANCELLED:  "bg-gray-300 text-gray-600",
};

const statusLabel = {
  SHIPPED: "Shipped", PENDING: "Pending", PROCESSING: "Processing",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || o.status === filter.toUpperCase();
    return matchSearch && matchFilter;
  });

  const fmt = (val) =>
    val != null ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading orders...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black">All Orders</h2>
          <p className="text-xs text-gray-400">{filtered.length} orders found</p>
        </div>
        <Link
          to="/orders/create"
          className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors duration-200"
        >
          + New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Shipped", "Pending", "Processing", "Delivered", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${filter === s ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Order ID", "Customer", "Date", "Status", "Amount", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 font-bold text-black">{o.orderId}</td>
                <td className="px-6 py-4 text-gray-700">{o.customerName || "—"}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[o.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-black">{fmt(o.totalAmount)}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/orders/${o.orderId}`}
                    className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all duration-200"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
