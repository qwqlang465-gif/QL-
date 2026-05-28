export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export type BookFormat = "txt" | "epub";

export interface BookProgress {
  chapterId: string;
  chapterIndex: number;
  chapterTitle?: string;
  scrollTop?: number;
}

export interface BookMeta {
  id: string;
  name: string;
  fileName: string;
  createdAt: number;
  updatedAt: number;
  chapterCount: number;
  progress: BookProgress;
  format?: BookFormat;
  encoding?: string;
}

export interface Book {
  id: string;
  name: string;
  fileName: string;
  createdAt: number;
  updatedAt: number;
  chapters: Chapter[];
  progress: BookProgress;
  format?: BookFormat;
  encoding?: string;
}

export type ReaderTheme = "light" | "dark" | "green" | "paper";

export type FontFamily = "serif" | "sans" | "mono";

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  fontFamily: FontFamily;
  theme: ReaderTheme;
}
