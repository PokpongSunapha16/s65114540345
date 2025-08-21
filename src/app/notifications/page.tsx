"use client";

import { useEffect, useState } from "react";

interface Notification {
  id: number;
  sender: { username: string };
  team?: { name: string; id?: number };
  teamId?: number;
  type: "TEAM_INVITE" | "GAME_INVITE" | "MESSAGE" | "TEAM_REQUEST";
  status: "UNREAD" | "READ" | "ACTIONED";
  createdAt: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        console.log("📌 Loaded Notifications:", data.notifications);
        setNotifications(data.notifications);
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const handleAcceptInvite = async (notif: Notification) => {
    try {
      const teamId = notif.team?.id || notif.teamId;

      if (!notif.id || !teamId) {
        console.error("❌ Missing required fields", { notif });
        alert("เกิดข้อผิดพลาด: ข้อมูลไม่ครบถ้วน (teamId อาจหายไป)");
        return;
      }

      console.log("📤 Sending Accept Request:", {
        notificationId: notif.id,
        teamId: teamId,
      });

      const response = await fetch("/api/notifications/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id, teamId: teamId }),
      });

      const result = await response.json();
      console.log("📥 Server Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept invite");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      alert("✅ การดำเนินการสำเร็จ!");
    } catch (error) {
      console.error("❌ Error accepting invite:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDeclineInvite = async (notif: Notification) => {
    try {
      console.log("📤 Declining Invite for:", { notificationId: notif.id });

      const response = await fetch("/api/notifications/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id }),
      });

      const result = await response.json();
      console.log("📥 Decline Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to decline invite");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      alert("❌ ปฏิเสธคำขอสำเร็จ");
    } catch (error) {
      console.error("❌ Error declining invite:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-6">🔔 การแจ้งเตือน</h1>

      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลด...</p>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-500">ไม่มีการแจ้งเตือน</p>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-md">
          {notifications.map((notif) => (
            <div key={notif.id} className="border-b py-3">
              <p className="text-lg font-semibold">
              {notif.type === "TEAM_REQUEST"
                ? `${notif.sender.username} ส่งคำขอเข้าร่วมทีม`
                : `${notif.sender.username} ได้ส่งคำเชิญ`}
              </p>
              {notif.team && <p className="text-gray-600">ทีม: {notif.team.name}</p>}
              <p className="text-sm text-gray-400">{new Date(notif.createdAt).toLocaleString()}</p>

              {notif.type === "TEAM_INVITE" || notif.type === "TEAM_REQUEST" ? (
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => handleAcceptInvite(notif)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ยอมรับ
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(notif)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ปฏิเสธ
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;