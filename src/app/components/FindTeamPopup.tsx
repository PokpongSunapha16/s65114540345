import React, { useState } from "react";

interface Team {
  id: number;
  name: string;
  team_logo: string | null;
  court: string;
  start_at: string;
  end_at: string;
  privacy: string;
  type: string;
  district: string;
  member_count: number;
}

interface FindTeamPopupProps {
  team: Team;
  onClose: () => void;
  onViewTeam: (team: Team) => void;
}

const FindTeamPopup: React.FC<FindTeamPopupProps> = ({ team, onClose, onViewTeam }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleJoinTeam = async () => {
    try {
      setIsJoining(true);
      const response = await fetch(`/api/team_management/${encodeURIComponent(team.name)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join team");
      }

      alert(result.message);
      window.location.reload();
    } catch (error) {
      alert((error as Error).message ?? "เกิดข้อผิดพลาด!");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRequestToJoin = async () => {
    try {
      setIsRequesting(true);
      const response = await fetch("/api/team_management/request-to-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: team.name }),
        credentials: "include",
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to send join request");
      }
  
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert((error as Error).message ?? "เกิดข้อผิดพลาด!");
    } finally {
      setIsRequesting(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-80">
        <div className="text-center p-4">
          <h2 className="text-lg font-bold">{team.name}</h2>
        </div>

        <div className="border-t border-gray-300">
          <button
            onClick={() => onViewTeam(team)}
            className="w-full text-center py-3 hover:bg-gray-100 font-semibold"
          >
            ดูรายละเอียดทีม
          </button>
        </div>

        {team.privacy === "PUBLIC" && (
          <div className="border-t border-gray-300">
            <button
              onClick={handleJoinTeam}
              className="w-full text-center py-3 text-orange-500 font-semibold hover:bg-gray-100"
              disabled={team.member_count >= (team.type === "THREE_X_THREE" ? 3 : 5)}
            >
              {isJoining ? "กำลังเข้าร่วม..." : "เข้าร่วมทีม"}
            </button>
          </div>
        )}

        {team.privacy === "PRIVATE" && (
          <div className="border-t border-gray-300">
            <button
              onClick={handleRequestToJoin}
              className="w-full text-center py-3 text-blue-500 font-semibold hover:bg-gray-100"
              disabled={team.member_count >= (team.type === "THREE_X_THREE" ? 3 : 5)}
            >
              {isRequesting ? "กำลังส่งคำขอ..." : "ส่งคำขอเข้าร่วมทีม"}
            </button>
          </div>
        )}

        <div className="border-t border-gray-300">
          <button
            onClick={onClose}
            className="w-full text-center py-3 text-red-500 font-semibold hover:bg-gray-100"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindTeamPopup;
