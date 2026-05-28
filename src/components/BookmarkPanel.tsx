import { BookmarkPlus, Trash2, X } from "lucide-react";
import type { Bookmark } from "../types/book";
import { formatDate } from "../utils/format";
import { IconButton } from "./IconButton";

interface BookmarkPanelProps {
  open: boolean;
  bookmarks: Bookmark[];
  onAddBookmark: () => void;
  onSelectBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onClose: () => void;
}

export function BookmarkPanel({
  open,
  bookmarks,
  onAddBookmark,
  onSelectBookmark,
  onDeleteBookmark,
  onClose,
}: BookmarkPanelProps) {
  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}>
      <button
        type="button"
        aria-label="关闭书签"
        className={["absolute inset-0 bg-black/30 transition-opacity", open ? "opacity-100" : "opacity-0"].join(" ")}
        onClick={onClose}
      />

      <section
        className={[
          "reader-panel absolute inset-x-0 bottom-0 flex max-h-[72vh] flex-col rounded-t-[1.35rem] border-t transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-[var(--reader-line)] px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold">书签</div>
            <div className="reader-muted mt-0.5 text-xs">{bookmarks.length} 条记录</div>
          </div>
          <button
            type="button"
            onClick={onAddBookmark}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            <BookmarkPlus size={18} />
            添加当前页
          </button>
          <IconButton icon={<X size={20} />} label="关闭书签" onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {bookmarks.length > 0 ? (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="mb-2 flex items-start gap-2 rounded-lg px-2 py-2 transition hover:bg-black/5"
              >
                <button
                  type="button"
                  onClick={() => onSelectBookmark(bookmark)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{bookmark.chapterTitle}</span>
                    <span className="reader-muted shrink-0 text-xs">{formatDate(bookmark.createdAt)}</span>
                  </div>
                  <p className="reader-muted mt-1 line-clamp-2 text-sm leading-6">{bookmark.excerpt}</p>
                </button>
                <IconButton
                  icon={<Trash2 size={17} />}
                  label="删除书签"
                  onClick={() => onDeleteBookmark(bookmark.id)}
                  className="shrink-0"
                />
              </div>
            ))
          ) : (
            <div className="reader-muted px-4 py-10 text-center text-sm">还没有书签。</div>
          )}
        </div>
      </section>
    </div>
  );
}
