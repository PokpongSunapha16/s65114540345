"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const reportReasons = {
  RUDE: "เจตนาที่หยาบคาย และ ไม่มีมารยาท",
  SEXUAL: "มีเนื้อหาทางเพศที่ชัดเจน",
  VIOLENT: "การแสดงถึงความรุนแรง",
  THREATEN: "เป็นการข่มขู่",
};

export default function ReportPage() {
  const router = useRouter();
  const { slug } = useParams(); // ✅ ใช้ useParams() เพื่อดึง slug
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");

  const handleCancel = () => {
    router.back(); // กลับไปหน้าก่อนหน้า
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert("กรุณาเลือกหัวข้อรายงานก่อน");
      return;
    }

    try {
      const res = await fetch(`/api/blog/show/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason, // ส่ง ENUM ภาษาอังกฤษไป Backend
          details: additionalDetails,
        }),
      });

      if (!res.ok) throw new Error("การส่งรายงานล้มเหลว");
      alert("รายงานถูกส่งเรียบร้อยแล้ว");
      router.back();
    } catch (error) {
      console.error("🚨 Error submitting report:", error);
      alert("เกิดข้อผิดพลาดในการส่งรายงาน");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-6">รายงานปัญหา</h1>
      <p className="text-gray-600 text-center mb-8">
        โปรดเลือกหัวข้อที่ต้องการรายงาน และให้รายละเอียดเพิ่มเติม
      </p>

      {/* Report Form */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">ปัญหาของคุณคืออะไร ?</h2>
        <div className="space-y-4">
          {Object.entries(reportReasons).map(([key, label]) => (
            <label
              key={key}
              className="block bg-gray-100 hover:bg-gray-200 cursor-pointer p-3 rounded-md border border-gray-300 flex items-center"
            >
              <input
                type="radio"
                name="reportReason"
                value={key} // ใช้ ENUM ภาษาอังกฤษ
                checked={selectedReason === key}
                onChange={() => setSelectedReason(key)}
                className="mr-3"
              />
              {label} {/* แสดงเป็นภาษาไทย */}
            </label>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-6">รายละเอียดเพิ่มเติม (ถ้ามี)</h2>
        <textarea
          placeholder="อธิบายเพิ่มเติม..."
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          className="w-full mt-2 p-3 border rounded-md border-gray-300 focus:outline-none focus:ring focus:ring-orange-300"
          rows={4}
        ></textarea>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-md"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
