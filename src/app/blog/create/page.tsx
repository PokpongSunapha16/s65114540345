"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [content, setContent] = useState("");
  const [picture, setPicture] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // ✅ รายการหมวดหมู่ของบล็อก
  const blogCategories = [
    { label: "เรื่องทั่วไป", value: "GENERAL" },
    { label: "สุขภาพ", value: "HEALTH" },
    { label: "บาสเกตบอล", value: "BASKETBALL" },
  ];

  // ✅ ฟังก์ชันแปลงรูปภาพเป็น Base64 และแสดง Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const result = reader.result as string;
        setPicture(result);
        setPreviewImage(result); // ✅ แสดง Preview
      };
    }
  };

  // ✅ ฟังก์ชัน Submit ฟอร์ม
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title || !content) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    if (!picture) {
      setErrorMessage("กรุณาเพิ่มรูปภาพด้วย");
      setLoading(false);
      return;
    }

    // ✅ ส่งข้อมูลไปยัง API `/api/blog/create`
    const response = await fetch("/api/blog/create", {
      method: "POST",
      body: JSON.stringify({
        title,
        category,
        content,
        picture,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (data.success) {
      router.push(`/blog/show/${data.slug}`);
    } else {
      setErrorMessage("เกิดข้อผิดพลาด: " + data.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">สร้างบล็อกใหม่</h1>

      {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ✅ หัวข้อบล็อก */}
        <div>
          <label className="block text-lg font-semibold">หัวข้อบล็อก</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="ใส่ชื่อบล็อก..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ✅ Dropdown เลือกหมวดหมู่ */}
        <div>
          <label className="block text-lg font-semibold">หมวดหมู่</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {blogCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ รูปภาพปก */}
        <div>
          <label className="block text-lg font-semibold">รูปภาพปก</label>
          {previewImage ? (
            <img
              src={previewImage}
              alt="รูปภาพที่อัปโหลด"
              className="w-full h-64 object-cover rounded-lg mb-2"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg mb-2">
              <span className="text-gray-500">เลือกรูปภาพ</span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* ✅ เนื้อหาของบล็อก */}
        <div>
          <label className="block text-lg font-semibold">เนื้อหา</label>
          <textarea
            className="w-full p-2 border rounded-lg h-40"
            placeholder="เขียนเนื้อหาของคุณที่นี่..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {/* ✅ ปุ่มสร้างบล็อก & ยกเลิก */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
            disabled={loading}
          >
            {loading ? "กำลังสร้าง..." : "สร้างบล็อก"}
          </button>
          <button
            type="button"
            className="w-full bg-red-600 text-white p-3 rounded-lg font-bold"
            onClick={() => router.push("/blog")}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
