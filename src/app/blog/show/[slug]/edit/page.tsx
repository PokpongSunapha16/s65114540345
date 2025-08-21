"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditBlogPage() {
  const router = useRouter();
  const { slug } = useParams(); // ดึง slug จาก URL

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/show/${slug}`);
        if (!res.ok) throw new Error("ไม่พบข้อมูลบล็อก");

        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setPreviewImage(data.picture ? `data:image/png;base64,${data.picture}` : null);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlog();
  }, [slug]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file)); // แสดง preview ภาพใหม่
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      const res = await fetch(`/api/blog/show/${slug}/edit`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update blog");

      router.push(`/blog/show/${slug}`);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <div className="text-center mt-10">⏳ กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ แก้ไขบล็อก</h1>

      {/* 🖼 แสดงภาพตัวอย่าง */}
      {previewImage && (
        <div className="mb-4 flex justify-center">
          <img src={previewImage} alt="Preview" className="w-full md:w-3/4 rounded-lg shadow-md" />
        </div>
      )}

      {/* 📸 อัปโหลดรูปภาพใหม่ */}
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />

      {/* ✏️ แก้ไขหัวข้อ */}
      <input
        type="text"
        className="w-full p-2 border rounded-lg mb-4"
        placeholder="หัวข้อ"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 📝 แก้ไขเนื้อหา */}
      <textarea
        className="w-full p-2 border rounded-lg mb-4"
        placeholder="เนื้อหาของบล็อก"
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex justify-between">
        <button onClick={() => router.push(`/blog/show/${slug}`)} className="bg-gray-300 p-2 rounded">
          ยกเลิก
        </button>
        <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>
  );
}
