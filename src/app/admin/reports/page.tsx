"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  reason: string;
  details: string;
  createdAt: string;
  blog: { title: string; slug: string };
  user: { username: string };
}

const reportReasons: { [key: string]: string } = {
  RUDE: "เจตนาที่หยาบคาย และ ไม่มีมารยาท",
  SEXUAL: "มีเนื้อหาทางเพศที่ชัดเจน",
  VIOLENT: "การแสดงถึงความรุนแรง",
  THREATEN: "เป็นการข่มขู่",
};

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/admin/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        setError("Error loading reports");
        console.error(err);
      }
    }
    fetchReports();
  }, []);

  const handleDelete = async (reportId: number) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) throw new Error("Failed to delete report");
      setReports(reports.filter((report) => report.id !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">🚨 จัดการรายงานบล็อก</h1>
      {error && <p className="text-red-500">{error}</p>}

      {reports.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-6">ไม่มีรายงานปัญหาบล็อกในตอนนี้</p>
      ) : (
        <ul className="mt-4">
          {reports.map((report) => (
            <li key={report.id} className="border p-4 my-2">
              <p>
                <strong>เหตุผล:</strong> {reportReasons[report.reason] || "ไม่ระบุ"}
              </p>
              <p><strong>รายละเอียด:</strong> {report.details}</p>
              <p><strong>บล็อก:</strong> {report.blog?.title || "ไม่พบข้อมูล"}</p>
              <p><strong>รายงาน โดย:</strong> {report.user?.username || "Anonymous"}</p>

              {/* ✅ ปุ่มตรวจสอบ */}
              <button
                onClick={() => router.push(`/blog/show/${report.blog.slug}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2 mr-2"
              >
                🔍 ตรวจสอบ
              </button>

              {/* ✅ ปุ่มลบบล็อก */}
              <button
                onClick={() => handleDelete(report.id)}
                className="bg-red-500 text-white px-4 py-2 rounded mt-2"
              >
                🗑️ ลบรายงาน
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
