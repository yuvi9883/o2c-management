import { useParams, Link } from "react-router-dom";

const orders = {
  SO10234: {
    id: "SO10234", customer: "ABC Industries", date: "04/15/2024", status: "Shipped",
    items: [{ product: "Item A", qty: 20, price: "$150.00", total: "$3,000.00" },
            { product: "Item B", qty: 15, price: "$150.00", total: "$2,250.00" }],
    shipping: { via: "FedEx", tracking: "123456789", payment: "Paid" },
    address: "123 Main St, Mumbai, 400001",
  },
};

const statusStyle = {
  Shipped: "bg-black text-white",
  Pending: "bg-gray-200 text-gray-700",
  Processing: "bg-gray-700 text-white",
  Delivered: "bg-gray-100 text-gray-800 border border-gray-300",
  Cancelled: "bg-gray-300 text-gray-600",
};

export default function OrderDetails() {
  const { id } = useParams();
  const order = orders[id] || {
    id, customer: "Unknown", date: "N/A", status: "Pending",
    items: [], shipping: { via: "N/A", tracking: "N/A", payment: "N/A" }, address: "N/A",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/orders" className="text-gray-400 hover:text-black transition-colors text-sm">← Back</Link>
        <span className="text-gray-200">|</span>
        <h2 className="text-xl font-bold text-black">Order {order.id}</h2>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Order Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-4">Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Order ID", value: order.id },
            { label: "Customer", value: order.customer },
            { label: "Order Date", value: order.date },
            { label: "Shipping Address", value: order.address },
          ].map((r) => (
            <div key={r.label}>
              <p className="text-xs text-gray-400 font-medium mb-1">{r.label}</p>
              <p className="text-sm font-semibold text-black">{r.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-black text-sm uppercase tracking-wide">Order Items</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Product", "Quantity", "Unit Price", "Total"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4 font-semibold text-black">{item.product}</td>
                <td className="px-6 py-4 text-gray-600">{item.qty}</td>
                <td className="px-6 py-4 text-gray-600">{item.price}</td>
                <td className="px-6 py-4 font-bold text-black">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipping Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-4">Shipping Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">Shipped via</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-black">{order.shipping.via}</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Nested</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">Tracking Number</span>
            <span className="font-mono font-semibold text-black">{order.shipping.tracking}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-gray-500">Payment Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${order.shipping.payment === "Paid" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
              {order.shipping.payment}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
