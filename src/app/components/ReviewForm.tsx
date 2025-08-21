"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface ReviewFormProps {
  userId: number;
  onReviewSubmit: () => void;
}

export default function ReviewForm({ userId, onReviewSubmit }: ReviewFormProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed_user_id: userId, score, comment }),
    });

    onReviewSubmit();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 max-w-lg w-full">
      <h2 className="font-bold text-lg mb-2">ให้คะแนน</h2>

      {/* ขยายขนาดดาวให้ใหญ่ขึ้น และเพิ่มระยะห่าง */}
      <div className="flex space-x-3 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <FaStar
            key={i}
            onClick={() => setScore(i)}
            className={`text-4xl cursor-pointer transition-all duration-200 ${
              i <= score ? "text-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {/* กล่องคอมเมนต์ */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border p-3 w-full rounded-md h-32"
        placeholder="เขียนรีวิวที่นี่..."
      />

      {/* ปุ่มส่งรีวิว */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-5 py-2 mt-4 rounded-md w-full hover:bg-blue-600 transition"
      >
        ส่งรีวิว
      </button>
    </div>
  );
}
