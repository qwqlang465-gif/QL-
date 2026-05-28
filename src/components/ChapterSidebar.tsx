import { X } from "lucide-react";
import type { Chapter } from "../types/book";
import { IconButton } from "./IconButton";

interface ChapterSidebarProps {
  open: boolean;
  chapters: Chapter[];
  currentChapterIndex: number;
  onSelectChapter: (chapterIndex: number) => void;
  onClose: () => void;
}

export function ChapterSidebar({
  open,
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onClose,
}: ChapterSidebarProps) {
  return (
    <div className={open ? "fixed inset-0 z-40" : "pointer-events-none fixed inset-0 z-40"}>
      <button
        type="button"
        aria-label="关闭目录"
        className={[
          "absolute inset-0 bg-black/30 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "reader-panel absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col border-r transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--reader-line)] px-4 pt-[env(safe-area-inset-top)]">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold">章节目录</div>
            <div className="reader-muted mt-0.5 text-xs">{chapters.length} 章</div>
          </div>
          <IconButton icon={<X size={20} />} label="关闭目录" onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {chapters.map((chapter, index) => {
            const active = index === currentChapterIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onSelectChapter(index)}
                className={[
                  "mb-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left text-sm leading-6 transition",
                  active
                    ? "bg-primary-soft font-medium text-primary"
                    : "reader-muted hover:bg-black/5 hover:text-[var(--reader-text)]",
                ].join(" ")}
              >
                <span className="mt-0.5 w-8 shrink-0 text-xs tabular-nums">{index + 1}</span>
                <span className="line-clamp-2 min-w-0 flex-1">{chapter.title}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
