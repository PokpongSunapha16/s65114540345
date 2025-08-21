import React, { useEffect, useState } from "react";

interface Team {
  id: number;
  name: string;
  member_count: number;
  type: "THREE_X_THREE" | "FIVE_X_FIVE";
  members: { userId: number }[]; // ✅ เพิ่มรายการสมาชิกในทีม
}

interface MyTeamListProps {
  onClose: () => void;
  onSelectTeam: (teamId: number) => void;
  selectedPlayerId: number;
}

const MyTeamList: React.FC<MyTeamListProps> = ({ onClose, onSelectTeam, selectedPlayerId }) => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/myteams");
        if (!response.ok) throw new Error("Failed to fetch teams");

        const data = await response.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const handleInvite = async (team: Team) => {
    if (!selectedPlayerId) {
      console.error("❌ selectedPlayerId is missing!");
      alert("เกิดข้อผิดพลาด: ไม่พบผู้เล่นที่ต้องการเชิญ");
      return;
    }
  
    // ✅ ตรวจสอบว่า `team.members` เป็นอาร์เรย์ ถ้าไม่ใช่ให้กำหนดเป็น `[]`
    const teamMembers = team.members ?? [];
  
    // ✅ ตรวจสอบว่าทีมเต็มหรือไม่
    const maxMembers = team.type === "THREE_X_THREE" ? 3 : 5;
    if (team.member_count >= maxMembers) {
      alert(`❌ ทีม "${team.name}" มีสมาชิกครบแล้ว!`);
      return;
    }
  
    // ✅ ตรวจสอบว่าผู้เล่นอยู่ในทีมแล้วหรือไม่
    const isAlreadyInTeam = teamMembers.some((member) => member.userId === selectedPlayerId);
    if (isAlreadyInTeam) {
      alert(`❌ ผู้เล่นคนนี้อยู่ในทีม "${team.name}" แล้ว!`);
      return;
    }
  
    console.log("📌 กำลังส่งคำเชิญ:", { teamId: team.id, receiverId: selectedPlayerId });
  
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId: team.id, receiverId: selectedPlayerId }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to send invite");
      }
  
      alert("✅ คำเชิญถูกส่งเรียบร้อยแล้ว!");
      onClose();
    } catch (error) {
      console.error("❌ Error sending invite:", error);
      
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("❌ เกิดข้อผิดพลาดในการส่งคำเชิญ");
      }
    }
  };  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-80 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-bold mb-4">เลือกทีมที่จะเชิญ</h2>
        <ul>
          {teams.map((team) => {
            const maxMembers = team.type === "THREE_X_THREE" ? 3 : 5;
            const isFull = team.member_count >= maxMembers;

            return (
              <li
                key={team.id}
                className={`p-2 rounded cursor-pointer ${
                  isFull ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
                onClick={() => !isFull && handleInvite(team)}
              >
                {team.name}
              </li>
            );
          })}
        </ul>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white py-1 px-3 rounded">
          ยกเลิก
        </button>
      </div>
    </div>
  );
};

export default MyTeamList;
