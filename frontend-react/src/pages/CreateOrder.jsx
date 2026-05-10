import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers, createOrder } from "../Services/api";

const products = [
  { name: "Item A", price: 150 },
  { name: "Item B", price: 200 },
  { name: "Item C", price: 75 },
  { name: "Item D", price: 320 },
];

export default function CreateOrder() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true); // ✅ add loading
  const [customersError, setCustomersError] = useState("");       // ✅ add error
  const [form, setForm] = useState({
    customerId: "", product: "", quantity: 1, price: 0,
    address: "", city: "", postalCode: "", notes: "",
  });
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIXED — fetch customers with proper error handling
  useEffect(() => {
    console.log(">>> Fetching customers...");
    console.log(">>> Token:", localStorage.getItem("token"));

    getCustomers()
      .then((res) => {
        console.log(">>> Customers response:", res.data);
        const active = res.data.filter((c) => c.status === "ACTIVE");
        console.log(">>> Active customers:", active);
        setCustomers(active);

        // ✅ If no customers found — show helpful message
        if (active.length === 0) {
          setCustomersError("No active customers found. Please add a customer first.");
        }
      })
      .catch((err) => {
        console.error(">>> Customers error:", err.response?.status, err.response?.data);
        setCustomersError(
          err.response?.status === 401
            ? "Session expired. Please login again."
            : "Failed to load customers. Please refresh the page."
        );
      })
      .finally(() => setCustomersLoading(false));
  }, []);

  const total = (form.quantity * form.price).toFixed(2);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProductChange = (e) => {
    const p = products.find((x) => x.name === e.target.value);
    setForm({ ...form, product: e.target.value, price: p ? p.price : 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.customerId) { setError("Please select a customer."); return; }
    if (!form.product)    { setError("Please select a product."); return; }
    if (!form.address)    { setError("Please enter a shipping address."); return; }
    if (!form.city)       { setError("Please enter a city."); return; }

    setLoading(true);
    try {
      await createOrder({
        customerId: Number(form.customerId),
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingPostalCode: form.postalCode,
        notes: form.notes,
        items: [
          {
            productName: form.product,
            quantity: Number(form.quantity),
            unitPrice: form.price,
            totalPrice: Number(total),
          },
        ],
      });
      navigate("/orders");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (id) =>
    `w-full py-2.5 pr-4 rounded-xl border bg-white text-black text-sm placeholder-gray-400
     focus:outline-none transition-all duration-300
     ${focused === id ? "pl-8 border-black" : "pl-4 border-gray-200"}`;

  const Arrow = ({ id }) => (
    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-black font-bold
      text-base transition-all duration-300
      ${focused === id ? "opacity-100" : "opacity-0 -translate-x-2"}`}>›</span>
  );

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate("/orders")}
          className="text-gray-400 hover:text-black transition-colors">
          ← Back
        </button>
        <span className="text-gray-200">|</span>
        <h2 className="text-xl font-bold text-black">Create Sales Order</h2>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl
          text-sm text-red-600 flex items-start gap-2">
          <span className="font-bold mt-0.5">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Details */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-4">
            Order Details
          </h3>

          {/* ✅ Customer Dropdown with loading + error states */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase
              tracking-wide mb-1.5 block">
              Customer
            </label>

            {/* ✅ Show error if customers failed to load */}
            {customersError && (
              <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200
                rounded-lg text-xs text-yellow-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{customersError}</span>
                {/* ✅ Link to add customer if none exist */}
                {customersError.includes("No active") && (
                  <a href="/customers"
                    className="ml-auto text-black font-semibold underline">
                    Add Customer →
                  </a>
                )}
              </div>
            )}

            <div className="relative">
              <Arrow id="customerId" />
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                onFocus={() => setFocused("customerId")}
                onBlur={() => setFocused("")}
                className={inputClass("customerId")}
                disabled={customersLoading}
              >
                {/* ✅ Dynamic placeholder based on state */}
                <option value="">
                  {customersLoading
                    ? "Loading customers..."
                    : customers.length === 0
                    ? "No customers available — add one first"
                    : "Select Customer"
                  }
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `— ${c.city}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase
              tracking-wide mb-1.5 block">Product</label>
            <div className="relative">
              <Arrow id="product" />
              <select
                name="product"
                value={form.product}
                onChange={handleProductChange}
                onFocus={() => setFocused("product")}
                onBlur={() => setFocused("")}
                className={inputClass("product")}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} — ₹{p.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Qty + Price + Total */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase
                tracking-wide mb-1.5 block">Quantity</label>
              <div className="relative">
                <Arrow id="quantity" />
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  min={1}
                  onChange={handleChange}
                  onFocus={() => setFocused("quantity")}
                  onBlur={() => setFocused("")}
                  className={inputClass("quantity")}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase
                tracking-wide mb-1.5 block">Unit Price</label>
              <input readOnly value={`₹${Number(form.price).toFixed(2)}`}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-100
                  bg-gray-50 text-sm text-gray-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase
                tracking-wide mb-1.5 block">Total</label>
              <input readOnly value={`₹${total}`}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-100
                  bg-gray-50 text-sm font-bold text-black" />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-4">
            Shipping Address
          </h3>
          {[
            { id: "address", label: "Street Address", placeholder: "123 Main St" },
            { id: "city",    label: "City",           placeholder: "Mumbai" },
            { id: "postalCode", label: "Postal Code", placeholder: "400001" },
          ].map((f) => (
            <div key={f.id}>
              <label className="text-xs font-semibold text-gray-500 uppercase
                tracking-wide mb-1.5 block">{f.label}</label>
              <div className="relative">
                <Arrow id={f.id} />
                <input
                  type="text"
                  name={f.id}
                  placeholder={f.placeholder}
                  value={form[f.id]}
                  onChange={handleChange}
                  onFocus={() => setFocused(f.id)}
                  onBlur={() => setFocused("")}
                  className={inputClass(f.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <label className="text-xs font-semibold text-gray-500 uppercase
            tracking-wide mb-1.5 block">Notes (Optional)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any special instructions..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:border-black transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="relative flex-1 py-3 rounded-xl bg-black text-white font-semibold
              text-sm overflow-hidden group transition-all duration-300
              hover:shadow-lg disabled:opacity-50">
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100
              origin-left transition-transform duration-300 rounded-xl"></span>
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">
              {loading ? "Creating..." : "Create Order →"}
            </span>
          </button>
          <button type="button" onClick={() => navigate("/orders")}
            className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium
              text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}