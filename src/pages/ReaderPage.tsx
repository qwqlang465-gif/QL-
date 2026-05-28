import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Reader } from "../components/Reader";
import { useLibraryStore } from "../store/useLibraryStore";
import type { Book } from "../types/book";

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const getBook = useLibraryStore((state) => state.getBook);
  const storeError = useLibraryStore((state) => state.error);
  const [book, setBook] = useState<Book | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadBook = async () => {
      if (!bookId) {
        setLoading(false);
        setNotFound(true);
        return;
      }

      setLoading(true);
      const loadedBook = await getBook(bookId);

      if (!mounted) {
        return;
      }

      setBook(loadedBook);
      setNotFound(!loadedBook);
      setLoading(false);
    };

    void loadBook();

    return () => {
      mounted = false;
    };
  }, [bookId, getBook]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ecd8] px-6 text-[#3a2f24]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm">正在打开书籍...</p>
        </div>
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ecd8] px-6 text-center text-[#3a2f24]">
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold">没有找到这本书</h1>
          <p className="mt-3 text-sm leading-7 text-[#806b58]">
            {storeError ?? "它可能已经被删除，或者浏览器本地存储暂时不可用。"}
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white shadow-shelf transition hover:bg-primary-hover"
          >
            <ArrowLeft size={18} />
            返回书架
          </Link>
        </div>
      </div>
    );
  }

  return <Reader book={book} />;
}
