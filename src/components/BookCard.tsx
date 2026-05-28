import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { BookMeta } from "../types/book";
import {
  formatChapterCount,
  formatDate,
  formatEncoding,
  formatProgressTitle,
} from "../utils/format";

interface BookCardProps {
  book: BookMeta;
  progressTitle?: string;
  onDelete: (bookId: string) => void;
}

function getCoverGradient(bookId: string): string {
  const gradients = [
    "from-[#f8b195] via-[#f67280] to-[#c06c84]",
    "from-[#f6d365] via-[#fda085] to-[#f26b4f]",
    "from-[#d4fc79] via-[#96e6a1] to-[#6abf69]",
    "from-[#a1c4fd] via-[#c2e9fb] to-[#8bb8e8]",
    "from-[#fbc2eb] via-[#a6c1ee] to-[#8f9fe8]",
  ];
  const index = bookId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

export function BookCard({ book, progressTitle, onDelete }: BookCardProps) {
  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm(`确定删除《${book.name}》吗？`)) {
      onDelete(book.id);
    }
  };

  return (
    <Link
      to={`/reader/${book.id}`}
      className="group flex gap-4 rounded-lg bg-reader-card p-4 shadow-shelf transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div
        className={[
          "relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br shadow-shelf",
          getCoverGradient(book.id),
        ].join(" ")}
      >
        <div className="absolute inset-y-0 left-0 w-3 bg-black/10" />
        <div className="absolute inset-x-3 bottom-3 h-px bg-white/45" />
        <div className="absolute left-4 right-4 top-5 text-center text-base font-semibold leading-6 text-white/95">
          QL
        </div>
      </div>

      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-reader-ink">{book.name}</h3>
            <p className="mt-1 truncate text-xs text-reader-muted">{book.fileName}</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-reader-muted transition hover:bg-primary-soft hover:text-primary"
            aria-label={`删除 ${book.name}`}
            title="删除"
          >
            <Trash2 size={17} />
          </button>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-reader-ink/85">
          {formatProgressTitle(progressTitle)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-reader-muted">
          <span className="rounded-full bg-[#f3eadf] px-3 py-1">{formatChapterCount(book.chapterCount)}</span>
          <span className="rounded-full bg-[#f3eadf] px-3 py-1">{formatEncoding(book.encoding)}</span>
          <span className="rounded-full bg-[#f3eadf] px-3 py-1">上次 {formatDate(book.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
