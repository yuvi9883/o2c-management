import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { updateProfile, changePassword } from "../Services/api";

const titles = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/orders/create": "Create Order",
  "/invoices": "Invoices",
  "/payments": "Payments",
  "/customers": "Customers",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || "O2C Management";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { profile, setProfile } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({ username: "", fullName: "", email: "", mobile: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (profile) {
        setProfileForm({
            username: profile.username || "",
            fullName: profile.fullName || "",
            email: profile.email || "",
            mobile: profile.mobile || "",
        });
    }
}, [profile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setProfileLoading(true);
    try {
      const res = await updateProfile(profileForm);
      setProfile(res.data);
      localStorage.setItem("username", res.data.username);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr("New password and confirm password do not match.");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      setPwMsg("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwErr(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.username?.[0]?.toUpperCase() || "U";

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-black">{title}</h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors w-48"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full"></span>
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">{profile?.fullName || profile?.username || "User"}</p>
                      <p className="text-xs text-gray-400">{profile?.email || profile?.mobile || ""}</p>
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                        {profile?.role || "USER"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile info rows */}
                <div className="px-5 py-3 space-y-2 border-b border-gray-100">
                  <InfoRow icon="👤" label="Username" value={profile?.username} />
                  <InfoRow icon="📧" label="Email" value={profile?.email || "—"} />
                  <InfoRow icon="📱" label="Mobile" value={profile?.mobile || "—"} />
                </div>

                {/* Actions */}
                <div className="px-3 py-2 space-y-1">
                  <button
                    onClick={() => { setDropdownOpen(false); setShowProfileModal(true); setProfileMsg(""); setProfileErr(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-base">✏️</span> Edit Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); setShowPasswordModal(true); setPwMsg(""); setPwErr(""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-base">🔒</span> Change Password
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <span className="text-base">🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Edit Profile Modal ──────────────────────────────── */}
      {showProfileModal && (
        <Modal title="Edit Profile" onClose={() => setShowProfileModal(false)}>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMsg && <Alert type="success" msg={profileMsg} />}
            {profileErr && <Alert type="error" msg={profileErr} />}
            <Field label="Full Name" value={profileForm.fullName}
              onChange={(v) => setProfileForm({ ...profileForm, fullName: v })} placeholder="Your full name" />
            <Field label="Username" value={profileForm.username}
              onChange={(v) => setProfileForm({ ...profileForm, username: v })} placeholder="Username" />
            <Field label="Email" type="email" value={profileForm.email}
              onChange={(v) => setProfileForm({ ...profileForm, email: v })} placeholder="your@email.com" />
            <Field label="Mobile" type="tel" value={profileForm.mobile}
              onChange={(v) => setProfileForm({ ...profileForm, mobile: v })} placeholder="+91 98765 43210" />
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={profileLoading}
                className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Change Password Modal ───────────────────────────── */}
      {showPasswordModal && (
        <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwMsg && <Alert type="success" msg={pwMsg} />}
            {pwErr && <Alert type="error" msg={pwErr} />}
            <Field label="Current Password" type="password" value={pwForm.currentPassword}
              onChange={(v) => setPwForm({ ...pwForm, currentPassword: v })} placeholder="Your current password" />
            <Field label="New Password" type="password" value={pwForm.newPassword}
              onChange={(v) => setPwForm({ ...pwForm, newPassword: v })} placeholder="At least 6 characters" />
            <Field label="Confirm New Password" type="password" value={pwForm.confirmPassword}
              onChange={(v) => setPwForm({ ...pwForm, confirmPassword: v })} placeholder="Repeat new password" />
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={pwLoading}
                className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {pwLoading ? "Changing..." : "Change Password"}
              </button>
              <button type="button" onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// ── Helper Components ─────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span>{icon}</span>
      <span className="text-gray-400 w-14">{label}</span>
      <span className="font-medium text-black truncate">{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-black text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
      />
    </div>
  );
}

function Alert({ type, msg }) {
  return (
    <div className={`px-4 py-3 rounded-xl text-sm flex items-start gap-2
      ${type === "success" ? "bg-gray-50 border border-gray-200 text-gray-700" : "bg-red-50 border border-red-100 text-red-600"}`}>
      <span className="font-bold mt-0.5">{type === "success" ? "✓" : "!"}</span>
      <span>{msg}</span>
    </div>
  );
}
