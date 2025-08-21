import React from "react";

interface Team {
  id: number;
  name: string;
  description: string | null; // ✅ เพิ่ม description
}

interface TeamDetailPopupProps {
  team: Team;
  onClose: () => void;
}

const TeamDetailPopup: React.FC<TeamDetailPopupProps> = ({ team, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-4">
        <h2 className="text-lg font-bold">รายละเอียดทีม</h2>
        <p className="mt-2 text-gray-600">{team.description || "ไม่มีรายละเอียด"}</p> {/* ✅ แสดง description */}
        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 text-black px-4 py-2 rounded-md"
        >
          ปิด
        </button>
      </div>
    </div>
  );
};

export default TeamDetailPopup;
