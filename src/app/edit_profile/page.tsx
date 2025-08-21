"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  username: string;
  profile_picture: string;
  note: string;
  district: string;
  position: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [district, setDistrict] = useState<string>("NONE");
  const [position, setPosition] = useState<string>("NONE");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setProfile(data);
        setNote(data.note || "");
        setDistrict(data.district || "NONE");
        setPosition(data.position || "NONE");
        setNewProfilePicture(data.profile_picture || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_picture: newProfilePicture, note, district, position }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      alert("โปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว!");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewProfilePicture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">แก้ไขโปรไฟล์</h1>

        {/* รูปโปรไฟล์ */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={newProfilePicture || "/default-profile.png"}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full mb-4 border-2 border-orange-400"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">คำแนะนำ</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="เพิ่มคำแนะนำตัว"
          ></textarea>
        </div>

        {/* อำเภอ */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">อำเภอ</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="NONE">ไม่มี</option>
            <option value="MUEANG">เมืองอุบลราชธานี</option>
            <option value="SI_MUEANG_MAI">ศรีเมืองใหม่</option>
            <option value="KHONG_CHIAM">โขงเจียม</option>
            <option value="KHUEANG_NAI">เขื่องใน</option>
            <option value="KHEMMARAT">เขมราฐ</option>
            <option value="DET">เดชอุดม</option>
            <option value="NA_CHALUAI">นาจะหลวย</option>
            <option value="NAM_YUEN">น้ำยืน</option>
            <option value="BUNTHARIK">บุณฑริก</option>
            <option value="TRAKAN">ตระการพืชผล</option>
            <option value="KUT_KHAOPUN">กุดข้าวปุ้น</option>
            <option value="MUANG_SAM_SIP">ม่วงสามสิบ</option>
            <option value="WARIN">วารินชำราบ</option>
            <option value="PHIBUN">พิบูลมังสาหาร</option>
            <option value="TAN_SUM">ตาลสุม</option>
            <option value="PHO_SAI">โพธิ์ไทร</option>
            <option value="SAMRONG">สำโรง</option>
            <option value="DON_MOT_DAENG">ดอนมดแดง</option>
            <option value="SIRINDHORN">สิรินธร</option>
            <option value="THUNG_SI_UDOM">ทุ่งศรีอุดม</option>
            <option value="SI_LAK_CHAI">ศรีหลักชัย</option>
            <option value="NAM_KHUN">น้ำขุ่น</option>
            <option value="LAO_SUEA_KOK">เหล่าเสือโก้ก</option>
            <option value="SAWANG_WIRAWONG">สว่างวีระวงศ์</option>
          </select>
        </div>

        {/* ตำแหน่ง */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm mb-1">ตำแหน่ง</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="NONE">ไม่ระบุ</option>
            <option value="GUARD">Guard</option>
            <option value="FORWARD">Forward</option>
            <option value="CENTER">Center</option>
          </select>
        </div>

        {/* ปุ่ม */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
