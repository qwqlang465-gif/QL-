import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import type { Book, ReaderSettings, ReaderTheme } from "../types/book";
import { useLibraryStore } from "../store/useLibraryStore";
import { useReaderSettingsStore } from "../store/useReaderSettingsStore";
import { throttle } from "../utils/throttle";
import { ChapterSidebar } from "./ChapterSidebar";
import { ReaderBottomBar } from "./ReaderBottomBar";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderSettingsPanel } from "./ReaderSettingsPanel";

interface ReaderProps {
  book: Book;
}

interface ThemePalette {
  background: string;
  text: string;
  panel: string;
  muted: string;
  line: string;
  shadow: string;
}

type ReaderThemeStyle = CSSProperties & {
  "--reader-bg": string;
  "--reader-text": string;
  "--reader-panel": string;
  "--reader-muted": string;
  "--reader-line": string;
  "--reader-shadow": string;
};

const themePalette: Record<ReaderTheme, ThemePalette> = {
  light: {
    background: "#f6f4ef",
    text: "#2c2c2c",
    panel: "#fffaf2",
    muted: "#817468",
    line: "rgba(71, 58, 45, 0.12)",
    shadow: "rgba(64, 46, 30, 0.12)",
  },
  dark: {
    background: "#111827",
    text: "#d1d5db",
    panel: "#1f2937",
    muted: "#9ca3af",
    line: "rgba(209, 213, 219, 0.12)",
    shadow: "rgba(0, 0, 0, 0.36)",
  },
  green: {
    background: "#eef5e8",
    text: "#263328",
    panel: "#f6fbf2",
    muted: "#65725e",
    line: "rgba(38, 51, 40, 0.12)",
    shadow: "rgba(43, 67, 38, 0.12)",
  },
  paper: {
    background: "#f4ecd8",
    text: "#3a2f24",
    panel: "#fbf3df",
    muted: "#806b58",
    line: "rgba(82, 59, 36, 0.13)",
    shadow: "rgba(82, 59, 36, 0.13)",
  },
};

const fontFamilyMap: Record<ReaderSettings["fontFamily"], string> = {
  serif: 'Georgia, "Times New Roman", "Noto Serif SC", "Songti SC", serif',
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};

