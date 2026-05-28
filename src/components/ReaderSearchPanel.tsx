import { Search, X } from "lucide-react";
import type { SearchResult } from "../types/book";
import { IconButton } from "./IconButton";

interface ReaderSearchPanelProps {
  open: boolean;
  query: string;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onSelectResult: (result: SearchResult) => void;
  onClose: () => void;
}

export function ReaderSearchPanel({
  open,
  query,
  results,
  onQueryChange,
  onSelectResult,
  onClose,
}: ReaderSearchPanelProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}>
      <button
        type="button"
        aria-label="关闭搜索"
        className={["absolute inset-0 bg-black/30 transition-opacity", open ? "opacity-100" : "opacity-0"].join(" ")}
        onClick={onClose}
      />

      <section
        className={[
          "reader-panel absolute inset-x-0 bottom-0 flex max-h-[76vh] flex-col rounded-t-[1.35rem] border-t transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-[var(--reader-line)] px-4 py-3">
          <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-black/5 px-4">
            <Search size={18} className="reader-muted shrink-0" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--reader-muted)]"
              placeholder="搜索当前书籍"
              autoFocus={open}
            />
          </label>
          <IconButton icon={<X size={20} />} label="关闭搜索" onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {results.length > 0 ? (
            <>
              <div className="reader-muted px-2 pb-2 text-xs">找到 {results.length} 条结果</div>
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelectResult(result)}
                  className="mb-2 w-full rounded-lg px-3 py-3 text-left transition hover:bg-black/5"
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="reader-muted shrink-0 text-xs tabular-nums">
                      {result.chapterIndex + 1}
                    </span>
                    <span className="truncate">{result.chapterTitle}</span>
                  </div>
                  <p className="reader-muted mt-1 line-clamp-2 text-sm leading-6">{result.excerpt}</p>
                </button>
              ))}
            </>
          ) : (
            <div className="reader-muted px-4 py-10 text-center text-sm">
              {hasQuery ? "没有找到匹配内容。" : "输入关键词后搜索整本书。"}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
