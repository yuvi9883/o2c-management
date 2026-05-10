import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080/api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername]   = useState("");
  const [mobile, setMobile]       = useState("");
  const [otp, setOtp]             = useState("");
  const [otpSent, setOtpSent]     = useState(false); // controls OTP box visibility
  const [focused, setFocused]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");
  const [error, setError]         = useState("");

  // ── STEP 1: Send OTP ───────────────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!username.trim()) { setError("Please enter your username."); return; }
    if (!mobile.trim())   { setError("Please enter your mobile number."); return; }
    if (mobile.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { mobile: mobile.trim() });
      setOtpSent(true);
      setMessage("OTP sent! Check the Spring Boot terminal for the OTP code.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not send OTP. Make sure the Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP + Login ────────────────────────────
  // ── STEP 2: Verify OTP + Login ────────────────────────────
const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!otp.trim())       { setError("Please enter the OTP."); return; }
    if (otp.length !== 6)  { setError("OTP must be 6 digits."); return; }

    setLoading(true);
    try {
      // ✅ FIXED — changed from /auth/login to /auth/login-otp
      const res = await axios.post(`${API}/auth/login-otp`, {
        username: username.trim(),
        mobile:   mobile.trim(),
        otp:      otp.trim(),
      });

      // Save token and user info
      localStorage.setItem("token",    res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role",     res.data.role);
      localStorage.setItem("fullName", res.data.fullName || res.data.username);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Please check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
};

  const inputCls = (id) =>
    `w-full py-3 pr-4 rounded-xl border bg-white text-black text-sm
     placeholder-gray-400 focus:outline-none transition-all duration-300
     ${focused === id ? "pl-8 border-black shadow-sm" : "pl-4 border-gray-200"}`;

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left black panel ─────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-xs">O2C</span>
          </div>
          <span className="text-white font-bold text-lg">Order to Cash</span>
        </div>
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Streamline your<br />order-to-cash<br />workflow.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Manage orders, invoices, payments, and customers — all in one place.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {["Orders", "Invoices", "Payments", "Customers"].map((t) => (
            <span key={t}
              className="text-xs text-white/30 border border-white/10 px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-black mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your O2C account</p>

          {/* Success message */}
          {message && (
            <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200
              rounded-xl text-sm text-gray-700 flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>{message}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100
              rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span className="font-bold mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">

            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-black
                  font-bold text-base transition-all duration-300
                  ${focused === "username" ? "opacity-100" : "opacity-0 -translate-x-2"}`}>
                  ›
                </span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused("username")}
                  onBlur={() => setFocused("")}
                  disabled={otpSent}
                  className={`${inputCls("username")} ${otpSent ? "bg-gray-50 text-gray-500" : ""}`}
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Mobile Number
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-black
                  font-bold text-base transition-all duration-300
                  ${focused === "mobile" ? "opacity-100" : "opacity-0 -translate-x-2"}`}>
                  ›
                </span>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onFocus={() => setFocused("mobile")}
                  onBlur={() => setFocused("")}
                  disabled={otpSent}
                  className={`${inputCls("mobile")} ${otpSent ? "bg-gray-50 text-gray-500" : ""}`}
                />
              </div>
            </div>

            {/* OTP box — only appears after Send OTP clicked */}
            {otpSent && (
              <div className="animate-fadeIn">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Enter OTP
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-black
                    font-bold text-base transition-all duration-300
                    ${focused === "otp" ? "opacity-100" : "opacity-0 -translate-x-2"}`}>
                    ›
                  </span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP from terminal"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
                    onFocus={() => setFocused("otp")}
                    onBlur={() => setFocused("")}
                    autoFocus
                    className={inputCls("otp")}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 pl-1">
                  Check the Spring Boot terminal window for your OTP code
                </p>
              </div>
            )}

            {/* Button — changes based on state */}
            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="relative w-full py-3 rounded-xl bg-black text-white font-semibold
                  text-sm overflow-hidden group transition-all duration-300
                  hover:shadow-lg disabled:opacity-50 mt-2"
              >
                <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100
                  origin-left transition-transform duration-300 rounded-xl" />
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                  {loading ? "Sending OTP..." : "Send OTP →"}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Login button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="relative w-full py-3 rounded-xl bg-black text-white font-semibold
                    text-sm overflow-hidden group transition-all duration-300
                    hover:shadow-lg disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100
                    origin-left transition-transform duration-300 rounded-xl" />
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {loading ? "Logging in..." : "Login →"}
                  </span>
                </button>

                {/* Resend OTP */}
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setMessage("");
                    setError("");
                  }}
                  className="w-full text-center text-sm text-gray-400
                    hover:text-black transition-colors"
                >
                  ← Change number / Resend OTP
                </button>
              </div>
            )}

          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register"
              className="text-black font-semibold hover:underline underline-offset-2">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
