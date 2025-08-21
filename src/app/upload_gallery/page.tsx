"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadGalleryPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setMessage("กรุณาเลือกรูปภาพที่ต้องการอัปโหลด");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;

      setIsUploading(true);
      try {
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!res.ok) {
          const error = await res.json();
          setMessage(error.error || "การอัปโหลดรูปภาพล้มเหลว");
          return;
        }

        setMessage("อัปโหลดรูปภาพสำเร็จ!");
        setSelectedImage(null);
        setPreview(null);
      } catch (error) {
        console.error("Error uploading image:", error);
        setMessage("เกิดข้อผิดพลาดระหว่างการอัปโหลด");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleCancel = () => {
    router.back(); // ย้อนกลับไปหน้าก่อนหน้า
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">อัปโหลดรูปภาพในแกลเลอรี</h1>

        {preview ? (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-lg" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500">เลือกรูปภาพ</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleUpload}
            className={`bg-blue-500 text-white py-2 px-4 rounded-lg ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
            disabled={isUploading}
          >
            {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center ${message.includes("สำเร็จ") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
