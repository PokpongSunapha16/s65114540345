"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImagePopup from "@/app/components/ImagePopup";

interface User {
  id: number;
  username: string;
  district: string;
  position: string;
  note: string | null;
  galleries: ImageData[];
}

interface ImageData {
  id: number;
  image: string;
}

// ✅ Map แปลงอำเภอจากภาษาอังกฤษเป็นภาษาไทย
const districtMap: Record<string, string> = {
  MUEANG: "เมืองอุบลราชธานี",
  SI_MUEANG_MAI: "ศรีเมืองใหม่",
  KHONG_CHIAM: "โขงเจียม",
  KHUEANG_NAI: "เขื่องใน",
  KHEMMARAT: "เขมราฐ",
  DET: "เดชอุดม",
  NA_CHALUAI: "นาจะหลวย",
  NAM_YUEN: "น้ำยืน",
  BUNTHARIK: "บุณฑริก",
  TRAKAN: "ตระการพืชผล",
  KUT_KHAOPUN: "กุดข้าวปุ้น",
  MUANG_SAM_SIP: "ม่วงสามสิบ",
  WARIN: "วารินชำราบ",
  PHIBUN: "พิบูลมังสาหาร",
  TAN_SUM: "ตาลสุม",
  PHO_SAI: "โพธิ์ไทร",
  SAMRONG: "สำโรง",
  DON_MOT_DAENG: "ดอนมดแดง",
  SIRINDHORN: "สิรินธร",
  THUNG_SI_UDOM: "ทุ่งศรีอุดม",
  SI_LAK_CHAI: "ศรีหลักชัย",
  NAM_KHUN: "น้ำขุ่น",
  LAO_SUEA_KOK: "เหล่าเสือโก้ก",
  SAWANG_WIRAWONG: "สว่างวีระวงศ์",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // State for logged-in admin user ID
  const router = useRouter();

  // ✅ ดึงข้อมูลผู้ใช้ที่ล็อกอิน
  useEffect(() => {
    const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // decode the JWT token
        setCurrentUserId(decodedToken.id); // Extract logged-in user's id
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // ✅ โหลดข้อมูลผู้ใช้
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/api/admin/users?search=${searchQuery}`);
        if (!res.ok) throw new Error("Failed to fetch users with gallery");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError("Error loading users with gallery");
        console.error(err);
      }
    }
    fetchUsers();
  }, [searchQuery]);
  

  // ✅ ฟังก์ชันเปิด Popup ดูรูป
  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // ✅ ฟังก์ชันปิด Popup
  const handleClosePopup = () => {
    setSelectedImage(null);
  };

  // ✅ ฟังก์ชันลบรูปภาพ
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("⚠️ คุณต้องการลบรูปภาพนี้หรือไม่?")) return;

    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          galleries: user.galleries.filter((img) => img.id !== imageId),
        }))
      );
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  };

  // ✅ ฟังก์ชันลบสมาชิก
  const handleDeleteUser = async (userId: number) => {

    // ตรวจสอบว่าผู้ใช้ที่ต้องการลบคือตัวเองหรือไม่
    if (userId === currentUserId) {
      alert("คุณไม่สามารถลบตัวเองได้");
      return;
    }

    if (!window.confirm("🚨 คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้? การลบนี้ไม่สามารถย้อนกลับได้!")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ส่ง userId
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "ไม่สามารถลบสมาชิกได้");
        return;
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">👥 จัดการสมาชิก</h1>

      <input
        type="text"
        placeholder="🔍 ค้นหาสมาชิก..."
        className="w-full p-2 border border-gray-400 rounded mt-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {users.length === 0 ? (
        <p className="text-gray-500 mt-6">⛔ ไม่มีข้อมูลสมาชิก</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {users.map((user) => (
            <li key={user.id} className="border p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg">👤 {user.username}</h3>
              <p className="text-sm text-gray-600">📍 อำเภอ: {districtMap[user.district] || "ไม่ระบุ"}</p>
              <p className="text-sm text-gray-600">🏀 ตำแหน่ง: {user.position}</p>
              <p className="text-sm text-gray-500">{user.note ? `📝 Note: ${user.note}` : "ไม่มี Note"}</p>

              {/* ✅ แสดงรูปภาพทั้งหมดของผู้ใช้ */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {user.galleries.length > 0 ? (
                  user.galleries.map((img) => (
                    <div key={img.id} className="border p-2 rounded-md">
                      <img
                        src={img.image}
                        alt="Gallery"
                        className="w-full h-40 object-cover rounded-md cursor-pointer"
                        onClick={() => handleViewImage(img.image)} // ✅ คลิกที่รูปเพื่อเปิด Popup
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="mt-2 bg-red-500 text-white px-2 py-1 rounded w-auto"
                      >
                        🗑️ ลบรูป
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-gray-500">🚫 ผู้ใช้ยังไม่มีรูปภาพในแกลลอรี่</p>
                )}
              </div>

              {/* ✅ ปุ่มตรวจสอบไปยังโปรไฟล์ผู้ใช้ */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => router.push(`/user/${user.id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded w-auto"
                >
                  🔍 ตรวจสอบ
                </button>

                {/* ✅ ปุ่มลบสมาชิก */}
                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-700 text-white px-2 py-1 rounded w-auto"
                  >
                    🚨 ลบสมาชิก
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Image Popup */}
      {selectedImage && <ImagePopup image={selectedImage} onClose={handleClosePopup} />}
    </div>
  );
}
