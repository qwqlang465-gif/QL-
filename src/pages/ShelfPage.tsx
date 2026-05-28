import { useMemo, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { BookShelf } from "../components/BookShelf";
import { ImportButton } from "../components/ImportButton";
import { Layout } from "../components/Layout";
import { PwaInstallButton } from "../components/PwaInstallButton";
import { useLibraryStore } from "../store/useLibraryStore";

export default function ShelfPage() {
  const importButtonRef = useRef<HTMLButtonElement | null>(null);
  const { bookMetas, loading, error, importBook, deleteBook } = useLibraryStore((state) => ({
    bookMetas: state.bookMetas,
    loading: state.loading,
    error: state.error,
    importBook: state.importBook,
    deleteBook: state.deleteBook,
  }));

  const progressTitleByBookId = useMemo(
    () =>
      bookMetas.reduce<Record<string, string | undefined>>((result, book) => {
        result[book.id] =
          book.progress.chapterTitle ??
          (book.progress.chapterId ? `第 ${book.progress.chapterIndex + 1} 章` : undefined);
        return result;
      }, {}),
    [bookMetas],
  );

  const handleEmptyStateImport = () => {
    importButtonRef.current?.click();
  };

  return (
    <Layout>
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-reader-card px-3 py-1.5 text-xs text-reader-muted shadow-shelf">
            <ShieldCheck size={15} className="text-primary" />
            文件只保存在浏览器本地
          </div>
          <h1 className="mt-5 text-5xl font-semibold tracking-normal text-reader-ink">QL</h1>
          <p className="mt-3 text-base leading-7 text-reader-muted">安静地阅读本地小说</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PwaInstallButton />
          <ImportButton loading={loading} onImport={importBook} buttonRef={importButtonRef} />
        </div>
      </header>

      {error ? (
        <div className="mb-5 rounded-lg bg-[#fff2ed] px-4 py-3 text-sm leading-6 text-[#9d3d28] shadow-shelf">
          {error}
        </div>
      ) : null}

      <BookShelf
        books={bookMetas}
        progressTitleByBookId={progressTitleByBookId}
        onImport={handleEmptyStateImport}
        onDelete={(bookId) => {
          void deleteBook(bookId);
        }}
      />
    </Layout>
  );
}
