"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function Hearts ({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(0);

  // 🔄 โหลดจำนวนหัวใจเมื่อหน้าโหลด
  useEffect(() => {
    async function fetchLikes() {
      try {
        const res = await fetch(`/api/blog/show/${slug}/heart`);
        if (!res.ok) throw new Error("Failed to fetch likes");
        const data = await res.json();
        
        if (data.success) {
          setLikes(data.total || 0);
          setLiked(data.liked || false);
        }
      } catch (error) {
        console.error("🚨 Error fetching likes:", error);
      }
    }
    fetchLikes();
  }, [slug]);

  // ❤️ ฟังก์ชันกดหัวใจ
  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/show/${slug}/heart`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like/unlike post");

      const data = await res.json();

      if (data.success) {
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
        setLiked(data.liked);
      }
    } catch (err) {
      console.error("🚨 Error liking post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between mt-6">
      {/* ❤️ ปุ่มกดหัวใจ */}
      <button
        onClick={handleLike}
        className={`flex items-center ${liked ? "text-red-500" : "text-gray-500"} hover:scale-105 transition-transform`}
        disabled={loading}
      >
        <Heart fill={liked ? "red" : "none"} size={24} className="mr-2" /> {likes} Likes
      </button>
    </div>
  );
}
