"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CommentSection from "./CommentSection";
import Hearts from "./Hearts";

interface Blog {
  id: number;
  title: string;
  slug: string;
  picture: string | null;
  content: string;
  category: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    profile_picture: string | null; 
  };
  hearts: number;
  isOwner: boolean;
}

export default function BlogDetail() {
  const router = useRouter();
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUserStatus() {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (res.ok && data.isLoggedIn) {
          setUserId(data.userId);
        } else {
          setUserId(null);
        }
      } catch (err) {
        console.error("🚨 Error fetching user status:", err);
        setUserId(null);
      }
    }
  
    fetchUserStatus();
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/show/${slug?.toString()}`);
        const data = await res.json();
        if (!res.ok || !data) throw new Error(data.error || "Failed to fetch blog");
        setBlog(data);
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดบล็อก");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlog();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่ต้องการลบบล็อกนี้?")) return;
    try {
      const res = await fetch(`/api/blog/show/${slug}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog");
      router.push("/blog");
    } catch (err) {
      console.error("🚨 Error deleting blog:", err);
    }
  };

  if (loading) return <div className="text-center mt-10">⏳ กำลังโหลด...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!blog) return <div className="text-center text-gray-500">บล็อกนี้ไม่มีอยู่</div>;

  return (
    <div className="relative p-6 max-w-4xl mx-auto">

      <button
            onClick={() => router.push(`/blog/show/${slug}/report`)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300"
          >
            รายงานปัญหา
          </button>

      {/* ✅ แสดงปุ่มเฉพาะเจ้าของ */}
      {blog.isOwner && (
        <>
          <button
            onClick={() => router.push(`/blog/show/${slug}/edit`)}
            className="absolute top-16 right-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300"
          >
            ✏ แก้ไขบล็อก
          </button>

          <button
            onClick={handleDelete}
            className="absolute top-28 right-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300"
          >
            🗑 ลบบล็อก
          </button>
        </>
      )}

      {/* 🏷️ หัวข้อบล็อก */}
      <h1 className="text-xl font-bold text-center mt-16">{blog.title}</h1>

      {/* ✍️ ชื่อผู้เขียน & 📅 วันที่ */}
      <p className="text-center text-gray-500 text-sm mt-6 flex justify-center items-center">
        ✍️ {blog.author.username} | 📅 {new Date(blog.createdAt).toLocaleDateString("th-TH")}
      </p>

      {/* 📸 รูปภาพปก */}
      {blog.picture && (
        <div className="w-full flex justify-center my-6">
          <img
            src={`data:image/png;base64,${blog.picture}`}
            alt={blog.title}
            className="w-full md:w-3/4 lg:w-2/3 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* 📝 เนื้อหาบล็อก */}
      <div className="prose max-w-none text-gray-800 leading-relaxed text-lg px-4">
        {blog.content}
      </div>

      {/* ❤️ ปุ่มไลก์ */}
      <Hearts slug={blog.slug} />

      {/* 💬 ระบบแสดงความคิดเห็น */}
      <div className="mt-10">
        <CommentSection slug={blog.slug} userId={userId || 0} />
      </div>
    </div>
  );
}
