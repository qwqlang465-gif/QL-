import type { BookMeta } from "../types/book";
import { BookCard } from "./BookCard";
import { EmptyState } from "./EmptyState";

interface BookShelfProps {
  books: BookMeta[];
  progressTitleByBookId: Record<string, string | undefined>;
  onImport: () => void;
  onDelete: (bookId: string) => void;
}

export function BookShelf({ books, progressTitleByBookId, onImport, onDelete }: BookShelfProps) {
  if (books.length === 0) {
    return <EmptyState onImport={onImport} />;
  }

  return (
    <section className="grid gap-4 pb-10 sm:grid-cols-2">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          progressTitle={progressTitleByBookId[book.id]}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
