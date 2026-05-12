import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    mobile:   "",
    email:    "",
    password: "",
  });
  const [otp, setOtp]         = useState("");
  const [otpSent, setOtpSent] = useState(false); // controls OTP box visibility
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── STEP 1: Validate + Send OTP ───────────────────────────
  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!form.fullName.trim()) { setError("Please enter your full name."); return; }
    if (!form.username.trim()) { setError("Please enter a username."); return; }
    if (!form.mobile.trim())   { setError("Please enter your mobile number."); return; }
    if (form.mobile.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }
    if (!form.password.trim()) { setError("Please enter a password."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { mobile: form.mobile.trim() });
      setOtpSent(true);
      setMessage("OTP sent! Check the Spring Boot terminal for the OTP code.");
    } catch (err) {
      setError(
       err.response?.data?.error ||
err.response?.data?.message ||
"Could not send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP + Register ────────────────────────
  const handleRegister = async () => {
    setError("");
    setMessage("");

    if (!otp.trim())      { setError("Please enter the OTP."); return; }
    if (otp.length !== 6) { setError("OTP must be 6 digits."); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        mobile:   form.mobile.trim(),
        email:    form.email.trim(),
        password: form.password.trim(),
        otp:      otp.trim(),
      });
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (id) =>
    `w-full py-3 pr-4 rounded-xl border bg-white text-black text-sm
     placeholder-gray-400 focus:outline-none transition-all duration-300
     ${focused === id ? "pl-8 border-black shadow-sm" : "pl-4 border-gray-200"}`;

  const fields = [
    { id: "fullName", label: "Full Name",      type: "text",     placeholder: "Your full name" },
    { id: "username", label: "Username",        type: "text",     placeholder: "Choose a username" },
    { id: "mobile",   label: "Mobile Number",   type: "tel",      placeholder: "10-digit mobile number" },
    { id: "email",    label: "Email (Optional)", type: "email",   placeholder: "your@email.com" },
    { id: "password", label: "Password",         type: "password", placeholder: "At least 6 characters" },
  ];

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
            Get started<br />in minutes.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Create your account and start managing your business operations with ease.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {["Fast Setup", "OTP Secured", "Real-time Data", "Multi-user"].map((f) => (
            <div key={f} className="border border-white/10 rounded-xl px-4 py-3">
              <p className="text-white text-xs font-semibold">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <h1 className="text-3xl font-bold text-black mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-8">Fill in your details to get started</p>

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

            {/* Form fields — disabled after OTP sent */}
            {fields.map((f) => (
              <div key={f.id}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  {f.label}
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-black
                    font-bold text-base transition-all duration-300
                    ${focused === f.id ? "opacity-100" : "opacity-0 -translate-x-2"}`}>
                    ›
                  </span>
                  <input
                    type={f.type}
                    name={f.id}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={handleChange}
                    onFocus={() => setFocused(f.id)}
                    onBlur={() => setFocused("")}
                    disabled={otpSent}
                    className={`${inputCls(f.id)} ${otpSent ? "bg-gray-50 text-gray-500" : ""}`}
                  />
                </div>
              </div>
            ))}

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
                {/* Register button */}
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="relative w-full py-3 rounded-xl bg-black text-white font-semibold
                    text-sm overflow-hidden group transition-all duration-300
                    hover:shadow-lg disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100
                    origin-left transition-transform duration-300 rounded-xl" />
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                    {loading ? "Registering..." : "Register →"}
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
                  ← Change details / Resend OTP
                </button>
              </div>
            )}

          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login"
              className="text-black font-semibold hover:underline underline-offset-2">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
