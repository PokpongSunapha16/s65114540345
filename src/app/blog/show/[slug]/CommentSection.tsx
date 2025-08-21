"use client";

import { useState, useEffect } from "react";
import { Trash } from "lucide-react"; // ใช้เฉพาะไอคอนลบ

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  author: {
    id: number;
    username: string;
    profile_picture: string | null;
  };
}

export default function CommentSection({ slug, userId }: { slug: string; userId: number | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 โหลดความคิดเห็นเมื่อหน้าโหลด
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/blog/show/${slug}/comments`);
        const data = await res.json();
        if (res.ok) {
          setComments(data);
        } else {
          console.error("🚨 Error fetching comments:", data.error);
        }
      } catch (error) {
        console.error("🚨 Error fetching comments:", error);
      }
    }
    fetchComments();
  }, [slug]);

  // ✏️ ฟังก์ชันโพสต์ความคิดเห็น (ป้องกันผู้ใช้ที่ไม่ได้เข้าสู่ระบบ)
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || loading) return;
    if (!userId) {
      alert("คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแสดงความคิดเห็นได้");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/blog/show/${slug}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]); // ✅ อัปเดตคอมเมนต์ทันที
        setNewComment("");
      } else {
        console.error("🚨 Error posting comment:", data.error);
      }
    } catch (err) {
      console.error("🚨 Error posting comment:", err);
    } finally {
      setLoading(false);
    }
  };

  // ❌ ฟังก์ชันลบความคิดเห็น
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่ต้องการลบความคิดเห็นนี้?")) return;

    try {
      const res = await fetch(`/api/blog/show/${slug}/comments/delete/${commentId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete comment");

      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("🚨 Error deleting comment:", err);
    }
  };

  return (
    <div className="mt-6">
      {/* 📝 กล่องเขียนความคิดเห็น (แสดงเฉพาะผู้ที่เข้าสู่ระบบ) */}
      {userId ? (
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="✏️ เขียนความคิดเห็น..."
            className="w-full p-2 border rounded-lg"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
          </button>
        </div>
      ) : (
        <p className="text-red-500 text-center">⚠️ คุณต้องเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
      )}

      {/* 💬 แสดงรายการความคิดเห็น */}
      {comments.length > 0 ? (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 p-3 border-b">
              {/* 📷 รูปโปรไฟล์ผู้คอมเมนต์ */}
              <img
                src={comment.author.profile_picture || "/default-avatar.png"}
                className="w-10 h-10 rounded-full"
                alt={comment.author.username}
              />
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{comment.author.username}</p>
                  <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>

              {/* ❌ ปุ่มลบ (แสดงเฉพาะเจ้าของคอมเมนต์) */}
              {userId !== null && userId === comment.userId && (
                <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:scale-110">
                  <Trash size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">ยังไม่มีความคิดเห็น</p>
      )}
    </div>
  );
}
