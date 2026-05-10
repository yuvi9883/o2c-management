import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getProfile } from "../Services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetched = useRef(false); // ✅ prevent double fetch

    useEffect(() => {
        if (fetched.current) return; // ✅ skip if already fetched
        fetched.current = true;

        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        getProfile()
            .then(res => {
                console.log("✅ Profile loaded:", res.data);
                setProfile(res.data);
            })
            .catch(err => {
                console.error("❌ Profile failed:", err.response?.status);
                if (err.response?.status === 401) {
                    localStorage.clear();
                    window.location.href = "/login";
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ profile, setProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}