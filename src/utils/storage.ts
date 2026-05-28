import { createStore, del, get, set } from "idb-keyval";
import type { BookMeta, Chapter } from "../types/book";

const databaseStore = createStore("ql_reader_db", "ql_reader_store");

export const BOOK_METAS_KEY = "ql_book_metas";
export const READER_SETTINGS_KEY = "ql_reader_settings";

const getBookChaptersKey = (bookId: string) => `ql_book_chapters_${bookId}`;

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
