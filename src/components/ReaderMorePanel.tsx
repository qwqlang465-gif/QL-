import { ArrowLeft, Bookmark, BookmarkPlus, ChevronLeft, ChevronRight, Home, Search, X } from "lucide-react";
import type { ReaderSettings } from "../types/book";
import { IconButton } from "./IconButton";

interface ReaderMorePanelProps {
  open: boolean;
  settings: ReaderSettings;
  onClose: () => void;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onAddBookmark: () => void;
  onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onClick: () => void;
}

function ToggleRow({ label, checked, onClick }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-between rounded-2xl bg-black/5 px-4 text-sm transition hover:bg-primary-soft hover:text-primary"
    >
      <span>{label}</span>
      <span
        className={[
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-primary" : "bg-black/15",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function ReaderMorePanel({
  open,
  settings,
  onClose,
  onBack,
  onPrevious,
  onNext,
  onOpenSearch,
  onOpenBookmarks,
  onAddBookmark,
  onUpdateSettings,
  previousDisabled,
  nextDisabled,
}: ReaderMorePanelProps) {
  const actions = [
    {
      label: "搜索",
      icon: <Search size={20} />,
      onClick: onOpenSearch,
    },
    {
      label: "书签",
      icon: <Bookmark size={20} />,
      onClick: onOpenBookmarks,
    },
    {
      label: "加书签",
      icon: <BookmarkPlus size={20} />,
      onClick: onAddBookmark,
    },
    {
      label: "书架",
      icon: <Home size={20} />,
      onClick: onBack,
    },
  ];

  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}>
      <button
        type="button"
        aria-label="关闭设置"
        className={[
          "absolute inset-0 bg-black/25 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <section
        className={[
          "reader-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] border-t px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1 text-base font-semibold">设置</div>
            <IconButton icon={<X size={20} />} label="关闭设置" onClick={onClose} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={previousDisabled}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-black/5 text-sm transition hover:bg-primary-soft hover:text-primary disabled:opacity-40"
            >
              <ChevronLeft size={20} />
              上一章
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-black/5 text-sm transition hover:bg-primary-soft hover:text-primary disabled:opacity-40"
            >
              下一章
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-black/5 text-xs transition hover:bg-primary-soft hover:text-primary"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            <ToggleRow
              label="屏幕常亮"
              checked={settings.keepScreenOn}
              onClick={() => onUpdateSettings({ keepScreenOn: !settings.keepScreenOn })}
            />
            <ToggleRow
              label="扩展到刘海"
              checked={settings.edgeToEdge}
              onClick={() => onUpdateSettings({ edgeToEdge: !settings.edgeToEdge })}
            />
            <ToggleRow
              label="隐藏状态栏"
              checked={settings.hideStatusBar}
              onClick={() => onUpdateSettings({ hideStatusBar: !settings.hideStatusBar })}
            />
            <ToggleRow
              label="隐藏导航栏"
              checked={settings.hideNavigationBar}
              onClick={() => onUpdateSettings({ hideNavigationBar: !settings.hideNavigationBar })}
            />
            <ToggleRow
              label="音量键翻页"
              checked={settings.volumeKeyPageTurn}
              onClick={() => onUpdateSettings({ volumeKeyPageTurn: !settings.volumeKeyPageTurn })}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="reader-muted mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-black/5 text-sm transition hover:bg-primary-soft hover:text-primary"
          >
            <ArrowLeft size={18} />
            返回阅读
          </button>
        </div>
      </section>
    </div>
  );
}
