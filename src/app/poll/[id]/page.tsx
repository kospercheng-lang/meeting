"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Poll } from "@/lib/types";
import { formatDate, formatSlotLabel } from "@/lib/utils";

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetch(`/api/polls/${id}`)
      .then((r) => r.json())
      .then((data) => { setPoll(data); setLoading(false); });
  }, [id]);

  function toggleSlot(slotId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slotId) ? next.delete(slotId) : next.add(slotId);
      return next;
    });
  }

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    if (!selected.size) { setError("請至少選擇一個時段"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterName, voterEmail, selectedSlotIds: [...selected] }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const updated = await res.json();
      setPoll(updated);
      setVoted(true);
    } catch {
      setError("投票失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-center text-gray-500 py-16">載入中…</p>;
  if (!poll || (poll as { error?: string }).error) return <p className="text-center text-red-500 py-16">找不到此投票</p>;

  if (voted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">投票成功！</h2>
        <p className="text-gray-500 mb-6">感謝 {voterName} 的填寫。</p>
        <div className="flex gap-3 justify-center">
          <a href={`/poll/${id}/results`} className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
            查看統計結果
          </a>
          <a href="/" className="border border-gray-200 text-gray-600 px-5 py-2 rounded-full font-semibold hover:bg-gray-50 transition">
            回首頁
          </a>
        </div>
      </div>
    );
  }

  if (poll.status !== "open") {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-5xl mb-4">{poll.status === "scheduled" ? "📌" : "🔒"}</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {poll.status === "scheduled" ? "會議已排程！" : "投票已關閉"}
        </h2>
        <a href={`/poll/${id}/results`} className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
          查看結果
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{poll.title}</h1>
        {poll.description && <p className="text-gray-500 mt-1">{poll.description}</p>}
        <div className="flex gap-4 mt-2 text-sm text-gray-400">
          {poll.location && <span>📍 {poll.location}</span>}
          <span>⏱ {poll.duration} 分鐘</span>
          <span>👤 主辦：{poll.organizerName}</span>
        </div>
      </div>

      <form onSubmit={handleVote} className="space-y-5">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">你的資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={voterName} onChange={(e) => setVoterName(e.target.value)} required placeholder="你的名字"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={voterEmail} onChange={(e) => setVoterEmail(e.target.value)} required placeholder="your@email.com"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            選擇你可以的時段 <span className="text-gray-400 font-normal">（可多選）</span>
          </h2>
          {poll.timeSlots.map((slot) => {
            const isSelected = selected.has(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleSlot(slot.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}>
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{formatDate(slot.date)}</p>
                  <p className="text-sm text-gray-500">{slot.startTime} – {slot.endTime}</p>
                </div>
              </button>
            );
          })}
          {selected.size > 0 && (
            <p className="text-sm text-blue-600 font-medium">已選 {selected.size} 個時段</p>
          )}
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "提交中…" : "提交投票"}
          </button>
          <a href={`/poll/${id}/results`} className="border border-gray-200 text-gray-600 px-5 py-3 rounded-full font-semibold hover:bg-gray-50 transition text-center">
            查看結果
          </a>
        </div>
      </form>

      {poll.votes.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-400">已有 {poll.votes.length} 人投票</div>
      )}
    </div>
  );
}
