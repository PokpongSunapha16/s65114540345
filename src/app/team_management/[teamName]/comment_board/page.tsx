"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";

interface Comment {
  id: number;
  user: { username: string; profile_picture?: string };
  content: string;
  createdAt: string;
}

export default function CommentBoard() {
  const { teamName } = useParams();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/team_management/${encodeURIComponent(teamName as string)}/comment_board`)
      const data = await res.json();
      console.log("📥 Received comments:", data);
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("🚨 Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [teamName, refresh]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      {/* หัวข้อกระดานความคิดเห็น */}
      <h1 className="text-2xl font-bold mb-6 mt-10">กระดานความคิดเห็น</h1>

      {/* ปุ่มไปหน้าเขียนความคิดเห็น */}
      <div className="flex justify-between items-center bg-black py-2 px-4 rounded-lg shadow-md mb-6 w-2/3 mx-auto">
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          onClick={() => router.push(`/team_management/${teamName}/comment_board/write`)}
        >
          เขียนความคิดเห็น
        </button>
      </div>

      {/* แสดงความคิดเห็น */}
      <div className="flex flex-col items-center mt-2 w-full">
        {loading ? (
          <p className="text-gray-500 text-lg font-medium">กำลังโหลดความคิดเห็น...</p>
        ) : comments.length === 0 ? (
          <div className="bg-gray-200 px-6 py-3 rounded-lg shadow-md w-2/3 text-center mt-1">
            <p className="text-gray-500 text-lg font-medium">ยังไม่มีความคิดเห็น</p>
          </div>
        ) : (
          <div className="w-2/3 space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 border border-gray-300 rounded-lg flex items-start space-x-3 bg-white shadow-md w-full"
              >
                {/* รูปโปรไฟล์ */}
                <img
                  src={comment.user.profile_picture || "/default-avatar.png"}
                  className="w-12 h-12 rounded-full border border-gray-300"
                  alt={comment.user.username}
                />
                {/* ข้อมูลความคิดเห็น */}
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{comment.user.username}</p>
                  <p className="text-gray-700 text-base">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    🕒 {format(new Date(comment.createdAt), "d/M/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
