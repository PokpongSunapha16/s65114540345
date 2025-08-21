"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  slug: string;
  picture: string | null;
  createdAt: string;
  author: { username: string };
}

export default function CategoryPage() {
  const { category } = useParams(); // 📌 ดึงค่า category จาก URL
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`/api/blog/category/${category}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch blogs");
        setBlogs(data);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดบล็อก");
      } finally {
        setLoading(false);
      }
    }
    if (category) fetchBlogs();
  }, [category]);

  if (loading) return <div className="text-center mt-10">⏳ กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* 🏷️ หัวข้อประเภทบล็อก */}
      <h1 className="text-4xl font-bold text-center my-6">
        {category === "basketball" && "🏀 บาสเกตบอล"}
        {category === "health" && "💪 สุขภาพ"}
        {category === "general" && "📰 ทั่วไป"}
      </h1>

      {/* 🔍 ถ้าไม่มีบล็อกในหมวดหมู่ */}
      {blogs.length === 0 ? (
        <p className="text-center text-gray-500">ไม่มีบล็อกในหมวดหมู่นี้</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => router.push(`/blog/show/${blog.slug}`)}
            >
              {blog.picture && (
                <img
                  src={`data:image/png;base64,${blog.picture}`}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-gray-500 text-sm mt-2">
                  ✍️ {blog.author.username} | 📅{" "}
                  {new Date(blog.createdAt).toLocaleDateString("th-TH")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
