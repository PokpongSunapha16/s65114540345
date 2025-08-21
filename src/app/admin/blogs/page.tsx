"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  content: string;
  author: { username: string };
  createdAt: string;
  slug: string; // ✅ เพิ่ม slug เพื่อใช้ลิงก์ไปยังหน้าบล็อก
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]); // ✅ ใช้ state แสดงผลการค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ โหลดบล็อกทั้งหมด
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/admin/blogs");
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data);
        setFilteredBlogs(data); // ✅ เริ่มต้นให้ filteredBlogs เท่ากับ blogs
      } catch (err) {
        setError("Error loading blogs");
        console.error(err);
      }
    }
    fetchBlogs();
  }, []);

  // ✅ ค้นหาบล็อกตามชื่อ
  useEffect(() => {
    if (!searchQuery) {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  // ✅ ฟังก์ชันลบบล็อก
  const handleDelete = async (blogId: number) => {
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">📝 จัดการบล็อก</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ ช่องค้นหาบล็อก */}
      <input
        type="text"
        placeholder="🔍 ค้นหาบล็อก..."
        className="w-full p-2 border rounded mt-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* ✅ แสดงข้อความหากไม่มีบล็อก */}
      {filteredBlogs.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">ไม่มีบล็อกในตอนนี้</p>
      ) : (
        <ul className="mt-4">
          {filteredBlogs.map((blog) => (
            <li key={blog.id} className="border p-4 my-2">
              <h3 className="font-semibold">{blog.title}</h3>
              <p className="text-gray-600 text-sm">
                ผู้โพสต์ : {blog.author.username} |{" "}
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2">{blog.content.substring(0, 100)}...</p>

              {/* ✅ ปุ่มตรวจสอบ */}
              <button
                onClick={() => router.push(`/blog/show/${blog.slug}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2"
              >
                🔍 ตรวจสอบ
              </button>

              {/* ✅ ปุ่มลบบล็อก */}
              <button
                onClick={() => handleDelete(blog.id)}
                className="bg-red-500 text-white px-4 py-2 rounded mt-2"
              >
                🗑️ ลบบล็อก
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
