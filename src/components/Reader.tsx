import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { Book, Bookmark, ReaderSettings, ReaderTheme, SearchResult } from "../types/book";
import { useLibraryStore } from "../store/useLibraryStore";
import { useReaderSettingsStore } from "../store/useReaderSettingsStore";
import { formatProgressPercent } from "../utils/format";
import { applyMobileReaderControls, subscribeVolumePageTurn } from "../utils/mobileControls";
import { searchChapters, splitParagraphs, splitTextByQuery } from "../utils/search";
import { throttle } from "../utils/throttle";
import { BookmarkPanel } from "./BookmarkPanel";
import { ChapterSidebar } from "./ChapterSidebar";
import { ReaderBottomBar } from "./ReaderBottomBar";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderMorePanel } from "./ReaderMorePanel";
import { ReaderSearchPanel } from "./ReaderSearchPanel";
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

type ReaderArticleStyle = CSSProperties & {
  "--reader-paragraph-spacing": string;
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
  paper: {
    background: "#f4ecd8",
    text: "#3a2f24",
    panel: "#fbf3df",
    muted: "#806b58",
    line: "rgba(82, 59, 36, 0.13)",
    shadow: "rgba(82, 59, 36, 0.13)",
  },
  dark: {
    background: "#1b2029",
    text: "#d1d5db",
    panel: "#252d3a",
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
  warm: {
    background: "#fff0e6",
    text: "#3b2a22",
    panel: "#fff7ef",
    muted: "#8a6758",
    line: "rgba(96, 54, 34, 0.12)",
    shadow: "rgba(96, 54, 34, 0.13)",
  },
  blue: {
    background: "#eaf1f7",
    text: "#243241",
    panel: "#f6fbff",
    muted: "#607286",
    line: "rgba(36, 50, 65, 0.12)",
    shadow: "rgba(36, 50, 65, 0.12)",
  },
  night: {
    background: "#0b1020",
    text: "#b9c3d4",
    panel: "#121827",
    muted: "#7f8aa0",
    line: "rgba(185, 195, 212, 0.1)",
    shadow: "rgba(0, 0, 0, 0.48)",
  },
};

const fontFamilyMap: Record<ReaderSettings["fontFamily"], string> = {
  system:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei UI", "Noto Sans SC", system-ui, sans-serif',
  sans: '"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei UI", "Noto Sans SC", system-ui, sans-serif',
  serif: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", STSong, SimSun, Georgia, serif',
  kai: '"Kaiti SC", STKaiti, KaiTi, "BiauKai", serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};

const fontWeightMap: Record<ReaderSettings["fontWeight"], number> = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampChapterIndex(index: number, maxLength: number): number {
  if (maxLength <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), maxLength - 1);
}

function getMaxScrollTop(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function isInteractiveReaderTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest("button, a, input, select, textarea, summary, [role='button']"));
}

