import { Bookmark, ChevronLeft, ChevronRight, List, Search, SlidersHorizontal } from "lucide-react";
import { IconButton } from "./IconButton";

interface ReaderBottomBarProps {
  onPrevious: () => void;
  onNext: () => void;
  onOpenSearch: () => void;
  onOpenChapters: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

export function ReaderBottomBar({
  onPrevious,
  onNext,
  onOpenSearch,
  onOpenChapters,
  onOpenBookmarks,
  onOpenSettings,
  previousDisabled,
  nextDisabled,
}: ReaderBottomBarProps) {
  return (
    <footer className="reader-chrome fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-6 items-center px-1">
        <IconButton
          icon={<ChevronLeft size={20} />}
          label="上一章"
          showLabel
          onClick={onPrevious}
          disabled={previousDisabled}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<Search size={20} />}
          label="搜索"
          showLabel
          onClick={onOpenSearch}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<List size={20} />}
          label="目录"
          showLabel
          onClick={onOpenChapters}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<Bookmark size={20} />}
          label="书签"
          showLabel
          onClick={onOpenBookmarks}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<ChevronRight size={20} />}
          label="下一章"
          showLabel
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<SlidersHorizontal size={20} />}
          label="设置"
          showLabel
          onClick={onOpenSettings}
          className="rounded-2xl px-1 text-xs"
        />
      </div>
    </footer>
  );
}
