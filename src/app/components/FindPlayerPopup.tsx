import React from "react";

interface FindPlayerPopupProps {
  onClose: () => void;
  onViewProfile: () => void;
  onInvitePlayer: (playerId: number) => void; // ✅ เพิ่มพารามิเตอร์
  playerId: number; // ✅ เพิ่ม playerId
}

const FindPlayerPopup: React.FC<FindPlayerPopupProps> = ({ onClose, onViewProfile, onInvitePlayer, playerId }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-64 rounded-lg shadow-lg">
        <div className="flex flex-col">
          <button onClick={onViewProfile} className="py-2 px-4 hover:bg-gray-100 text-center text-black border-b">
            ดูโปรไฟล์
          </button>
          
          <button
            onClick={() => onInvitePlayer(playerId)} // ✅ ส่ง playerId ไปที่ MyTeamList
            className="py-2 px-4 hover:bg-orange-100 text-center text-orange-500 border-b"
          >
            เชิญผู้เล่นเข้าทีม
          </button>

          <button onClick={onClose} className="py-2 px-4 hover:bg-red-100 text-center text-red-500">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindPlayerPopup;
