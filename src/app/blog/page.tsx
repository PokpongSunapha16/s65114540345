"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  slug: string;
  picture: string | null;
  createdAt: string; // ✅ เพิ่ม `createdAt` เพื่อเรียงข้อมูล
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/blog?search=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.blogs)) {
          throw new Error("Invalid API Response");
        }

        // ✅ จำกัดแค่ 3 บล็อก และเรียงจากใหม่ไปเก่า
        const sortedBlogs = data.blogs
        .sort((a: Blog, b: Blog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      

        setBlogs(sortedBlogs);
      })
      .catch((error) => {
        console.error("🚨 Error fetching blogs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchQuery]);

  if (loading) {
    return <div className="text-center mt-10 text-lg font-bold">กำลังโหลด...</div>;
  }

  return (
    <div className="relative p-6 min-h-screen mx-auto max-w-6xl">

      {/* หัวข้อใหญ่ */}
      <h1 className="text-3xl font-bold text-center mt-8">
        <span className="text-black">UBON </span>
        <span className="text-black">HOOPER </span>
        <span className="text-orange-500">BLOG</span>
      </h1>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* ฝั่งซ้าย - แสดงบล็อก */}
        <div className="col-span-2">
          <h2 className="text-xl font-bold mb-4">เรื่องราวที่น่าสนใจ</h2>

          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => router.push(`/blog/show/${blog.slug}`)}
                className="bg-white shadow-lg rounded-lg overflow-hidden mb-6 cursor-pointer"
              >
                {blog.picture ? (
                <img
                    src={blog.picture} // ✅ ใช้ค่า `picture` ตรงจาก API ที่แก้ไขแล้ว
                    alt={blog.title}
                    className="w-full h-44 object-cover"
                    onError={(e) => console.error("🔥 Error loading image:", e)} // ✅ Debug Error
                />
                ) : (
                <div className="w-full h-44 bg-gray-200"></div>
                )}

                <div className="p-4">
                  <h3 className="text-md font-semibold text-center break-words overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                {blog.title}
                </h3>
                </div>

            
              </div>
            ))
          ) : (
            <>
              <div className="w-200 h-72 bg-gray-200 mb-6 rounded-lg"></div>
              <div className="w-200 h-72 bg-gray-200 mb-6 rounded-lg"></div>
              <div className="w-200 h-72 bg-gray-200 mb-6 rounded-lg"></div>
            </>
          )}
        </div>

        {/* ฝั่งขวา - ค้นหา และ ประเภทบล็อก */}
        <div className="col-span-1 space-y-6">
          {/* ช่องค้นหา */}
          <div className="bg-black p-4 rounded-lg">
            <input
              type="text"
              placeholder="🔍 ค้นหาบล็อก..."
              className="w-full p-2 text-black rounded"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="w-full bg-gray-700 text-white p-2 mt-2 rounded"
              onClick={() => router.push("/blog/create")}
            >
              สร้างบล็อก
            </button>
          </div>

          {/* ปุ่ม บล็อกของคุณ */}
          <button
            className="w-full bg-orange-500 text-white p-2 rounded-lg"
            onClick={() => router.push("/blog/userBlogs")}
          >
            บล็อกของคุณ
          </button>

          {/* ประเภทบล็อก */}
          <div className="border border-gray-400 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">ประเภทบล็อก</h3>
            <ul className="mt-2 space-y-2">
              <li>
              <button onClick={() => router.push("/blog/category/general")} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                📌 เรื่องทั่วไป
              </button>
              </li>
              <li>
              <button onClick={() => router.push("/blog/category/health")} className="bg-green-500 text-white px-4 py-2 rounded-md">
                🏥 สุขภาพ
              </button>
              </li>
              <li>
              <button onClick={() => router.push("/blog/category/basketball")} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                🏀 บาสเกตบอล
              </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
