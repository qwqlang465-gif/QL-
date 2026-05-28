import { ArrowLeft, List, SlidersHorizontal } from "lucide-react";
import { IconButton } from "./IconButton";

interface ReaderHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onOpenChapters: () => void;
  onOpenSettings: () => void;
}

export function ReaderHeader({
  title,
  subtitle,
  onBack,
  onOpenChapters,
  onOpenSettings,
}: ReaderHeaderProps) {
  return (
    <header className="reader-chrome fixed inset-x-0 top-0 z-30 border-b pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-3 sm:px-6">
        <IconButton icon={<ArrowLeft size={20} />} label="返回书架" onClick={onBack} />
        <div className="min-w-0 flex-1 px-1">
          <div className="truncate text-sm font-medium">{title}</div>
          <div className="reader-muted mt-0.5 truncate text-xs">{subtitle}</div>
        </div>
        <IconButton icon={<List size={20} />} label="目录" onClick={onOpenChapters} />
        <IconButton icon={<SlidersHorizontal size={20} />} label="设置" onClick={onOpenSettings} />
      </div>
    </header>
  );
}
