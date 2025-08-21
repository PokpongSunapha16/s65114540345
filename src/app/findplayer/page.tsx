"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FindPlayerPopup from "../components/FindPlayerPopup"; 
import MyTeamList from "../components/MyTeamList"; // ✅ Import MyTeamList


interface Player {
  id: number;
  username: string;
  profile_picture: string | null;
  district: string;
  position: string;
  status: string;
}

const FindPlayerPage = () => {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(""); // อำเภอที่เลือก
  const [searchQuery, setSearchQuery] = useState<string>(""); // ข้อความค้นหา
  const [noResults, setNoResults] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // สถานะเปิดป๊อปอัพ
  const [isMyTeamListOpen, setIsMyTeamListOpen] = useState(false); // ✅ เพิ่ม state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null); // ผู้เล่นที่เลือก

  const fetchPlayers = async (district: string, query: string) => {
    try {
      console.log("Fetching with:", {
        district,
        query,
        userId: 1,
      }); // Log คำขอที่ส่งไป

      const response = await fetch(
        `/api/findplayer?district=${district}&query=${query}&userId=1`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Response from API:", data); // Log คำตอบจาก API
      setPlayers(data.players || []);
      setNoResults(data.players.length === 0);
    } catch (error) {
      console.error("Failed to fetch players:", error);
      setPlayers([]);
      setNoResults(true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setPlayers([]);
      setNoResults(false);
      return;
    }
    fetchPlayers(selectedDistrict, searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const districtMap: Record<string, string> = {
    "MUEANG": "เมืองอุบลราชธานี",
    "SI_MUEANG_MAI": "ศรีเมืองใหม่",
    "KHONG_CHIAM": "โขงเจียม",
    "KHUEANG_NAI": "เขื่องใน",
    "KHEMMARAT": "เขมราฐ",
    "DET": "เดชอุดม",
    "NA_CHALUAI": "นาจะหลวย",
    "NAM_YUEN": "น้ำยืน",
    "BUNTHARIK": "บุณฑริก",
    "TRAKAN": "ตระการพืชผล",
    "KUT_KHAOPUN": "กุดข้าวปุ้น",
    "MUANG_SAM_SIP": "ม่วงสามสิบ",
    "WARIN": "วารินชำราบ",
    "PHIBUN": "พิบูลมังสาหาร",
    "TAN_SUM": "ตาลสุม",
    "PHO_SAI": "โพธิ์ไทร",
    "SAMRONG": "สำโรง",
    "DON_MOT_DAENG": "ดอนมดแดง",
    "SIRINDHORN": "สิรินธร",
    "THUNG_SI_UDOM": "ทุ่งศรีอุดม",
    "SI_LAK_CHAI": "ศรีหลักชัย",
    "NAM_KHUN": "น้ำขุ่น",
    "LAO_SUEA_KOK": "เหล่าเสือโก้ก",
    "SAWANG_WIRAWONG": "สว่างวีระวงศ์",
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);

    if (district === "") {
      setPlayers([]);
      setNoResults(false);
    } else {
      fetchPlayers(district, "");
    }
  };

  const handleOpenPopup = (player: Player) => {
    setSelectedPlayer(player);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlayer(null);
  };

  const handleOpenMyTeamList = () => {
    setIsPopupOpen(false); // ✅ ปิด FindPlayerPopup
    setIsMyTeamListOpen(true); // ✅ เปิด MyTeamList Popup
  };

  const handleCloseMyTeamList = () => {
    setIsMyTeamListOpen(false); // ✅ ปิด MyTeamList Popup
  };

  const handleViewProfile = (playerId: number) => {
    router.push(`/user/${playerId}`); // นำทางไปยังหน้าโปรไฟล์ของผู้เล่น
  };

  const handleInvitePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const response = await fetch(`/api/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId: selectedPlayer.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      const data = await response.json();
      alert(`Invitation sent to ${selectedPlayer.username}`);
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invitation. Please try again later.");
    } finally {
      handleClosePopup();
    }
  };

  return (
    <div className="relative p-6 min-h-screen bg-gray-50">

      <h1 className="text-2xl font-bold text-center mb-6">ค้นหาผู้เล่น</h1>

      <div className="flex justify-between items-center bg-black py-2 px-4 rounded-lg shadow-md mb-6 w-2/3 mx-auto">
      <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="px-2 py-1 text-black border border-gray-300 rounded-md focus:ring focus:ring-orange-300 bg-white w-1/5"
        >
          <option value="">เลือกอำเภอ</option>
          <option value="MUEANG">เมืองอุบลราชธานี</option>
          <option value="SI_MUEANG_MAI">ศรีเมืองใหม่</option>
          <option value="KHONG_CHIAM">โขงเจียม</option>
          <option value="KHUEANG_NAI">เขื่องใน</option>
          <option value="KHEMMARAT">เขมราฐ</option>
          <option value="DET">เดชอุดม</option>
          <option value="NA_CHALUAI">นาจะหลวย</option>
          <option value="NAM_YUEN">น้ำยืน</option>
          <option value="BUNTHARIK">บุณฑริก</option>
          <option value="TRAKAN">ตระการพืชผล</option>
          <option value="KUT_KHAOPUN">กุดข้าวปุ้น</option>
          <option value="MUANG_SAM_SIP">ม่วงสามสิบ</option>
          <option value="WARIN">วารินชำราบ</option>
          <option value="PHIBUN">พิบูลมังสาหาร</option>
          <option value="TAN_SUM">ตาลสุม</option>
          <option value="PHO_SAI">โพธิ์ไทร</option>
          <option value="SAMRONG">สำโรง</option>
          <option value="DON_MOT_DAENG">ดอนมดแดง</option>
          <option value="SIRINDHORN">สิรินธร</option>
          <option value="THUNG_SI_UDOM">ทุ่งศรีอุดม</option>
          <option value="SI_LAK_CHAI">ศรีหลักชัย</option>
          <option value="NAM_KHUN">น้ำขุ่น</option>
          <option value="LAO_SUEA_KOK">เหล่าเสือโก้ก</option>
          <option value="SAWANG_WIRAWONG">สว่างวีระวงศ์</option>
        </select>

        <div className="relative w-3/4">
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้เล่น ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 w-full border border-gray-300 rounded-md focus:ring focus:ring-orange-300"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white px-3 py-1 rounded-md hover:bg-orange-600"
          >
            🔍
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center">
        {players.length > 0 ? (
          <div className="flex flex-col items-center w-2/3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center p-4 border rounded-lg shadow-md bg-white w-full mb-4 cursor-pointer"
                onClick={() => handleOpenPopup(player)}
              >
                <img
                  src={player.profile_picture || "/default-profile.png"}
                  alt={player.username}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{player.username}</h2>
                  <p className="text-sm text-gray-500">อำเภอ: {districtMap[player.district]}</p>
                  <p className="text-sm text-gray-500">ตำแหน่ง: {player.position}</p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    player.status === "ACTIVE"
                      ? "text-green-500"
                      : player.status === "OFFLINE"
                      ? "text-gray-500"
                      : ""
                  }`}
                >
                  {player.status === "ACTIVE"
                    ? "ออนไลน์"
                    : player.status === "OFFLINE"
                    ? "ออฟไลน์"
                    : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <p className="text-gray-500 text-lg font-bold">
              {noResults
                ? "ไม่พบผู้เล่นในอำเภอนี้"
                : "เลือกอำเภอหรือพิมพ์เพื่อค้นหา"}
            </p>
          </div>
        )}
      </div>

      {/* ✅ ส่ง playerId ไปที่ FindPlayerPopup */}
      {isPopupOpen && selectedPlayer && (
        <FindPlayerPopup
          onClose={handleClosePopup}
          onViewProfile={() => handleViewProfile(selectedPlayer.id)}
          onInvitePlayer={handleOpenMyTeamList}
          playerId={selectedPlayer.id}
        />
      )}

      {isMyTeamListOpen && selectedPlayer && (
        <MyTeamList
        onClose={handleCloseMyTeamList} // ✅ ใช้ฟังก์ชันที่ถูกต้อง
        onSelectTeam={handleInvitePlayer}
        selectedPlayerId={selectedPlayer.id}
        />
      )}
    </div>
  );
};

export default FindPlayerPage;
