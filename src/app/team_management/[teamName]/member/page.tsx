"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dialog } from "@headlessui/react";

interface Member {
  id: number;
  username: string;
  profile_picture: string | null;
  role: string;
}

interface Team {
  name: string;
  type: string;
  members: Member[];
}

export default function TeamMembersPage() {
  const router = useRouter();
  const { teamName } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isKickConfirmOpen, setIsKickConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [teamName]);

  const fetchTeamData = async () => {
    try {
      if (!teamName) return;
      const decodedTeamName = decodeURIComponent(teamName as string);

      const res = await fetch(`/api/team_management/${encodeURIComponent(decodedTeamName)}/member`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch team members");

      const data = await res.json();
      setTeam(data.team);

      // ✅ ตรวจสอบ role ของ currentUser
      const currentUser = data.team.members.find((m: Member) => m.id === data.currentUserId);
      setCurrentUserRole(currentUser?.role || null);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKickMember = async (teamName: string, userId: number) => {
    try {
      if (!teamName || !userId) {
        throw new Error("Missing required parameters.");
      }
  
      setIsKicking(true); // ✅ แสดงสถานะกำลังเตะผู้เล่น
      const cleanedTeamName = encodeURIComponent(teamName);
      const response = await fetch(`/api/team_management/${cleanedTeamName}/member/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove member");
      }
  
      alert("สมาชิกถูกเตะออกจากทีมเรียบร้อย");
      window.location.reload();
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + (error as Error).message);
    } finally {
      setIsKicking(false); // ✅ ซ่อนสถานะหลังจากดำเนินการเสร็จ
    }
  };  
  

  if (isLoading) {
    return <p className="text-center text-gray-500">กำลังโหลด...</p>;
  }

  if (!team) {
    return <p className="text-center text-red-500">ไม่พบข้อมูลทีม</p>;
  }

  // ✅ กำหนดจำนวนผู้เล่นสูงสุดตามประเภททีม
  const maxPlayers = team.type === "THREE_X_THREE" ? 3 : 5;
  const emptySlots = maxPlayers - team.members.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 relative">

      <h1 className="text-2xl font-bold mb-6 mt-10">สมาชิกทีม</h1>

      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        {team.members.map((member) => (
          <div key={member.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-3">
            <div className="flex items-center">
              <img
                src={member.profile_picture || "/default-avatar.png"}
                alt={member.username}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-bold">{member.username}</p>
                <p className="text-sm text-gray-500">🏀 {member.role}</p>
              </div>
            </div>

            {/* ✅ แสดงปุ่ม "เตะออก" เฉพาะ Player และต้องเป็น Captain เท่านั้นที่เห็นปุ่มนี้ */}
            {currentUserRole === "CAPTAIN" && member.role === "PLAYER" && (
              <button
                onClick={() => {
                  setSelectedUser({ id: member.id, name: member.username });
                  setIsKickConfirmOpen(true);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                ❌ เตะออก
              </button>
            )}
          </div>
        ))}

        {/* ช่องว่างสำหรับสมาชิกที่ยังไม่ได้เข้าร่วม */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={index} className="w-full bg-gray-200 p-4 rounded-lg text-center font-bold text-gray-500 mb-3">
            ว่างเปล่า
          </div>
        ))}
      </div>

      {/* ✅ Popup ยืนยันการเตะออก */}
      <Dialog open={isKickConfirmOpen} onClose={() => setIsKickConfirmOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-bold">ยืนยันการเตะสมาชิก</Dialog.Title>
            <Dialog.Description className="mt-2 text-gray-700">
              คุณต้องการเตะ <span className="font-bold">{selectedUser?.name}</span> ออกจากทีมใช่หรือไม่?
            </Dialog.Description>

            <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => {
                if (team?.name && selectedUser?.id) {
                  handleKickMember(team.name, selectedUser.id);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={isKicking}
            >
              {isKicking ? "กำลังดำเนินการ..." : "ยืนยัน"}
            </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
