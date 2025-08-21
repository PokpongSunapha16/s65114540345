"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WriteComment() {
  const { teamName } = useParams() ?? {};
  const safeTeamName = Array.isArray(teamName) ? teamName[0] : teamName ?? ""; // ✅ แปลงให้เป็น string  
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ✅ ตรวจสอบว่า teamName โหลดครบหรือไม่
  useEffect(() => {
    if (teamName) setIsReady(true);
  }, [teamName]);

  if (!isReady) return <p className="text-center mt-10">⏳ กำลังโหลด...</p>;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("⚠ กรุณาเขียนความคิดเห็นก่อนส่ง");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      console.log("📤 Sending comment:", content); // ตรวจสอบค่าก่อนส่ง
  
      const response = await fetch(`/api/team_management/${encodeURIComponent(safeTeamName)}/comment_board/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: content }), // ✅ ต้องใช้ key "comment"
      });
  
      const data = await response.json();
      console.log("✅ API Response:", data); // ดูผลลัพธ์จาก API
  
      if (response.ok) {
        setSuccess(true);
        setContent(""); // ✅ เคลียร์ช่องข้อความหลังจากโพสต์สำเร็จ
        setTimeout(() => {
          setSuccess(false);
          router.push(`/team_management/${safeTeamName}/comment_board`);
        }, 1500);
      } else {
        setError(data.error || "❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (err) {
      console.error("❌ Error sending comment:", err);
      setError("❌ เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <h1 className="text-2xl font-bold mb-6 mt-10">📝 เขียนความคิดเห็น</h1>

      <div className="w-2/3 bg-white p-6 rounded-lg shadow-md border border-gray-300">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="💬 พิมพ์ความคิดเห็นของคุณ..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring focus:ring-orange-300"
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">✅ โพสต์ความคิดเห็นสำเร็จ!</p>}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {loading ? "⏳ กำลังส่ง..." : "📩 ส่งความคิดเห็น"}
          </button>
        </div>
      </div>
    </div>
  );
}
