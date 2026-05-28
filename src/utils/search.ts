import type { Chapter, SearchResult } from "../types/book";

const MAX_SEARCH_RESULTS = 120;
const EXCERPT_RADIUS = 34;

export interface TextPart {
  text: string;
  match: boolean;
}

export function splitParagraphs(content: string): string[] {
  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function createExcerpt(text: string, matchIndex: number, queryLength: number): string {
  const start = Math.max(0, matchIndex - EXCERPT_RADIUS);
  const end = Math.min(text.length, matchIndex + queryLength + EXCERPT_RADIUS);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`.trim();
}

export function searchChapters(chapters: Chapter[], query: string): SearchResult[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const lowerQuery = normalizedQuery.toLowerCase();
  const results: SearchResult[] = [];

  for (const [chapterIndex, chapter] of chapters.entries()) {
    if (results.length >= MAX_SEARCH_RESULTS) {
      break;
    }

    const paragraphs = splitParagraphs(chapter.content);
    const titleMatchIndex = chapter.title.toLowerCase().indexOf(lowerQuery);

    if (titleMatchIndex >= 0) {
      results.push({
        id: `${chapter.id}-title`,
        chapterId: chapter.id,
        chapterIndex,
        chapterTitle: chapter.title,
        paragraphIndex: 0,
        excerpt: chapter.title,
      });
    }

    for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
      if (results.length >= MAX_SEARCH_RESULTS) {
        break;
      }

      const matchIndex = paragraph.toLowerCase().indexOf(lowerQuery);

      if (matchIndex >= 0) {
        results.push({
          id: `${chapter.id}-${paragraphIndex}-${matchIndex}`,
          chapterId: chapter.id,
          chapterIndex,
          chapterTitle: chapter.title,
          paragraphIndex,
          excerpt: createExcerpt(paragraph, matchIndex, normalizedQuery.length),
        });
      }
    }
  }

  return results;
}

export function splitTextByQuery(text: string, query: string): TextPart[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return [{ text, match: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const parts: TextPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);

    if (matchIndex < 0) {
      parts.push({ text: text.slice(cursor), match: false });
      break;
    }

    if (matchIndex > cursor) {
      parts.push({ text: text.slice(cursor, matchIndex), match: false });
    }

    parts.push({
      text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
      match: true,
    });
    cursor = matchIndex + normalizedQuery.length;
  }

  return parts.filter((part) => part.text);
}
