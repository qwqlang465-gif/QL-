import type { Chapter } from "../types/book";

const chineseNumber = "零〇一二两三四五六七八九十百千万亿";
const titleSeparator = "[\\s　:：、.．\\-—]*";

const chapterPatterns = [
  new RegExp(
    `^第[0-9${chineseNumber}]+[章节卷回部集篇]${titleSeparator}.{0,40}$`,
    "u",
  ),
  new RegExp(`^卷[0-9${chineseNumber}]+${titleSeparator}.{0,40}$`, "u"),
  new RegExp(`^(序章|楔子|前言|后记)${titleSeparator}.{0,40}$`, "u"),
  new RegExp(
    `^番外${titleSeparator}(?:第?[0-9${chineseNumber}]+[章节卷回部集篇]?${titleSeparator})?.{0,40}$`,
    "u",
  ),
  /^chapter\s+[0-9ivxlcdm]+(?:[\s:：.．\-—]+.{1,40})?$/iu,
];

export function cleanTxt(rawText: string): string {
  return rawText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\uFEFF/g, "").replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isChapterTitle(line: string): boolean {
  const title = line.trim();

  if (title.length < 2 || title.length > 60) {
    return false;
  }

  if (/^[，。！？；、,.!?;]$/.test(title)) {
    return false;
  }

  return chapterPatterns.some((pattern) => pattern.test(title));
}

function normalizeChapterContent(lines: string[]): string {
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function createChapter(title: string, content: string, index: number): Chapter {
  return {
    id: `chapter-${index}`,
    title,
    content,
  };
}

export function parseTxt(rawText: string): Chapter[] {
  const text = cleanTxt(rawText);

  if (!text) {
    return [createChapter("全文", "", 0)];
  }

  const lines = text.split("\n");
  const parsed: Array<Omit<Chapter, "id">> = [];
  let currentTitle: string | undefined;
  let buffer: string[] = [];

  const pushCurrent = (allowEmpty: boolean) => {
    const content = normalizeChapterContent(buffer);
    if (content || allowEmpty) {
      parsed.push({
        title: currentTitle ?? "全文",
        content,
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (isChapterTitle(line)) {
      const title = line.trim();

      if (currentTitle === undefined && normalizeChapterContent(buffer)) {
        currentTitle = "序章";
        pushCurrent(false);
      } else if (currentTitle !== undefined) {
        pushCurrent(false);
      }

      currentTitle = title;
      buffer = [];
      continue;
    }

    buffer.push(line);
  }

  if (currentTitle === undefined) {
    return [createChapter("全文", text, 0)];
  }

  pushCurrent(parsed.length === 0);

  const chapters = parsed
    .filter((chapter) => chapter.content.trim() || parsed.length === 1)
    .map((chapter, index) => createChapter(chapter.title, chapter.content, index));

  return chapters.length > 0 ? chapters : [createChapter("全文", text, 0)];
}
