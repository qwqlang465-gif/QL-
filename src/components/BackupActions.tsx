import { useRef } from "react";
import { Download, UploadCloud } from "lucide-react";
import { formatFileSize } from "../utils/format";

interface BackupActionsProps {
  loading: boolean;
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<void>;
}

export function BackupActions({ loading, onExport, onImport }: BackupActionsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!window.confirm(`导入 ${file.name}（${formatFileSize(file.size)}）会覆盖当前书架数据，确定继续吗？`)) {
      return;
    }

    await onImport(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={onExport}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-reader-card px-4 text-sm text-reader-ink shadow-shelf transition hover:-translate-y-0.5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download size={17} />
        导出数据
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-reader-card px-4 text-sm text-reader-ink shadow-shelf transition hover:-translate-y-0.5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UploadCloud size={17} />
        导入备份
      </button>
    </div>
  );
}
