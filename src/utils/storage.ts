import { createStore, del, get, set } from "idb-keyval";
import type { BookMeta, Bookmark, Chapter, ReaderSettings } from "../types/book";

const databaseStore = createStore("ql_reader_db", "ql_reader_store");

export const BOOK_METAS_KEY = "ql_book_metas";
export const READER_SETTINGS_KEY = "ql_reader_settings";
export const LIBRARY_BACKUP_SCHEMA_VERSION = 1;

const getBookChaptersKey = (bookId: string) => `ql_book_chapters_${bookId}`;
const getBookBookmarksKey = (bookId: string) => `ql_book_bookmarks_${bookId}`;

export interface LibraryBackupBook {
  meta: BookMeta;
  chapters: Chapter[];
  bookmarks: Bookmark[];
}

export interface LibraryBackup {
  app: "QL";
  schemaVersion: number;
  exportedAt: number;
  settings?: ReaderSettings;
  books: LibraryBackupBook[];
}

export async function getBookMetas(): Promise<BookMeta[]> {
  try {
    const metas = await get<BookMeta[]>(BOOK_METAS_KEY, databaseStore);
    return Array.isArray(metas) ? metas : [];
  } catch (error) {
    console.error("Failed to read book metas from IndexedDB.", error);
    throw new Error("无法读取浏览器本地书架数据，请确认当前浏览器支持 IndexedDB。");
  }
}

export async function saveBookMetas(bookMetas: BookMeta[]): Promise<void> {
  try {
    await set(BOOK_METAS_KEY, bookMetas, databaseStore);
  } catch (error) {
    console.error("Failed to save book metas to IndexedDB.", error);
    throw new Error("无法保存书架数据，可能是浏览器存储空间不足或 IndexedDB 不可用。");
  }
}

export async function getBookChapters(bookId: string): Promise<Chapter[]> {
  try {
    const chapters = await get<Chapter[]>(getBookChaptersKey(bookId), databaseStore);
    return Array.isArray(chapters) ? chapters : [];
  } catch (error) {
    console.error(`Failed to read chapters for ${bookId}.`, error);
    throw new Error("无法读取小说正文，请稍后重试或重新导入。");
  }
}

export async function saveBookChapters(bookId: string, chapters: Chapter[]): Promise<void> {
  try {
    await set(getBookChaptersKey(bookId), chapters, databaseStore);
  } catch (error) {
    console.error(`Failed to save chapters for ${bookId}.`, error);
    throw new Error("无法保存小说正文，可能是浏览器存储空间不足。");
  }
}

export async function deleteBookChapters(bookId: string): Promise<void> {
  try {
    await del(getBookChaptersKey(bookId), databaseStore);
  } catch (error) {
    console.error(`Failed to delete chapters for ${bookId}.`, error);
    throw new Error("删除小说正文失败，请稍后重试。");
  }
}

export async function getBookBookmarks(bookId: string): Promise<Bookmark[]> {
  try {
    const bookmarks = await get<Bookmark[]>(getBookBookmarksKey(bookId), databaseStore);
    return Array.isArray(bookmarks) ? bookmarks : [];
  } catch (error) {
    console.error(`Failed to read bookmarks for ${bookId}.`, error);
    throw new Error("无法读取书签，请稍后重试。");
  }
}

export async function saveBookBookmarks(bookId: string, bookmarks: Bookmark[]): Promise<void> {
  try {
    await set(getBookBookmarksKey(bookId), bookmarks, databaseStore);
  } catch (error) {
    console.error(`Failed to save bookmarks for ${bookId}.`, error);
    throw new Error("无法保存书签，可能是浏览器存储空间不足。");
  }
}

export async function deleteBookBookmarks(bookId: string): Promise<void> {
  try {
    await del(getBookBookmarksKey(bookId), databaseStore);
  } catch (error) {
    console.error(`Failed to delete bookmarks for ${bookId}.`, error);
    throw new Error("删除书签失败，请稍后重试。");
  }
}

