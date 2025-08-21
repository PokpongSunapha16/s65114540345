"use client";

import { useEffect } from "react";

interface ImagePopupProps {
  image: string; // URL รูปภาพที่จะแสดง
  onClose: () => void; // ฟังก์ชันปิด Popup
}

const ImagePopup: React.FC<ImagePopupProps> = ({ image, onClose }) => {
  // ปิด Popup เมื่อกดปุ่ม Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(); // ปิด Popup
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose} // คลิกนอก Popup เพื่อปิด
    >
      <div
        className="relative max-w-3xl w-full p-4 rounded-lg"
        onClick={(e) => e.stopPropagation()} // หยุด Event ไม่ให้ปิด Popup เมื่อคลิกด้านใน
      >
        {/* ปุ่มปิด Popup */}
        <button
          onClick={onClose}
          aria-label="Close Popup" // เพิ่ม aria-label
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600"
        >
          ✖
        </button>

        {/* รูปภาพ */}
        <img
          src={image}
          alt="Gallery Image"
          className="w-full h-auto max-h-screen rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default ImagePopup;
