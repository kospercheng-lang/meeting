import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "會議時間投票",
  description: "提出時段、投票、排程會議",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-600 text-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">📅 會議時間投票</a>
            <a href="/create" className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition">
              + 建立投票
            </a>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