export async function createLibraryBackup(settings?: ReaderSettings): Promise<LibraryBackup> {
  try {
    const bookMetas = await getBookMetas();
    const books: LibraryBackupBook[] = [];

    for (const meta of bookMetas) {
      books.push({
        meta,
        chapters: await getBookChapters(meta.id),
        bookmarks: await getBookBookmarks(meta.id),
      });
    }

    return {
      app: "QL",
      schemaVersion: LIBRARY_BACKUP_SCHEMA_VERSION,
      exportedAt: Date.now(),
      settings,
      books,
    };
  } catch (error) {
    console.error("Failed to create QL backup.", error);
    throw error instanceof Error ? error : new Error("导出备份失败。");
  }
}

export async function restoreLibraryBackup(value: unknown): Promise<{
  bookMetas: BookMeta[];
  settings?: ReaderSettings;
}> {
  try {
    const backup = normalizeLibraryBackup(value);
    const bookMetas = backup.books.map((book) => book.meta);
    const nextBookIds = new Set(bookMetas.map((meta) => meta.id));
    const existingMetas = await getBookMetas();

    for (const meta of existingMetas) {
      if (!nextBookIds.has(meta.id)) {
        await deleteBookChapters(meta.id);
        await deleteBookBookmarks(meta.id);
      }
    }

    for (const book of backup.books) {
      await saveBookChapters(book.meta.id, book.chapters);
      await saveBookBookmarks(book.meta.id, book.bookmarks);
    }

    await saveBookMetas(bookMetas);

    return {
      bookMetas,
      settings: backup.settings,
    };
  } catch (error) {
    console.error("Failed to restore QL backup.", error);
    throw error instanceof Error ? error : new Error("导入备份失败，请确认文件是否有效。");
  }
}

export function safeGetLocalStorage<TValue>(key: string, fallback: TValue): TValue {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as TValue;
  } catch (error) {
    console.error(`Failed to read localStorage key ${key}.`, error);
    return fallback;
  }
}

