"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateTeamPage = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [teamType, setTeamType] = useState("THREE_X_THREE");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [district, setDistrict] = useState("NONE");
  const [court, setCourt] = useState("");
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setTeamLogo(reader.result as string);
        setPreviewLogo(reader.result as string);
      };
    }
  };

  const handleSubmit = async () => {
    const data = {
      name: teamName,
      privacy,
      type: teamType,
      start_at: startTime,
      end_at: endTime,
      district,
      court,
      team_logo: teamLogo,
      description,
    };
  

    const res = await fetch("/api/team_management/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/team_management");
    } else {
      console.error("Failed to create team");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">สร้างทีม</h1>

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-4">
          <label htmlFor="team_logo" className="cursor-pointer">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
              {previewLogo ? (
                <img src={previewLogo} alt="Team Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500">📷</span>
              )}
            </div>
          </label>
          <input type="file" id="team_logo" className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>

        <input
          type="text"
          placeholder="ชื่อทีม"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <select
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="PUBLIC">สาธารณะ</option>
          <option value="PRIVATE">ส่วนตัว</option>
        </select>

        <select
          value={teamType}
          onChange={(e) => setTeamType(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="THREE_X_THREE">3X3</option>
          <option value="FIVE_X_FIVE">5X5</option>
        </select>

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full border p-2 rounded mb-4"
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

        <input
          type="text"
          placeholder="สนามบาสเกตบอล"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <textarea
          placeholder="รายละเอียดทีม"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        ></textarea>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
};

export default CreateTeamPage;
