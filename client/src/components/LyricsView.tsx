import { useEffect, useRef } from "react";
import type { LyricLine } from "../lib/lrc";

export default function LyricsView({
  lines,
  activeIndex,
}: {
  lines: LyricLine[];
  activeIndex: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  if (lines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        沒有歌詞
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-10 space-y-5 text-center scroll-smooth [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
    >
      {lines.map((l, i) => (
        <p
          key={i}
          ref={i === activeIndex ? activeRef : undefined}
          className={`transition-all duration-300 ${
            i === activeIndex
              ? "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300 scale-105"
              : "text-lg text-white/35"
          }`}
        >
          {l.text}
        </p>
      ))}
    </div>
  );
}
