"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("USER"); // เพิ่มฟิลด์สำหรับ role
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // จำกัดขนาดไม่เกิน 1MB
      if (file.size > 1024 * 1024) {
        alert("File size must not exceed 1MB");
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        if (!base64Image.startsWith("data:image")) {
          alert("Invalid file format. Please upload an image.");
          return;
        }
        setProfilePicture(base64Image);
      };
      reader.onerror = () => {
        alert("Failed to read the file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // ตรวจสอบว่ารหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mail,
          password,
          profile_picture: profilePicture || null, // กรณีไม่มีรูปภาพ ให้ส่ง null
          role, // ส่ง role เป็น admin หรือ user
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to register");
      } else {
        alert("สมัครสมาชิกสำเร็จ!");
        router.push("/signin");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("ไม่สามารถสมัครบัญชี้นี้ได้");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-orange-400 flex justify-center items-center">
      <div className="py-12 px-12 bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">ไม่มีรูปภาพ</span>
            )}
          </div>
          <label
            htmlFor="profilePicture"
            className="mt-2 text-blue-500 text-sm cursor-pointer hover:underline"
          >
            อัพโหลดรูปโปรไฟล์
          </label>
          <input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
          {error && <p className="text-red-500 text-L mt-2">{error}</p>}
        </div>
        <h1 className="text-3xl font-bold text-center mb-4">สมัครสมาชิก</h1>
        <p className="text-center text-sm mb-8 font-semibold text-gray-700 tracking-wide">
          คุณสามารถสมัครเพื่อเป็นส่วนหนึ่งกับเราได้แล้ว!!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ชื่อผู้ใช้"
            className="block text-sm py-3 px-4 rounded-lg w-full border"
            required
          />
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="อีเมล"
            className="block text-sm py-3 px-4 rounded-lg w-full border"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="block text-sm py-3 px-4 rounded-lg w-full border"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 focus:outline-none"
            >
              {showPassword ? "◎" : "👁️"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่าน"
              className="block text-sm py-3 px-4 rounded-lg w-full border"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 focus:outline-none"
            >
              {showConfirmPassword ? "◎" : "👁️"}
            </button>
          </div>

          {/* เพิ่ม checkbox สำหรับเลือก role */}
          <div>
            <input
              type="checkbox"
              id="admin"
              value="ADMIN"
              onChange={(e) => setRole(e.target.checked ? "ADMIN" : "USER")}
              className="mr-2"
            />
            <label htmlFor="admin" className="text-sm">สมัครเป็นผู้ดูแลระบบ (Admin)</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xl text-white bg-green-400 rounded-lg hover:bg-orange-500 transition-all"
          >
            สมัครบัญชี
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          คุณมีสมาชิกแล้วใช่ไหม?{" "}
          <span
            className="text-orange-500 font-medium cursor-pointer hover:underline"
            onClick={() => router.push("/signin")}
          >
            เข้าสู่ระบบ
          </span>
        </p>
      </div>
    </div>
  );
}
