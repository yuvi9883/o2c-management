import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary, getOrders } from "../Services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#000", "#555", "#999", "#ccc"];

const statusStyle = {
  SHIPPED:    "bg-black text-white",
  PENDING:    "bg-gray-200 text-gray-700",
  PROCESSING: "bg-gray-700 text-white",
  DELIVERED:  "bg-gray-100 text-gray-800",
  CANCELLED:  "bg-gray-300 text-gray-600",
};

const statusLabel = {
  SHIPPED: "Shipped", PENDING: "Pending", PROCESSING: "Processing",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

export default function Dashboard() {
  const [summary, setSummary]           = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getOrders()])
      .then(([summaryRes, ordersRes]) => {
        setSummary(summaryRes.data);
        setRecentOrders((ordersRes.data || []).slice(0, 5));
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (val) =>
    val != null
      ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      : "₹0.00";

  // ✅ KPI cards — directly use summary values
  const kpis = [
    {
      label: "Total Orders",
      value: summary?.totalOrders ?? 0,
      sub: "all time",
      icon: "📦",
    },
    {
      label: "Pending Orders",
      value: summary?.pendingOrders ?? 0,
      sub: "awaiting processing",
      icon: "⏳",
    },
    {
      label: "Open Invoices",
      value: summary?.pendingInvoices ?? 0,
      sub: "awaiting payment",
      icon: "🧾",
    },
    {
      label: "Total Revenue",
      value: fmt(summary?.totalRevenue),
      sub: "collected",
      icon: "💰",
    },
  ];

  // ✅ Extra stats row
  const extraStats = [
    { label: "Total Customers", value: summary?.totalCustomers ?? 0 },
    { label: "Total Invoices",  value: summary?.totalInvoices  ?? 0 },
    { label: "Paid Invoices",   value: summary?.paidInvoices   ?? 0 },
    { label: "Total Payments",  value: summary?.totalPayments  ?? 0 },
  ];

  const pieData = [
    { name: "Paid",    value: summary?.paidInvoices    ?? 0 },
    { name: "Pending", value: summary?.pendingInvoices ?? 0 },
    { name: "Overdue", value: summary?.overdueInvoices ?? 0 },
  ];

  const orderBreakdown = [
    { label: "Pending",    key: "pendingOrders"    },
    { label: "Processing", key: "processingOrders" },
    { label: "Shipped",    key: "shippedOrders"    },
    { label: "Delivered",  key: "deliveredOrders"  },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64
      text-gray-400 text-sm">
      Loading dashboard...
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl
            p-5 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium uppercase
                tracking-wide">{k.label}</p>
              <span className="text-lg">{k.icon}</span>
            </div>
            {/* ✅ Display value directly — no ?? "—" */}
            <p className="text-3xl font-black text-black mb-1">{k.value}</p>
            <p className="text-xs text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Extra Stats Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {extraStats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100
            rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {s.label}
            </p>
            <p className="text-2xl font-black text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Invoice Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-black mb-1">Invoice Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution overview</p>
          {pieData.some(d => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={72}
                    dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    fontSize: "12px",
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {pieData.map((d, i) => (
                  <div key={d.name}
                    className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: PIE_COLORS[i] }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center
              text-gray-400 text-sm">No invoice data yet</div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100
          rounded-2xl p-6">
          <h2 className="font-bold text-black mb-1">
            Order Status Breakdown
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Current orders by status
          </p>
          <div className="grid grid-cols-2 gap-3">
            {orderBreakdown.map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                {/* ✅ Direct access — no null check needed */}
                <p className="text-2xl font-black text-black">
                  {summary?.[item.key] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="flex justify-between items-center px-6 py-5
          border-b border-gray-100">
          <div>
            <h2 className="font-bold text-black">Recent Orders</h2>
            <p className="text-xs text-gray-400">Last 5 orders placed</p>
          </div>
          <Link to="/orders"
            className="text-xs font-semibold text-black border border-black
              px-3 py-1.5 rounded-lg hover:bg-black hover:text-white
              transition-colors duration-200">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No orders yet. Create your first order!
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide
                  border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-medium">Order ID</th>
                  <th className="px-6 py-3 text-left font-medium">Customer</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50
                    hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-black">
                      {o.orderId}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {o.customerName || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs
                        font-medium ${statusStyle[o.status] ||
                        "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold
                      text-black">
                      {o.totalAmount != null
                        ? `₹${Number(o.totalAmount).toLocaleString(
                            "en-IN", { minimumFractionDigits: 2 })}`
                        : "—"}
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