export function Reader({ book }: ReaderProps) {
  const navigate = useNavigate();
  const updateProgress = useLibraryStore((state) => state.updateProgress);
  const getBookmarks = useLibraryStore((state) => state.getBookmarks);
  const addBookmark = useLibraryStore((state) => state.addBookmark);
  const deleteBookmark = useLibraryStore((state) => state.deleteBookmark);
  const { settings, updateSettings, resetSettings } = useReaderSettingsStore();
  const initialChapterIndex = clampChapterIndex(book.progress.chapterIndex, book.chapters.length);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [chapterSidebarOpen, setChapterSidebarOpen] = useState(false);
  const [bookmarkPanelOpen, setBookmarkPanelOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [morePanelOpen, setMorePanelOpen] = useState(false);
  const [readingPercent, setReadingPercent] = useState(book.progress.percent ?? 0);
  const isRestoringScrollRef = useRef(true);
  const pendingParagraphScrollRef = useRef<number | null>(null);
  const pendingChapterEndScrollRef = useRef(false);
  const pageTurnStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pageTurnEffectTimerRef = useRef<number | null>(null);
  const turnPageRef = useRef<(direction: "previous" | "next") => void>(() => undefined);
  const lastDayThemeRef = useRef<ReaderTheme>(settings.theme === "night" ? "paper" : settings.theme);
  const [pageTurnEffect, setPageTurnEffect] = useState<{
    id: number;
    direction: "previous" | "next";
    mode: ReaderSettings["pageTurnMode"];
  } | null>(null);
  const currentProgressRef = useRef({
    chapterIndex: initialChapterIndex,
    chapterId: book.chapters[initialChapterIndex]?.id ?? "chapter-0",
  });

  const currentChapter = book.chapters[currentChapterIndex] ?? book.chapters[0];
  const paragraphs = useMemo(() => splitParagraphs(currentChapter?.content ?? ""), [currentChapter]);
  const searchResults = useMemo(() => searchChapters(book.chapters, searchQuery), [book.chapters, searchQuery]);
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

  const articleStyle: ReaderArticleStyle = {
    "--reader-paragraph-spacing": `${settings.paragraphSpacing}em`,
    maxWidth: settings.contentWidth,
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    fontFamily: fontFamilyMap[settings.fontFamily],
    fontWeight: fontWeightMap[settings.fontWeight],
    letterSpacing: settings.letterSpacing,
    textAlign: settings.textAlign === "justify" ? "justify" : "start",
    textJustify: settings.textAlign === "justify" ? "auto" : undefined,
    minHeight: settings.textBottomAlign ? "calc(100vh - 14rem)" : undefined,
    display: settings.textBottomAlign ? "flex" : undefined,
    flexDirection: settings.textBottomAlign ? "column" : undefined,
    justifyContent: settings.textBottomAlign ? "flex-end" : undefined,
  };

  const getReadingPercent = (chapterIndex: number, scrollTop: number) => {
    if (book.chapters.length === 0) {
      return 0;
    }

    const maxScrollTop = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const chapterRatio = clamp(scrollTop / maxScrollTop, 0, 1);
    return Math.min(100, Math.max(0, ((chapterIndex + chapterRatio) / book.chapters.length) * 100));
  };

  const saveProgress = (chapterIndex: number, scrollTop: number) => {
    const chapter = book.chapters[chapterIndex];
    if (!chapter) {
      return;
    }

    const percent = getReadingPercent(chapterIndex, scrollTop);
    setReadingPercent(percent);
    currentProgressRef.current = {
      chapterIndex,
      chapterId: chapter.id,
    };

    void updateProgress(book.id, {
      chapterId: chapter.id,
      chapterIndex,
      chapterTitle: chapter.title,
      scrollTop: Math.max(0, Math.round(scrollTop)),
      percent,
      updatedAt: Date.now(),
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
    setMorePanelOpen(false);
    saveProgress(nextIndex, scrollTop);
    restoreScroll(scrollTop);
  };

  const triggerPageTurnEffect = (direction: "previous" | "next") => {
    if (settings.pageTurnMode === "scroll" || settings.pageTurnMode === "none") {
      return;
    }

    if (pageTurnEffectTimerRef.current !== null) {
      window.clearTimeout(pageTurnEffectTimerRef.current);
    }

    setPageTurnEffect({
      id: Date.now(),
      direction,
      mode: settings.pageTurnMode,
    });

    pageTurnEffectTimerRef.current = window.setTimeout(() => {
      setPageTurnEffect(null);
      pageTurnEffectTimerRef.current = null;
    }, 320);
  };

  const finishManualPageScroll = (delay = 360) => {
    window.setTimeout(() => {
      isRestoringScrollRef.current = false;
      const progress = currentProgressRef.current;
      saveProgress(progress.chapterIndex, window.scrollY);
    }, delay);
  };

  const turnPage = (direction: "previous" | "next") => {
    if (chapterSidebarOpen || bookmarkPanelOpen || searchPanelOpen || settingsPanelOpen || morePanelOpen) {
      return;
    }

    const currentScrollTop = Math.max(0, window.scrollY);
    const maxScrollTop = getMaxScrollTop();
    const pageStep = Math.max(280, window.innerHeight * 0.82);
    const scrollBehavior: ScrollBehavior = settings.pageTurnMode === "none" ? "auto" : "smooth";
    const effectDelay = settings.pageTurnMode === "cover" || settings.pageTurnMode === "slide" || settings.pageTurnMode === "simulation"
      ? 90
      : 0;

    triggerPageTurnEffect(direction);

    if (direction === "next") {
      if (currentScrollTop >= maxScrollTop - 28) {
        if (currentChapterIndex < book.chapters.length - 1) {
          window.setTimeout(() => goToChapter(currentChapterIndex + 1, 0), effectDelay);
        }
        return;
      }

      isRestoringScrollRef.current = true;
      window.setTimeout(() => {
        window.scrollTo({ top: Math.min(maxScrollTop, currentScrollTop + pageStep), behavior: scrollBehavior });
        finishManualPageScroll(settings.pageTurnMode === "none" ? 80 : 360);
      }, effectDelay);
      return;
    }

    if (currentScrollTop <= 28) {
      if (currentChapterIndex > 0) {
        pendingChapterEndScrollRef.current = true;
        window.setTimeout(() => goToChapter(currentChapterIndex - 1, 0), effectDelay);
      }
      return;
    }

    isRestoringScrollRef.current = true;
    window.setTimeout(() => {
      window.scrollTo({ top: Math.max(0, currentScrollTop - pageStep), behavior: scrollBehavior });
      finishManualPageScroll(settings.pageTurnMode === "none" ? 80 : 360);
    }, effectDelay);
  };

  turnPageRef.current = turnPage;

  const handleReaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (isInteractiveReaderTarget(event.target)) {
      pageTurnStartRef.current = null;
      return;
    }

    pageTurnStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: window.performance.now(),
    };
  };

  const handleReaderPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = pageTurnStartRef.current;
    pageTurnStartRef.current = null;

    if (!start || isInteractiveReaderTarget(event.target)) {
      return;
    }

    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);
    const elapsed = window.performance.now() - start.time;
    const horizontalSwipe = absoluteX > 58 && absoluteX > absoluteY * 1.25;

    if (horizontalSwipe) {
      turnPage(deltaX < 0 ? "next" : "previous");
      return;
    }

    const isTap = absoluteX < 14 && absoluteY < 14 && elapsed < 520;
    if (!isTap) {
      return;
    }

    if (event.clientX <= window.innerWidth * 0.36) {
      turnPage("previous");
    } else if (event.clientX >= window.innerWidth * 0.64) {
      turnPage("next");
    }
  };

  const scrollToParagraph = (paragraphIndex: number) => {
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(`[data-reader-paragraph="${paragraphIndex}"]`);
      if (!target) {
        return;
      }

      isRestoringScrollRef.current = true;
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      window.setTimeout(() => {
        isRestoringScrollRef.current = false;
        saveProgress(currentProgressRef.current.chapterIndex, window.scrollY);
      }, 480);
    }, 420);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setActiveSearchQuery(searchQuery);

    if (result.chapterIndex === currentChapterIndex) {
      goToChapter(result.chapterIndex, 0);
      scrollToParagraph(result.paragraphIndex);
    } else {
      pendingParagraphScrollRef.current = result.paragraphIndex;
      goToChapter(result.chapterIndex, 0);
    }

    setSearchPanelOpen(false);
  };

  const getVisibleExcerpt = () => {
    const paragraphElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reader-paragraph]"));
    const visibleParagraph = paragraphElements.find((paragraph) => {
      const rect = paragraph.getBoundingClientRect();
      return rect.bottom > 96 && rect.top < window.innerHeight * 0.72;
    });
    const text = visibleParagraph?.textContent?.trim() || paragraphs[0] || currentChapter.title;
    return text.length > 90 ? `${text.slice(0, 90)}...` : text;
  };

  const handleAddBookmark = async () => {
    const bookmark = await addBookmark(book.id, {
      chapterId: currentChapter.id,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChapter.title,
      scrollTop: Math.max(0, Math.round(window.scrollY)),
      excerpt: getVisibleExcerpt(),
    });

    if (bookmark) {
      setBookmarks((currentBookmarks) => {
        const withoutDuplicate = currentBookmarks.filter((item) => item.id !== bookmark.id);
        return [bookmark, ...withoutDuplicate].sort((a, b) => b.createdAt - a.createdAt);
      });
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    await deleteBookmark(book.id, bookmarkId);
    setBookmarks((currentBookmarks) => currentBookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
  };

  const handleSelectBookmark = (bookmark: Bookmark) => {
    goToChapter(bookmark.chapterIndex, bookmark.scrollTop);
    setBookmarkPanelOpen(false);
  };

  const handleOpenSearchFromMore = () => {
    setMorePanelOpen(false);
    setSearchPanelOpen(true);
  };

  const handleOpenBookmarksFromMore = () => {
    setMorePanelOpen(false);
    setBookmarkPanelOpen(true);
  };

  const handleAddBookmarkFromMore = () => {
    void handleAddBookmark();
    setMorePanelOpen(false);
  };

  const toggleNightTheme = () => {
    if (settings.theme === "night") {
      updateSettings({ theme: lastDayThemeRef.current });
      return;
    }

    lastDayThemeRef.current = settings.theme;
    updateSettings({ theme: "night" });
  };

  const renderParagraph = (paragraph: string, index: number) => {
    const parts = splitTextByQuery(paragraph, activeSearchQuery);
    return (
      <p key={`${currentChapter.id}-${index}`} data-reader-paragraph={index}>
        {parts.map((part, partIndex) =>
          part.match ? (
            <mark key={`${index}-${partIndex}`} className="rounded bg-primary/20 px-0.5 text-inherit">
              {part.text}
            </mark>
          ) : (
            <span key={`${index}-${partIndex}`}>{part.text}</span>
          ),
        )}
      </p>
    );
  };

  useEffect(() => {
    const savedScrollTop = currentChapterIndex === initialChapterIndex ? book.progress.scrollTop ?? 0 : 0;
    restoreScroll(savedScrollTop);
    saveProgress(currentChapterIndex, savedScrollTop);
    // Only run for this book mount. Chapter changes are handled by goToChapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  useEffect(() => {
    let mounted = true;

    const loadBookmarks = async () => {
      const loadedBookmarks = await getBookmarks(book.id);
      if (mounted) {
        setBookmarks(loadedBookmarks);
      }
    };

    void loadBookmarks();

    return () => {
      mounted = false;
    };
  }, [book.id, getBookmarks]);

  useEffect(() => {
    const paragraphIndex = pendingParagraphScrollRef.current;

    if (paragraphIndex === null) {
      return;
    }

    pendingParagraphScrollRef.current = null;
    scrollToParagraph(paragraphIndex);
    // scrollToParagraph intentionally reads the freshly rendered chapter DOM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex, paragraphs]);

  useEffect(() => {
    if (!pendingChapterEndScrollRef.current) {
      return;
    }

    pendingChapterEndScrollRef.current = false;
    window.setTimeout(() => {
      const targetScrollTop = getMaxScrollTop();
      restoreScroll(targetScrollTop);
      finishManualPageScroll(420);
    }, 80);
    // finishManualPageScroll and restoreScroll intentionally read current document layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex, paragraphs.length]);

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
    const saveCurrentScroll = (syncVisiblePercent = true) => {
      const progress = currentProgressRef.current;
      const scrollTop = Math.max(0, Math.round(window.scrollY));
      const percent = getReadingPercent(progress.chapterIndex, scrollTop);
      if (syncVisiblePercent) {
        setReadingPercent(percent);
      }

      void updateProgress(book.id, {
        chapterId: progress.chapterId,
        chapterIndex: progress.chapterIndex,
        chapterTitle: book.chapters[progress.chapterIndex]?.title,
        scrollTop,
        percent,
        updatedAt: Date.now(),
      });
    };

    const saveScroll = throttle(() => {
      if (!isRestoringScrollRef.current) {
        saveCurrentScroll();
      }
    }, 900);

    const handleScroll = () => {
      saveScroll();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !isRestoringScrollRef.current) {
        saveCurrentScroll();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (!isRestoringScrollRef.current) {
        saveCurrentScroll(false);
      }
    };
  }, [book.chapters, book.id, updateProgress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChapterSidebarOpen(false);
        setBookmarkPanelOpen(false);
        setSearchPanelOpen(false);
        setSettingsPanelOpen(false);
        setMorePanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (settings.theme !== "night") {
      lastDayThemeRef.current = settings.theme;
    }
  }, [settings.theme]);

  useEffect(() => {
    void applyMobileReaderControls(settings);
  }, [
    settings.edgeToEdge,
    settings.hideNavigationBar,
    settings.hideStatusBar,
    settings.keepScreenOn,
    settings.volumeKeyPageTurn,
  ]);

  useEffect(() => subscribeVolumePageTurn((direction) => turnPageRef.current(direction)), []);

  useEffect(
    () => () => {
      if (pageTurnEffectTimerRef.current !== null) {
        window.clearTimeout(pageTurnEffectTimerRef.current);
      }
    },
    [],
  );

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
        onOpenSearch={() => setSearchPanelOpen(true)}
        onOpenChapters={() => setChapterSidebarOpen(true)}
        onOpenBookmarks={() => setBookmarkPanelOpen(true)}
        onOpenSettings={() => setMorePanelOpen(true)}
      />

      <main
        className={[
          "reader-page-touch px-5 pb-32 pt-24 sm:px-8",
          pageTurnEffect?.mode === "slide" ? `reader-slide-${pageTurnEffect.direction}` : "",
        ].join(" ")}
        onPointerDown={handleReaderPointerDown}
        onPointerUp={handleReaderPointerUp}
        onPointerCancel={() => {
          pageTurnStartRef.current = null;
        }}
      >
        <article className="reader-prose mx-auto w-full" style={articleStyle}>
          <h1 className="mb-10 text-center text-[1.25em] font-semibold leading-relaxed tracking-normal">
            {currentChapter.title}
          </h1>

          {paragraphs.length > 0 ? (
            paragraphs.map(renderParagraph)
          ) : (
            <p className="text-center opacity-70">本章暂无正文。</p>
          )}

          <div className="reader-muted mt-14 flex flex-wrap items-center justify-center gap-4 text-sm">
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
            <span>已读 {formatProgressPercent(readingPercent)}</span>
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

      {pageTurnEffect && pageTurnEffect.mode !== "slide" ? (
        <div
          key={pageTurnEffect.id}
          className={[
            "reader-page-turn fixed inset-0 z-20 pointer-events-none",
            `reader-page-turn-${pageTurnEffect.mode}-${pageTurnEffect.direction}`,
          ].join(" ")}
        />
      ) : null}

      <ReaderBottomBar
        onOpenChapters={() => setChapterSidebarOpen(true)}
        onOpenAppearance={() => setSettingsPanelOpen(true)}
        onOpenMore={() => setMorePanelOpen(true)}
        onToggleNight={toggleNightTheme}
        isNightMode={settings.theme === "night"}
      />

      <ReaderSearchPanel
        open={searchPanelOpen}
        query={searchQuery}
        results={searchResults}
        onQueryChange={setSearchQuery}
        onSelectResult={handleSelectSearchResult}
        onClose={() => setSearchPanelOpen(false)}
      />

      <ChapterSidebar
        open={chapterSidebarOpen}
        chapters={book.chapters}
        currentChapterIndex={currentChapterIndex}
        onSelectChapter={(chapterIndex) => goToChapter(chapterIndex)}
        onClose={() => setChapterSidebarOpen(false)}
      />

      <BookmarkPanel
        open={bookmarkPanelOpen}
        bookmarks={bookmarks}
        onAddBookmark={handleAddBookmark}
        onSelectBookmark={handleSelectBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onClose={() => setBookmarkPanelOpen(false)}
      />

      <ReaderMorePanel
        open={morePanelOpen}
        settings={settings}
        onClose={() => setMorePanelOpen(false)}
        onBack={() => navigate("/")}
        onPrevious={() => goToChapter(currentChapterIndex - 1)}
        onNext={() => goToChapter(currentChapterIndex + 1)}
        onOpenSearch={handleOpenSearchFromMore}
        onOpenBookmarks={handleOpenBookmarksFromMore}
        onAddBookmark={handleAddBookmarkFromMore}
        onUpdateSettings={updateSettings}
        previousDisabled={currentChapterIndex === 0}
        nextDisabled={currentChapterIndex >= book.chapters.length - 1}
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
