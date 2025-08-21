"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ ตรวจสอบสถานะการล็อกอินเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        const data = await res.json();
        setIsLoggedIn(data.isLoggedIn);
        localStorage.setItem("isLoggedIn", data.isLoggedIn ? "true" : "false"); // ✅ บันทึกสถานะล็อกอินใน localStorage
      } catch (error) {
        console.error("❌ Error checking auth status:", error);
      }
    };

    checkAuthStatus();
  }, []);

  // ✅ ตรวจจับการเปลี่ยนแปลงของ localStorage เมื่อ Login หรือ Logout
  useEffect(() => {
    const syncAuthStatus = () => {
      const storedStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(storedStatus);
    };

    window.addEventListener("storage", syncAuthStatus); // ✅ ตรวจจับการเปลี่ยนแปลงของ localStorage (เช่น logout)
    return () => window.removeEventListener("storage", syncAuthStatus);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
