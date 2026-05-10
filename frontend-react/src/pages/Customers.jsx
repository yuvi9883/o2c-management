import { useState, useEffect } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../Services/api";

export default function Customers() {
  const [customers, setCustomers]   = useState([]);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("All");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editCustomer, setEditCustomer] = useState(null); // null = add, object = edit
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState("");
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", city: "", address: ""
  });

  // ✅ Fetch customers
  const fetchCustomers = () => {
    setLoading(true);
    getCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  // ✅ Open Add modal
  const openAdd = () => {
    setEditCustomer(null);
    setForm({ name: "", email: "", mobile: "", city: "", address: "" });
    setFormError("");
    setShowModal(true);
  };

  // ✅ Open Edit modal
  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({
      name:    c.name    || "",
      email:   c.email   || "",
      mobile:  c.mobile  || "",
      city:    c.city    || "",
      address: c.address || "",
    });
    setFormError("");
    setShowModal(true);
  };

  // ✅ Submit Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }

    setFormLoading(true);
    try {
      if (editCustomer) {
        await updateCustomer(editCustomer.id, form);
      } else {
        await createCustomer(form);
      }
      setShowModal(false);
      fetchCustomers(); // ✅ refresh list
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save customer."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Delete customer
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch {
      alert("Failed to delete customer.");
    }
  };

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "Active"   && c.status === "ACTIVE") ||
      (filter === "Inactive" && c.status === "INACTIVE");
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading customers...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-500 text-sm">
      {error}
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black">Customers</h2>
          <p className="text-xs text-gray-400">{customers.length} total customers</p>
        </div>
        {/* ✅ ADD CUSTOMER BUTTON */}
        <button
          onClick={openAdd}
          className="bg-black text-white text-sm font-semibold px-4 py-2.5
            rounded-xl hover:bg-gray-800 transition-colors duration-200"
        >
          + Add Customer
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Active",   value: customers.filter((c) => c.status === "ACTIVE").length },
          { label: "Inactive", value: customers.filter((c) => c.status === "INACTIVE").length },
        ].map((s) => (
          <div key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              {s.label}
            </p>
            <p className="text-3xl font-black text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4
        flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
              text-sm focus:outline-none focus:border-black transition-colors"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {["All", "Active", "Inactive"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filter === f
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id}
            className="bg-white border border-gray-100 rounded-2xl p-5
              hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex
                  items-center justify-center text-sm font-bold">
                  {c.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-bold text-black text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.city || "—"}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full
                ${c.status === "ACTIVE"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-500"}`}>
                {c.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-1.5 mb-4">
              <p className="text-xs text-gray-500">{c.email  || "No email"}</p>
              <p className="text-xs text-gray-500">{c.mobile || "No mobile"}</p>
              {c.address && (
                <p className="text-xs text-gray-400 truncate">{c.address}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center
              justify-between">
              <div>
                <p className="text-xs text-gray-400">Customer ID</p>
                <p className="font-bold text-black text-sm">#{c.id}</p>
              </div>
              {/* ✅ Edit + Delete buttons */}
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200
                    text-gray-600 hover:bg-black hover:text-white
                    hover:border-black transition-all duration-200">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-100
                    text-red-500 hover:bg-red-500 hover:text-white
                    hover:border-red-500 transition-all duration-200">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No customers found.</p>
            <button onClick={openAdd}
              className="bg-black text-white text-sm font-semibold px-4 py-2.5
                rounded-xl hover:bg-gray-800 transition-colors">
              + Add Your First Customer
            </button>
          </div>
        )}
      </div>

      {/* ✅ Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md
            mx-4 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4
              border-b border-gray-100">
              <h2 className="font-bold text-black text-base">
                {editCustomer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black transition-colors
                  text-xl leading-none">
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              {formError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100
                  rounded-xl text-sm text-red-600">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="customer@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Mobile</label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={formLoading}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl
                      text-sm font-semibold hover:bg-gray-800 transition-colors
                      disabled:opacity-50">
                    {formLoading
                      ? "Saving..."
                      : editCustomer ? "Save Changes" : "Add Customer"
                    }
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl
                      text-sm font-medium text-gray-600 hover:bg-gray-50
                      transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}