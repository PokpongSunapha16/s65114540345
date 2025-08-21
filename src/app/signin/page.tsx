"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/authContext";

export default function SignIn() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn } = useAuth(); // ใช้ Context อัปเดตสถานะล็อกอิน

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password }),
        credentials: "include",
      });

      if (res.ok) {
        setIsLoggedIn(true); // อัปเดต Context
        localStorage.setItem("isLoggedIn", "true"); // ✅ เก็บสถานะล็อกอินไว้

        setTimeout(() => {
          router.refresh(); // ✅ รีเฟรช UI ทั้งหมด
          router.push("/home"); // ✅ ไปหน้า home
        }, 200); // ✅ ดีเลย์เล็กน้อยให้ Navbar อัปเดตก่อน
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to login");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in.");
    }
  };

  return (
    <div className="min-h-screen bg-orange-400 flex justify-center items-center">
      <div className="py-10 px-12 bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">ยินดีต้อนรับ</h1>
          <p className="text-sm text-gray-600 font-semibold mb-8">
            เข้าสู่ระบบเพื่อใช้งานเว็บไซต์ได้เลย!!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              id="mail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-400 focus:border-orange-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-orange-400 focus:border-orange-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-orange-500 focus:outline-none"
              >
                {showPassword ? "◎" : "👁️"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-orange-500 rounded-lg shadow-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-400"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          คุณมีบัญชีหรือไม่?{" "}
          <span
            className="text-orange-500 font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/signup")}
          >
            สมัครสมาชิก
          </span>
        </p>
      </div>
    </div>
  );
}
