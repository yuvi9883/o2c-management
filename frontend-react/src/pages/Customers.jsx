import { useState, useEffect } from "react";
import { getCustomers } from "../Services/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "Active" && c.status === "ACTIVE") ||
      (filter === "Inactive" && c.status === "INACTIVE");
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading customers...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Active", value: customers.filter((c) => c.status === "ACTIVE").length },
          { label: "Inactive", value: customers.filter((c) => c.status === "INACTIVE").length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-black text-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {["All", "Active", "Inactive"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filter === f ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold">
                  {c.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-bold text-black text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.city || "—"}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full
                  ${c.status === "ACTIVE" ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {c.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-1.5 mb-4">
              <p className="text-xs text-gray-500">{c.email || "No email"}</p>
              <p className="text-xs text-gray-500">{c.mobile || "No mobile"}</p>
              {c.address && <p className="text-xs text-gray-400 truncate">{c.address}</p>}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Customer ID</p>
              <p className="font-bold text-black text-sm">#{c.id}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">No customers found.</div>
        )}
      </div>
    </div>
  );
}
