"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { randomUUID } from "crypto";
import { TimeSlot } from "@/lib/types";

function newSlot(): TimeSlot {
  const today = new Date().toISOString().split("T")[0];
  return { id: Math.random().toString(36).slice(2), date: today, startTime: "09:00", endTime: "10:00" };
}

export default function CreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState(60);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([newSlot()]);
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  function addSlot() {
    setTimeSlots((prev) => [...prev, newSlot()]);
  }

  function removeSlot(id: string) {
    setTimeSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: string, field: keyof TimeSlot, value: string) {
    setTimeSlots((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function addParticipant() {
    const email = participantInput.trim().toLowerCase();
    if (!email || participants.includes(email)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("請輸入有效的 Email"); return; }
    setParticipants((p) => [...p, email]);
    setParticipantInput("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!timeSlots.length) { setError("至少需要一個時段"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, organizerName, organizerEmail, location, duration, timeSlots, participants }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const poll = await res.json();
      router.push(`/poll/${poll.id}`);
    } catch {
      setError("建立失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">建立會議時間投票</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">會議基本資訊</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">會議標題 *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="例：Q2 季度規劃會議"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="會議目的或備註"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地點</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例：會議室 A / Google Meet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">會議時長（分鐘）</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              >
                {[30, 45, 60, 90, 120, 180].map((m) => (
                  <option key={m} value={m}>{m} 分鐘</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主辦人姓名 *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required placeholder="你的名字"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主辦人 Email *</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} required placeholder="your@email.com"
              />
            </div>
          </div>
        </section>

        {/* Time Slots */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">候選時段</h2>
            <button type="button" onClick={addSlot} className="text-blue-600 text-sm font-medium hover:underline">
              + 新增時段
            </button>
          </div>
          {timeSlots.map((slot, i) => (
            <div key={slot.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 w-5 shrink-0 text-center">{i + 1}</span>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={slot.date} onChange={(e) => updateSlot(slot.id, "date", e.target.value)}
              />
              <input
                type="time"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={slot.startTime} onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="time"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={slot.endTime} onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
              />
              {timeSlots.length > 1 && (
                <button type="button" onClick={() => removeSlot(slot.id)} className="text-red-400 hover:text-red-600 ml-auto text-lg leading-none">
                  ×
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Participants */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">邀請參與者（選填）</h2>
          <div className="flex gap-2">
            <input
              type="email"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addParticipant())}
              placeholder="輸入 Email 後按 Enter 或點新增"
            />
            <button type="button" onClick={addParticipant} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              新增
            </button>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participants.map((email) => (
                <span key={email} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {email}
                  <button type="button" onClick={() => setParticipants((p) => p.filter((x) => x !== email))} className="text-blue-400 hover:text-blue-700 ml-1">×</button>
                </span>
              ))}
            </div>
          )}
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? "建立中…" : "建立投票"}
        </button>
      </form>
    </div>
  );
}