export function safeSetLocalStorage<TValue>(key: string, value: TValue): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write localStorage key ${key}.`, error);
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createFallbackId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeChapter(value: unknown, index: number): Chapter {
  if (!isRecord(value)) {
    return {
      id: `chapter-${index}`,
      title: `第 ${index + 1} 章`,
      content: "",
    };
  }

  return {
    id: asString(value.id, `chapter-${index}`),
    title: asString(value.title, `第 ${index + 1} 章`),
    content: typeof value.content === "string" ? value.content : "",
  };
}

function normalizeBookMeta(value: unknown, chapters: Chapter[], index: number): BookMeta {
  if (!isRecord(value)) {
    const chapter = chapters[0];
    const now = Date.now();
    return {
      id: createFallbackId("book"),
      name: `导入书籍 ${index + 1}`,
      fileName: `backup-${index + 1}.txt`,
      createdAt: now,
      updatedAt: now,
      chapterCount: chapters.length,
      progress: {
        chapterId: chapter?.id ?? "chapter-0",
        chapterIndex: 0,
        chapterTitle: chapter?.title ?? "全文",
        scrollTop: 0,
        percent: 0,
        updatedAt: now,
      },
      format: "txt",
    };
  }

  const now = Date.now();
  const chapterCount = chapters.length;
  const progressRecord = isRecord(value.progress) ? value.progress : {};
  const chapterIndex = clamp(Math.round(asNumber(progressRecord.chapterIndex, 0)), 0, Math.max(0, chapterCount - 1));
  const fallbackChapter = chapters[chapterIndex] ?? chapters[0];
  const format = value.format === "epub" ? "epub" : "txt";

  return {
    id: asString(value.id, createFallbackId("book")),
    name: asString(value.name, asString(value.fileName, `导入书籍 ${index + 1}`)),
    fileName: asString(value.fileName, `backup-${index + 1}.${format}`),
    createdAt: asNumber(value.createdAt, now),
    updatedAt: asNumber(value.updatedAt, now),
    chapterCount,
    progress: {
      chapterId: asString(progressRecord.chapterId, fallbackChapter?.id ?? "chapter-0"),
      chapterIndex,
      chapterTitle: asString(progressRecord.chapterTitle, fallbackChapter?.title ?? "全文"),
      scrollTop: Math.max(0, Math.round(asNumber(progressRecord.scrollTop, 0))),
      percent: clamp(asNumber(progressRecord.percent, 0), 0, 100),
      updatedAt: asNumber(progressRecord.updatedAt, now),
    },
    format,
    encoding: typeof value.encoding === "string" ? value.encoding : undefined,
  };
}

function normalizeBookmark(value: unknown, bookId: string, chapters: Chapter[], index: number): Bookmark | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const chapterIndex = clamp(Math.round(asNumber(value.chapterIndex, 0)), 0, Math.max(0, chapters.length - 1));
  const fallbackChapter = chapters[chapterIndex] ?? chapters[0];

  if (!fallbackChapter) {
    return undefined;
  }

  return {
    id: asString(value.id, createFallbackId("bookmark")),
    bookId,
    chapterId: asString(value.chapterId, fallbackChapter.id),
    chapterIndex,
    chapterTitle: asString(value.chapterTitle, fallbackChapter.title),
    scrollTop: Math.max(0, Math.round(asNumber(value.scrollTop, 0))),
    excerpt: asString(value.excerpt, `书签 ${index + 1}`).slice(0, 160),
    createdAt: asNumber(value.createdAt, Date.now()),
  };
}

function normalizeReaderSettings(value: unknown): ReaderSettings | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const fontFamily = value.fontFamily === "sans" || value.fontFamily === "mono" ? value.fontFamily : "serif";
  const theme =
    value.theme === "light" || value.theme === "dark" || value.theme === "green" || value.theme === "paper"
      ? value.theme
      : "paper";

  return {
    fontSize: clamp(asNumber(value.fontSize, 18), 14, 28),
    lineHeight: clamp(asNumber(value.lineHeight, 1.9), 1.4, 2.4),
    contentWidth: clamp(asNumber(value.contentWidth, 760), 560, 960),
    fontFamily,
    theme,
  };
}

function normalizeLibraryBackup(value: unknown): LibraryBackup {
  if (!isRecord(value) || !Array.isArray(value.books)) {
    throw new Error("这不是有效的 QL 备份文件。");
  }

  const books: LibraryBackupBook[] = value.books.map((bookValue, index) => {
    if (!isRecord(bookValue) || !Array.isArray(bookValue.chapters)) {
      throw new Error("备份文件中的书籍数据不完整。");
    }

    const chapters = bookValue.chapters.map((chapter, chapterIndex) => normalizeChapter(chapter, chapterIndex));
    const normalizedChapters =
      chapters.length > 0
        ? chapters
        : [
            {
              id: "chapter-0",
              title: "全文",
              content: "",
            },
          ];
    const meta = normalizeBookMeta(bookValue.meta, normalizedChapters, index);
    const rawBookmarks = Array.isArray(bookValue.bookmarks) ? bookValue.bookmarks : [];
    const bookmarks = rawBookmarks
      .map((bookmark, bookmarkIndex) => normalizeBookmark(bookmark, meta.id, normalizedChapters, bookmarkIndex))
      .filter((bookmark): bookmark is Bookmark => Boolean(bookmark));

    return {
      meta,
      chapters: normalizedChapters,
      bookmarks,
    };
  });

  return {
    app: "QL",
    schemaVersion: LIBRARY_BACKUP_SCHEMA_VERSION,
    exportedAt: asNumber(value.exportedAt, Date.now()),
    settings: normalizeReaderSettings(value.settings),
    books,
  };
}
