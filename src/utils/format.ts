import type { BookFormat } from "../types/book";

export function formatDate(timestamp: number): string {
  if (!timestamp) {
    return "暂无";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "暂无";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatChapterCount(count: number): string {
  return `${count} 章`;
}

export function formatEncoding(encoding?: string): string {
  if (!encoding) {
    return "未知编码";
  }

  return encoding.toUpperCase();
}

export function formatBookFormat(format?: BookFormat): string {
  if (format === "epub") {
    return "EPUB";
  }

  return "TXT";
}

export function getFileBaseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").trim() || fileName;
}

export function formatProgressTitle(title?: string): string {
  return title ? `读到：${title}` : "尚未开始";
}

export function formatProgressPercent(percent?: number): string {
  if (typeof percent !== "number" || Number.isNaN(percent)) {
    return "0%";
  }

  const normalizedPercent = Math.min(100, Math.max(0, percent));
  return `${Math.round(normalizedPercent)}%`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
