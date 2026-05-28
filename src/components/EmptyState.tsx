import { BookOpen, Upload } from "lucide-react";

interface EmptyStateProps {
  onImport: () => void;
}

export function EmptyState({ onImport }: EmptyStateProps) {
  return (
    <section className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-primary-soft text-primary shadow-shelf">
          <BookOpen size={34} strokeWidth={1.8} />
        </div>
        <h2 className="mt-7 text-2xl font-semibold tracking-normal text-reader-ink">书架还很安静</h2>
        <p className="mt-3 text-sm leading-7 text-reader-muted">
          导入一本 TXT 或 EPUB 小说，QL 会把章节和进度保存在浏览器本地。
        </p>
        <button
          type="button"
          onClick={onImport}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white shadow-shelf transition hover:bg-primary-hover active:scale-[0.98]"
        >
          <Upload size={18} />
          导入 TXT / EPUB
        </button>
      </div>
    </section>
  );
}
