"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dialog } from "@headlessui/react";

export default function LeaveTeamButton() {
  const router = useRouter();
  const { teamName } = useParams();
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false); // 🔄 เพิ่ม state ป้องกันการกดซ้ำ

  const handleLeaveTeam = async () => {
    if (isLeaving) return; // ถ้ากำลังออกจากทีมอยู่ ให้ return ทันที
    setIsLeaving(true);

    try {
      const response = await fetch(`/api/team_management/${encodeURIComponent(teamName as string)}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to leave team");

      setShowLeavePopup(false); // ✅ ปิด Popup หลังจากออกจากทีม
      router.push("/team_management"); // ✅ Redirect ทันทีโดยไม่มีแจ้งเตือน
    } catch (error) {
      console.error("Error leaving team:", error);
    } finally {
      setIsLeaving(false); // ✅ ปลดล็อกปุ่มให้กดได้อีกครั้งถ้าเกิด error
    }
  };

  return (
    <>
      <button
        onClick={() => setShowLeavePopup(true)}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white p-2 rounded-full shadow-md"
        disabled={isLeaving} // ❌ ปิดปุ่มขณะกำลังออกจากทีม
      >
        ❌ ออกจากทีม
      </button>

      {/* Popup ยืนยันออกจากทีม */}
      <Dialog open={showLeavePopup} onClose={() => setShowLeavePopup(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-bold">ต้องการออกจากทีม?</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-700">
              หากคุณออกจากทีม คุณจะไม่สามารถเข้าถึงข้อมูลทีมนี้ได้อีก
            </Dialog.Description>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowLeavePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isLeaving}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLeaveTeam}
                className={`px-4 py-2 text-white rounded ${isLeaving ? "bg-gray-500" : "bg-red-600 hover:bg-red-800"}`}
                disabled={isLeaving} // ❌ ปิดปุ่มขณะกำลังออกจากทีม
              >
                {isLeaving ? "กำลังออก..." : "ยืนยัน"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
