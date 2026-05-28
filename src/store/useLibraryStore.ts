import { create } from "zustand";
import type { Book, BookMeta, BookProgress } from "../types/book";
import { fileToArrayBuffer, getFileFormat, readTextFile } from "../utils/file";
import { getFileBaseName } from "../utils/format";
import { parseEpub } from "../utils/parseEpub";
import { parseTxt } from "../utils/parseTxt";
import {
  deleteBookChapters,
  getBookChapters,
  getBookMetas,
  saveBookChapters,
  saveBookMetas,
} from "../utils/storage";

interface LibraryState {
  bookMetas: BookMeta[];
  loading: boolean;
  error: string | null;
  loadBooks: () => Promise<void>;
  importBook: (file: File, encoding: string) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateProgress: (bookId: string, progress: BookProgress) => Promise<void>;
  getBook: (bookId: string) => Promise<Book | undefined>;
}

function createBookId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `book-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortBookMetas(bookMetas: BookMeta[]): BookMeta[] {
  return [...bookMetas].sort((a, b) => b.updatedAt - a.updatedAt);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  bookMetas: [],
  loading: false,
  error: null,

  loadBooks: async () => {
    set({ loading: true, error: null });
    try {
      const bookMetas = await getBookMetas();
      set({ bookMetas: sortBookMetas(bookMetas), loading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "读取书架失败。"),
        loading: false,
      });
    }
  },

  importBook: async (file, encoding) => {
    set({ loading: true, error: null });

    try {
      const format = getFileFormat(file);

      if (!format) {
        throw new Error("暂时只支持导入 TXT 或 EPUB 文件。");
      }

      const parsedBook =
        format === "epub"
          ? await parseEpub(await fileToArrayBuffer(file))
          : {
              title: undefined,
              chapters: parseTxt(await readTextFile(file, encoding)),
            };

      const chapters = parsedBook.chapters;
      const now = Date.now();
      const bookId = createBookId();
      const name = parsedBook.title?.trim() || getFileBaseName(file.name);
      const progress: BookProgress = {
        chapterId: chapters[0]?.id ?? "chapter-0",
        chapterIndex: 0,
        chapterTitle: chapters[0]?.title ?? "全文",
        scrollTop: 0,
      };

      const meta: BookMeta = {
        id: bookId,
        name,
        fileName: file.name,
        createdAt: now,
        updatedAt: now,
        chapterCount: chapters.length,
        progress,
        format,
        encoding: format === "txt" ? encoding : undefined,
      };

      await saveBookChapters(bookId, chapters);

      const latestMetas = await getBookMetas();
      const nextMetas = sortBookMetas([meta, ...latestMetas.filter((item) => item.id !== bookId)]);
      await saveBookMetas(nextMetas);

      set({ bookMetas: nextMetas, loading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "导入小说失败，请检查文件格式后重试。"),
        loading: false,
      });
    }
  },

  deleteBook: async (bookId) => {
    set({ loading: true, error: null });

    try {
      const latestMetas = await getBookMetas();
      const nextMetas = latestMetas.filter((book) => book.id !== bookId);

      await deleteBookChapters(bookId);
      await saveBookMetas(nextMetas);

      set({ bookMetas: sortBookMetas(nextMetas), loading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "删除书籍失败，请稍后重试。"),
        loading: false,
      });
    }
  },

  updateProgress: async (bookId, progress) => {
    try {
      const currentMetas = get().bookMetas.length > 0 ? get().bookMetas : await getBookMetas();
      const nextMetas = currentMetas.map((book) =>
        book.id === bookId
          ? {
              ...book,
              updatedAt: Date.now(),
              progress,
            }
          : book,
      );

      await saveBookMetas(nextMetas);
      set({ bookMetas: sortBookMetas(nextMetas) });
    } catch (error) {
      set({
        error: getErrorMessage(error, "保存阅读进度失败。"),
      });
    }
  },

  getBook: async (bookId) => {
    try {
      const bookMetas = await getBookMetas();
      const meta = bookMetas.find((book) => book.id === bookId);

      set({ bookMetas: sortBookMetas(bookMetas) });

      if (!meta) {
        return undefined;
      }

      const chapters = await getBookChapters(bookId);
      return {
        id: meta.id,
        name: meta.name,
        fileName: meta.fileName,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        chapters,
        progress: meta.progress,
        format: meta.format,
        encoding: meta.encoding,
      };
    } catch (error) {
      set({
        error: getErrorMessage(error, "打开书籍失败。"),
      });
      return undefined;
    }
  },
}));
