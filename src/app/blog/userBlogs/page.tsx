"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
  category: string;
  hearts: number;
}

export default function UserBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserBlogs() {
      try {
        const res = await fetch("/api/user/blogs");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load blogs");
        }

        setBlogs(data);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดบล็อกของคุณ");
      } finally {
        setLoading(false);
      }
    }

    fetchUserBlogs();
  }, []);

  if (loading) return <div className="text-center mt-10">⏳ กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📝 บล็อกของคุณ</h1>
      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">คุณยังไม่มีบล็อกที่สร้าง</p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => router.push(`/blog/show/${blog.slug}`)}
              className="p-4 border rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition"
            >
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-gray-500 text-sm">
                📅 {new Date(blog.createdAt).toLocaleDateString("th-TH")} | ❤️ {blog.hearts} ไลก์
              </p>
              <p className="text-gray-600 text-sm">📌 หมวดหมู่: {blog.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
