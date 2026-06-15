"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Poll, TimeSlot } from "@/lib/types";
import { formatDate, getSlotVoteCount, getVotersForSlot, getWinningSlot } from "@/lib/utils";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedWinner, setSelectedWinner] = useState<string>("");

  useEffect(() => {
    fetch(`/api/polls/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPoll(data);
        setLoading(false);
        if (data.winnerSlotId) setSelectedWinner(data.winnerSlotId);
        else if (data.timeSlots?.length) {
          const winner = getWinningSlot(data);
          if (winner) setSelectedWinner(winner.id);
        }
      });
  }, [id]);

  async function handleFinalize() {
    if (!selectedWinner) return;
    setFinalizing(true);
    setMessage("");
    try {
      const res = await fetch(`/api/polls/${id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerSlotId: selectedWinner }),
      });
      if (!res.ok) { const d = await res.json(); setMessage(d.error); return; }
      const updated = await res.json();
      setPoll(updated);
      setMessage("✅ 會議已確認排程！通知已發送給所有參與者。");
    } catch {
      setMessage("排程失敗，請重試");
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-16">載入中…</p>;
  if (!poll || (poll as { error?: string }).error) return <p className="text-center text-red-500 py-16">找不到此投票</p>;

  const sortedSlots = [...poll.timeSlots].sort(
    (a, b) => getSlotVoteCount(poll, b.id) - getSlotVoteCount(poll, a.id)
  );
  const maxVotes = sortedSlots.length ? getSlotVoteCount(poll, sortedSlots[0].id) : 0;
  const winnerSlot = poll.winnerSlotId ? poll.timeSlots.find((s) => s.id === poll.winnerSlotId) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{poll.title}</h1>
          <p className="text-sm text-gray-400 mt-1">主辦：{poll.organizerName} · {poll.votes.length} 人已投票</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {poll.status === "open" && (
            <a href={`/poll/${id}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
              去投票
            </a>
          )}
          <a href="/" className="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
            首頁
          </a>
        </div>
      </div>

      {/* Winner banner */}
      {winnerSlot && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">📌</span>
          <div>
            <p className="font-semibold text-green-800">會議已確認排程！</p>
            <p className="text-green-700 mt-0.5">
              {formatDate(winnerSlot.date)} {winnerSlot.startTime}–{winnerSlot.endTime}
              {poll.location && ` · 📍 ${poll.location}`}
            </p>
          </div>
        </div>
      )}

      {/* Vote results */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">投票統計</h2>
        {poll.votes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">尚無人投票</p>
        ) : (
          <div className="space-y-4">
            {sortedSlots.map((slot, i) => {
              const count = getSlotVoteCount(poll, slot.id);
              const voters = getVotersForSlot(poll, slot.id);
              const pct = maxVotes > 0 ? Math.round((count / maxVotes) * 100) : 0;
              const isTop = count === maxVotes && maxVotes > 0;
              const isWinner = poll.winnerSlotId === slot.id;

              return (
                <div key={slot.id} className={`p-4 rounded-xl border-2 transition ${
                  isWinner ? "border-green-400 bg-green-50" : isTop ? "border-blue-200 bg-blue-50" : "border-gray-100"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isWinner && <span className="text-green-600 font-bold text-sm">✓ 確認</span>}
                      {!isWinner && isTop && <span className="text-blue-600 font-bold text-sm">最高票</span>}
                      <span className="font-medium text-gray-800">{formatDate(slot.date)}</span>
                      <span className="text-gray-500 text-sm">{slot.startTime}–{slot.endTime}</span>
                    </div>
                    <span className={`font-bold text-lg ${isTop ? "text-blue-700" : "text-gray-500"}`}>
                      {count} 票
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${isWinner ? "bg-green-400" : isTop ? "bg-blue-500" : "bg-gray-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {voters.length > 0 && (
                    <p className="text-xs text-gray-500">{voters.join("、")}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Who voted */}
      {poll.votes.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">投票名單</h2>
          <div className="flex flex-wrap gap-2">
            {poll.votes.map((v) => (
              <span key={v.voterEmail} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
                <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
                  {v.voterName[0]}
                </span>
                {v.voterName}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Finalize meeting */}
      {poll.status === "open" && poll.votes.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">確認會議時間並發送通知</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">選擇確認的時段</label>
            <div className="space-y-2">
              {sortedSlots.map((slot) => {
                const count = getSlotVoteCount(poll, slot.id);
                return (
                  <label key={slot.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    selectedWinner === slot.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      name="winner"
                      value={slot.id}
                      checked={selectedWinner === slot.id}
                      onChange={() => setSelectedWinner(slot.id)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-800">{formatDate(slot.date)} {slot.startTime}–{slot.endTime}</span>
                    <span className="text-sm text-gray-400 ml-auto">{count} 票</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
            <strong>確認後將：</strong>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>關閉投票，鎖定選定時段</li>
              <li>發送 Email 通知給所有 {poll.votes.length} 位投票者</li>
              {poll.participants.length > 0 && <li>通知 {poll.participants.length} 位受邀者</li>}
              <li>建立 Google Calendar 行事曆邀請</li>
            </ul>
          </div>

          {message && (
            <p className={`text-sm mb-3 font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleFinalize}
            disabled={finalizing || !selectedWinner}
            className="w-full bg-green-600 text-white py-3 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {finalizing ? "排程中…" : "✅ 確認會議時間並發送通知"}
          </button>
        </section>
      )}
    </div>
  );
}
