"use client";

import { useEffect, useState } from "react";
import { Poll } from "@/lib/types";
import { formatDate, getWinningSlot, getSlotVoteCount } from "@/lib/utils";

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data) => { setPolls(data); setLoading(false); });
  }, []);

  if (loading) return <p className="text-center text-gray-500 py-16">載入中…</p>;

  if (!polls.length) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">📅</p>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">尚無任何投票</h2>
        <p className="text-gray-500 mb-6">建立第一個會議時間投票，邀請大家選填可以的時段！</p>
        <a href="/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition">
          建立投票
        </a>
      </div>
    );
  }

  const statusLabel: Record<Poll["status"], string> = {
    open: "投票中",
    closed: "已關閉",
    scheduled: "已排程",
  };
  const statusColor: Record<Poll["status"], string> = {
    open: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    scheduled: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">所有投票</h1>
      <div className="grid gap-4">
        {polls.map((poll) => {
          const winner = getWinningSlot(poll);
          const topVotes = winner ? getSlotVoteCount(poll, winner.id) : 0;
          return (
            <div key={poll.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[poll.status]}`}>
                      {statusLabel[poll.status]}
                    </span>
                    <span className="text-xs text-gray-400">by {poll.organizerName}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 truncate">{poll.title}</h2>
                  {poll.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{poll.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span>{poll.timeSlots.length} 個時段</span>
                    <span>{poll.votes.length} 人已投票</span>
                    {topVotes > 0 && (
                      <span className="text-blue-600 font-medium">最高票 {topVotes} 票</span>
                    )}
                    {winner && (
                      <span className="text-gray-400">{formatDate(winner.date)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={`/poll/${poll.id}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition text-center">
                    {poll.status === "open" ? "去投票" : "查看結果"}
                  </a>
                  <a href={`/poll/${poll.id}/results`} className="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-50 transition text-center">
                    結果統計
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