function clampChapterIndex(index: number, maxLength: number): number {
  if (maxLength <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), maxLength - 1);
}

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function Reader({ book }: ReaderProps) {
  const navigate = useNavigate();
  const updateProgress = useLibraryStore((state) => state.updateProgress);
  const { settings, updateSettings, resetSettings } = useReaderSettingsStore();
  const initialChapterIndex = clampChapterIndex(book.progress.chapterIndex, book.chapters.length);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [chapterSidebarOpen, setChapterSidebarOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const isRestoringScrollRef = useRef(true);
  const currentProgressRef = useRef({
    chapterIndex: initialChapterIndex,
    chapterId: book.chapters[initialChapterIndex]?.id ?? "chapter-0",
  });

  const currentChapter = book.chapters[currentChapterIndex] ?? book.chapters[0];
  const paragraphs = useMemo(() => splitParagraphs(currentChapter?.content ?? ""), [currentChapter]);
  const palette = themePalette[settings.theme];

  const themeStyle: ReaderThemeStyle = {
    "--reader-bg": palette.background,
    "--reader-text": palette.text,
    "--reader-panel": palette.panel,
    "--reader-muted": palette.muted,
    "--reader-line": palette.line,
    "--reader-shadow": palette.shadow,
    background: palette.background,
    color: palette.text,
  };

  const articleStyle: CSSProperties = {
    maxWidth: settings.contentWidth,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    fontFamily: fontFamilyMap[settings.fontFamily],
  };

  const saveProgress = (chapterIndex: number, scrollTop: number) => {
    const chapter = book.chapters[chapterIndex];
    if (!chapter) {
      return;
    }

    currentProgressRef.current = {
      chapterIndex,
      chapterId: chapter.id,
    };

    void updateProgress(book.id, {
      chapterId: chapter.id,
      chapterIndex,
      chapterTitle: chapter.title,
      scrollTop: Math.max(0, Math.round(scrollTop)),
    });
  };

  const restoreScroll = (scrollTop: number) => {
    isRestoringScrollRef.current = true;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollTop, behavior: "auto" });
      window.setTimeout(() => {
        isRestoringScrollRef.current = false;
      }, 350);
    });
  };

  const goToChapter = (chapterIndex: number, scrollTop = 0) => {
    const nextIndex = clampChapterIndex(chapterIndex, book.chapters.length);
    setCurrentChapterIndex(nextIndex);
    setChapterSidebarOpen(false);
    setSettingsPanelOpen(false);
    saveProgress(nextIndex, scrollTop);
    restoreScroll(scrollTop);
  };

  useEffect(() => {
    const savedScrollTop = currentChapterIndex === initialChapterIndex ? book.progress.scrollTop ?? 0 : 0;
    restoreScroll(savedScrollTop);
    saveProgress(currentChapterIndex, savedScrollTop);
    // Only run for this book mount. Chapter changes are handled by goToChapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  useEffect(() => {
    const activeChapter = book.chapters[currentChapterIndex];
    if (!activeChapter) {
      return;
    }

    currentProgressRef.current = {
      chapterIndex: currentChapterIndex,
      chapterId: activeChapter.id,
    };
  }, [book.chapters, currentChapterIndex]);

  useEffect(() => {
    const saveScroll = throttle(() => {
      if (isRestoringScrollRef.current) {
        return;
      }

      const progress = currentProgressRef.current;
      void updateProgress(book.id, {
        chapterId: progress.chapterId,
        chapterIndex: progress.chapterIndex,
        chapterTitle: book.chapters[progress.chapterIndex]?.title,
        scrollTop: Math.max(0, Math.round(window.scrollY)),
      });
    }, 900);

    const handleScroll = () => {
      saveScroll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isRestoringScrollRef.current) {
        const progress = currentProgressRef.current;
        void updateProgress(book.id, {
          chapterId: progress.chapterId,
          chapterIndex: progress.chapterIndex,
          chapterTitle: book.chapters[progress.chapterIndex]?.title,
          scrollTop: Math.max(0, Math.round(window.scrollY)),
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (!isRestoringScrollRef.current) {
        const progress = currentProgressRef.current;
        void updateProgress(book.id, {
          chapterId: progress.chapterId,
          chapterIndex: progress.chapterIndex,
          chapterTitle: book.chapters[progress.chapterIndex]?.title,
          scrollTop: Math.max(0, Math.round(window.scrollY)),
        });
      }
    };
  }, [book.id, updateProgress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChapterSidebarOpen(false);
        setSettingsPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!currentChapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ecd8] px-6 text-center text-[#3a2f24]">
        <div>
          <h1 className="text-2xl font-semibold">这本书没有可阅读的内容</h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white"
          >
            返回书架
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200" style={themeStyle}>
      <ReaderHeader
        title={book.name}
        subtitle={currentChapter.title}
        onBack={() => navigate("/")}
        onOpenChapters={() => setChapterSidebarOpen(true)}
        onOpenSettings={() => setSettingsPanelOpen(true)}
      />

      <main className="px-5 pb-32 pt-24 sm:px-8">
        <article className="reader-prose mx-auto w-full" style={articleStyle}>
          <h1 className="mb-10 text-center text-[1.25em] font-semibold leading-relaxed tracking-normal">
            {currentChapter.title}
          </h1>

          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={`${currentChapter.id}-${index}`}>{paragraph}</p>)
          ) : (
            <p className="text-center opacity-70">本章暂无正文。</p>
          )}

          <div className="reader-muted mt-14 flex items-center justify-center gap-4 text-sm">
            <button
              type="button"
              disabled={currentChapterIndex === 0}
              onClick={() => goToChapter(currentChapterIndex - 1)}
              className="rounded-full px-4 py-2 transition hover:bg-black/5 disabled:opacity-40"
            >
              上一章
            </button>
            <span>
              {currentChapterIndex + 1} / {book.chapters.length}
            </span>
            <button
              type="button"
              disabled={currentChapterIndex >= book.chapters.length - 1}
              onClick={() => goToChapter(currentChapterIndex + 1)}
              className="rounded-full px-4 py-2 transition hover:bg-black/5 disabled:opacity-40"
            >
              下一章
            </button>
          </div>
        </article>
      </main>

      <ReaderBottomBar
        onPrevious={() => goToChapter(currentChapterIndex - 1)}
        onNext={() => goToChapter(currentChapterIndex + 1)}
        onOpenChapters={() => setChapterSidebarOpen(true)}
        onOpenSettings={() => setSettingsPanelOpen(true)}
        previousDisabled={currentChapterIndex === 0}
        nextDisabled={currentChapterIndex >= book.chapters.length - 1}
      />

      <ChapterSidebar
        open={chapterSidebarOpen}
        chapters={book.chapters}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={(chapterIndex) => goToChapter(chapterIndex)}
        onClose={() => setChapterSidebarOpen(false)}
      />

      <ReaderSettingsPanel
        open={settingsPanelOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        onClose={() => setSettingsPanelOpen(false)}
      />
    </div>
  );
}
