import { create } from "zustand";
import type { Book, BookMeta, Bookmark, BookProgress, ReaderSettings } from "../types/book";
import { fileToArrayBuffer, getFileFormat, readTextFile } from "../utils/file";
import { getFileBaseName } from "../utils/format";
import { parseEpub } from "../utils/parseEpub";
import { parseTxt } from "../utils/parseTxt";
import {
  READER_SETTINGS_KEY,
  createLibraryBackup,
  deleteBookBookmarks,
  deleteBookChapters,
  getBookBookmarks,
  getBookChapters,
  getBookMetas,
  restoreLibraryBackup,
  safeSetLocalStorage,
  saveBookBookmarks,
  saveBookChapters,
  saveBookMetas,
} from "../utils/storage";

type NewBookmark = Omit<Bookmark, "id" | "bookId" | "createdAt">;

interface LibraryState {
  bookMetas: BookMeta[];
  bookmarksByBookId: Record<string, Bookmark[]>;
  loading: boolean;
  error: string | null;
  loadBooks: () => Promise<void>;
  importBook: (file: File, encoding: string) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateProgress: (bookId: string, progress: BookProgress) => Promise<void>;
  getBook: (bookId: string) => Promise<Book | undefined>;
  getBookmarks: (bookId: string) => Promise<Bookmark[]>;
  addBookmark: (bookId: string, bookmark: NewBookmark) => Promise<Bookmark | undefined>;
  deleteBookmark: (bookId: string, bookmarkId: string) => Promise<void>;
  exportLibraryData: (settings?: ReaderSettings) => Promise<string | undefined>;
  importLibraryData: (file: File) => Promise<ReaderSettings | undefined>;
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
  bookmarksByBookId: {},
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
        percent: 0,
        updatedAt: now,
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
      await saveBookBookmarks(bookId, []);

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
      await deleteBookBookmarks(bookId);
      await saveBookMetas(nextMetas);

      set((state) => {
        const { [bookId]: _removed, ...nextBookmarksByBookId } = state.bookmarksByBookId;
        return {
          bookMetas: sortBookMetas(nextMetas),
          bookmarksByBookId: nextBookmarksByBookId,
          loading: false,
        };
      });
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

  getBookmarks: async (bookId) => {
    try {
      const bookmarks = await getBookBookmarks(bookId);
      const sortedBookmarks = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);
      set((state) => ({
        bookmarksByBookId: {
          ...state.bookmarksByBookId,
          [bookId]: sortedBookmarks,
        },
      }));
      return sortedBookmarks;
    } catch (error) {
      set({
        error: getErrorMessage(error, "读取书签失败。"),
      });
      return [];
    }
  },

  addBookmark: async (bookId, bookmark) => {
    try {
      const currentBookmarks = await getBookBookmarks(bookId);
      const duplicate = currentBookmarks.find(
        (item) =>
          item.chapterId === bookmark.chapterId &&
          Math.abs(item.scrollTop - bookmark.scrollTop) < 120,
      );

      if (duplicate) {
        set({ error: "当前位置已经有书签了。" });
        return duplicate;
      }

      const now = Date.now();
      const nextBookmark: Bookmark = {
        ...bookmark,
        id: createBookId(),
        bookId,
        createdAt: now,
      };
      const nextBookmarks = [nextBookmark, ...currentBookmarks].sort((a, b) => b.createdAt - a.createdAt);

      await saveBookBookmarks(bookId, nextBookmarks);
      set((state) => ({
        bookmarksByBookId: {
          ...state.bookmarksByBookId,
          [bookId]: nextBookmarks,
        },
        error: null,
      }));

      return nextBookmark;
    } catch (error) {
      set({
        error: getErrorMessage(error, "添加书签失败。"),
      });
      return undefined;
    }
  },

  deleteBookmark: async (bookId, bookmarkId) => {
    try {
      const currentBookmarks = await getBookBookmarks(bookId);
      const nextBookmarks = currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId);
      await saveBookBookmarks(bookId, nextBookmarks);
      set((state) => ({
        bookmarksByBookId: {
          ...state.bookmarksByBookId,
          [bookId]: nextBookmarks,
        },
        error: null,
      }));
    } catch (error) {
      set({
        error: getErrorMessage(error, "删除书签失败。"),
      });
    }
  },

  exportLibraryData: async (settings) => {
    set({ loading: true, error: null });

    try {
      const backup = await createLibraryBackup(settings);
      set({ loading: false });
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      set({
        error: getErrorMessage(error, "导出备份失败。"),
        loading: false,
      });
      return undefined;
    }
  },

  importLibraryData: async (file) => {
    set({ loading: true, error: null });

    try {
      const backupText = await file.text();
      const backupValue = JSON.parse(backupText) as unknown;
      const restored = await restoreLibraryBackup(backupValue);

      if (restored.settings) {
        safeSetLocalStorage(READER_SETTINGS_KEY, restored.settings);
      }

      set({
        bookMetas: sortBookMetas(restored.bookMetas),
        bookmarksByBookId: {},
        loading: false,
        error: null,
      });

      return restored.settings;
    } catch (error) {
      set({
        error: getErrorMessage(error, "导入备份失败，请确认文件是否有效。"),
        loading: false,
      });
      return undefined;
    }
  },
}));
