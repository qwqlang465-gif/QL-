import { List, Moon, Palette, Settings, Sun } from "lucide-react";
import { IconButton } from "./IconButton";

interface ReaderBottomBarProps {
  onOpenChapters: () => void;
  onOpenAppearance: () => void;
  onOpenMore: () => void;
  onToggleNight: () => void;
  isNightMode: boolean;
}

export function ReaderBottomBar({
  onOpenChapters,
  onOpenAppearance,
  onOpenMore,
  onToggleNight,
  isNightMode,
}: ReaderBottomBarProps) {
  return (
    <footer className="reader-chrome fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-2">
        <IconButton
          icon={<List size={20} />}
          label="目录"
          showLabel
          onClick={onOpenChapters}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<Palette size={20} />}
          label="界面"
          showLabel
          onClick={onOpenAppearance}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={<Settings size={20} />}
          label="设置"
          showLabel
          onClick={onOpenMore}
          className="rounded-2xl px-1 text-xs"
        />
        <IconButton
          icon={isNightMode ? <Sun size={20} /> : <Moon size={20} />}
          label={isNightMode ? "日间" : "夜间"}
          showLabel
          onClick={onToggleNight}
          className="rounded-2xl px-1 text-xs"
        />
      </div>
    </footer>
  );
}
