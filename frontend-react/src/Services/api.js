import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const sendOtp = (mobile) =>
  API.post("/auth/send-otp", { mobile });

export const register = (data) =>
  API.post("/auth/register", data);

export const login = (data) =>
  API.post("/auth/login", data);

// ── Profile ───────────────────────────────────────
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile", data);
export const changePassword = (data) => API.patch("/profile/change-password", data);

// ── Dashboard ─────────────────────────────────────
export const getDashboardSummary = () =>
  API.get("/dashboard/summary");

// ── Customers ─────────────────────────────────────
export const getCustomers = () => API.get("/customers");
export const getCustomer = (id) => API.get(`/customers/${id}`);
export const createCustomer = (data) => API.post("/customers", data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);

// ── Orders ────────────────────────────────────────
export const getOrders = () => API.get("/orders");
export const getOrder = (id) => API.get(`/orders/${id}`);
export const createOrder = (data) => API.post("/orders", data);
export const updateOrderStatus = (id, status) =>
  API.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

// ── Invoices ──────────────────────────────────────
export const getInvoices = (status) =>
  API.get("/invoices", { params: status ? { status } : {} });
export const updateInvoiceStatus = (id, status) =>
  API.patch(`/invoices/${id}/status`, { status });

// ── Payments ──────────────────────────────────────
export const getPayments = () => API.get("/payments");
export const createPayment = (data) => API.post("/payments", data);
export const markPaymentAsPaid = (id) => API.patch(`/payments/${id}/pay`);
export const getPaymentSummary = () => API.get("/payments/summary");

export default API;