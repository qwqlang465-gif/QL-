import { ChevronLeft, ChevronRight, List, SlidersHorizontal } from "lucide-react";
import { IconButton } from "./IconButton";

interface ReaderBottomBarProps {
  onPrevious: () => void;
  onNext: () => void;
  onOpenChapters: () => void;
  onOpenSettings: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

export function ReaderBottomBar({
  onPrevious,
  onNext,
  onOpenChapters,
  onOpenSettings,
  previousDisabled,
  nextDisabled,
}: ReaderBottomBarProps) {
  return (
    <footer className="reader-chrome fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-16 max-w-2xl grid-cols-4 items-center px-2">
        <IconButton
          icon={<ChevronLeft size={20} />}
          label="上一章"
          showLabel
          onClick={onPrevious}
          disabled={previousDisabled}
          className="rounded-2xl"
        />
        <IconButton
          icon={<List size={20} />}
          label="目录"
          showLabel
          onClick={onOpenChapters}
          className="rounded-2xl"
        />
        <IconButton
          icon={<ChevronRight size={20} />}
          label="下一章"
          showLabel
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-2xl"
        />
        <IconButton
          icon={<SlidersHorizontal size={20} />}
          label="设置"
          showLabel
          onClick={onOpenSettings}
          className="rounded-2xl"
        />
      </div>
    </footer>
  );
}
