import { useState, useEffect } from "react";
import {
  getPayments,
  getPaymentSummary,
  markPaymentAsPaid,
  createPayment,
  getInvoices,
  getCustomers,
} from "../Services/api";

export default function Payments() {
  const [payments, setPayments]   = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [payingId, setPayingId]   = useState(null);
  const [error, setError]         = useState("");

  // Create Payment Modal
  const [showModal, setShowModal]       = useState(false);
  const [invoices, setInvoices]         = useState([]);
  const [customers, setCustomers]       = useState([]);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState("");
  const [form, setForm] = useState({
    invoiceId: "", customerId: "", method: "CASH", amount: "",
  });

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
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ Open modal — load invoices and customers
  const openModal = async () => {
    setFormError("");
    setForm({ invoiceId: "", customerId: "", method: "CASH", amount: "" });
    try {
      const [invRes, custRes] = await Promise.all([
        getInvoices(),
        getCustomers(),
      ]);
      // Only show PENDING invoices
      setInvoices(invRes.data.filter(i => i.status === "PENDING" || i.status === "OVERDUE"));
      setCustomers(custRes.data.filter(c => c.status === "ACTIVE"));
    } catch {
      setFormError("Failed to load invoices or customers.");
    }
    setShowModal(true);
  };

  // ✅ Auto-fill amount when invoice selected
  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    const invoice   = invoices.find(i => String(i.id) === String(invoiceId));
    setForm(f => ({
      ...f,
      invoiceId,
      customerId: invoice?.customerId ? String(invoice.customerId) : f.customerId,
      amount:     invoice?.amount     ? String(invoice.amount)     : f.amount,
    }));
  };

  // ✅ Create payment
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.invoiceId)  { setFormError("Please select an invoice.");  return; }
    if (!form.customerId) { setFormError("Please select a customer.");  return; }
    if (!form.amount)     { setFormError("Please enter amount.");        return; }

    setFormLoading(true);
    try {
      await createPayment({
        invoiceId:  Number(form.invoiceId),
        customerId: Number(form.customerId),
        method:     form.method,
        amount:     Number(form.amount),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create payment."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Mark as paid
  const handlePay = async (id) => {
    setPayingId(id);
    try {
      await markPaymentAsPaid(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to process payment.");
    } finally {
      setPayingId(null);
    }
  };

  const pending   = payments.filter(p => p.status === "PENDING");
  const completed = payments.filter(p => p.status === "COMPLETED");

  const methodLabel = {
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI", CHEQUE: "Cheque", CASH: "Cash", CARD: "Card",
  };

  const fmt = (val) =>
    val != null
      ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      : "₹0.00";

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Loading payments...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData}
          className="mt-3 text-sm text-black underline">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black">Payments</h2>
          <p className="text-xs text-gray-400">{payments.length} total payments</p>
        </div>
        {/* ✅ CREATE PAYMENT BUTTON */}
        <button onClick={openModal}
          className="bg-black text-white text-sm font-semibold px-4 py-2.5
            rounded-xl hover:bg-gray-800 transition-colors duration-200">
          + New Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Collected",
            value: fmt(summary?.totalCollected),
            sub: `${summary?.completedCount || 0} completed`
          },
          {
            label: "Pending Payments",
            value: fmt(summary?.totalPending),
            sub: `${summary?.pendingCount || 0} awaiting`
          },
          {
            label: "Total Payments",
            value: payments.length,
            sub: "all records"
          },
        ].map((s) => (
          <div key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase
              tracking-wide mb-2">{s.label}</p>
            <p className="text-2xl font-black text-black mb-1">{s.value}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pending Payments */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-black">Pending Payments</h3>
            <p className="text-xs text-gray-400">Click "Pay" to mark as completed</p>
          </div>
          {pending.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-400 text-sm mb-3">No pending payments.</p>
              <button onClick={openModal}
                className="text-xs bg-black text-white px-4 py-2 rounded-xl
                  hover:bg-gray-800 transition-colors">
                + Create Payment
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice", "Customer", "Amount", "Method", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                      text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id}
                    className="border-b border-gray-50 last:border-0
                      hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-black text-xs">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {p.customerName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-black text-xs">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs
                        px-2 py-0.5 rounded-full">
                        {methodLabel[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handlePay(p.id)}
                        disabled={payingId === p.id}
                        className="px-3 py-1.5 bg-black text-white text-xs
                          font-semibold rounded-lg hover:bg-gray-800
                          transition-colors disabled:opacity-50">
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
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No completed payments yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice", "Customer", "Method", "Amount", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                      text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.map(p => (
                  <tr key={p.id}
                    className="border-b border-gray-50 last:border-0
                      hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-black text-xs">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {p.customerName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs
                        px-2 py-0.5 rounded-full">
                        {methodLabel[p.method] || p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-black text-xs">
                      {fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ✅ Create Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
          bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4
              border-b border-gray-100">
              <h2 className="font-bold text-black">Create Payment</h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black text-xl">×</button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {formError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100
                  rounded-xl text-sm text-red-600">{formError}</div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">

                {/* Invoice */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Invoice *</label>
                  <select
                    value={form.invoiceId}
                    onChange={handleInvoiceChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors">
                    <option value="">Select Invoice</option>
                    {invoices.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} — ₹{Number(i.amount).toLocaleString("en-IN")}
                        ({i.customerName})
                      </option>
                    ))}
                  </select>
                  {invoices.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ No pending invoices. Create an order first.
                    </p>
                  )}
                </div>

                {/* Customer */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Customer *</label>
                  <select
                    value={form.customerId}
                    onChange={e => setForm({...form, customerId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors">
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Payment Method *</label>
                  <select
                    value={form.method}
                    onChange={e => setForm({...form, method: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                      text-sm focus:outline-none focus:border-black transition-colors">
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold text-gray-500
                    uppercase tracking-wide mb-1.5 block">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
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
                    {formLoading ? "Creating..." : "Create Payment"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl
                      text-sm text-gray-600 hover:bg-gray-50 transition-colors">
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