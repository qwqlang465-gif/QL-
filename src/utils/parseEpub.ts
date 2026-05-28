import JSZip from "jszip";
import type { Chapter } from "../types/book";

interface EpubParseResult {
  title?: string;
  chapters: Chapter[];
}

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties?: string;
}

const htmlMediaTypes = new Set(["application/xhtml+xml", "text/html", "application/xml"]);
const ignoredTextTags = new Set(["script", "style", "svg", "head", "metadata", "meta", "link"]);
const collectTextTags = new Set([
  "p",
  "li",
  "blockquote",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);
const containerPath = "META-INF/container.xml";

function parseXml(xml: string, label: string): Document {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = document.getElementsByTagName("parsererror")[0];

  if (parserError) {
    throw new Error(`${label} 解析失败，文件可能不是有效的 EPUB。`);
  }

  return document;
}

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function localName(element: Element): string {
  return element.localName.toLowerCase();
}

function getElementsByLocalName(root: ParentNode, name: string): Element[] {
  return Array.from(root.querySelectorAll("*")).filter((element) => localName(element) === name);
}

function getFirstTextByLocalName(root: ParentNode, name: string): string | undefined {
  const element = getElementsByLocalName(root, name)[0];
  const text = element?.textContent?.trim();
  return text || undefined;
}

function normalizePath(path: string): string {
  const parts: string[] = [];

  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return parts.join("/");
}

function dirname(path: string): string {
  const normalized = normalizePath(path);
  const slashIndex = normalized.lastIndexOf("/");
  return slashIndex >= 0 ? normalized.slice(0, slashIndex) : "";
}

function stripFragment(href: string): string {
  return href.split("#")[0];
}

function resolvePath(baseDir: string, href: string): string {
  const hrefWithoutFragment = stripFragment(href);
  return normalizePath(baseDir ? `${baseDir}/${hrefWithoutFragment}` : hrefWithoutFragment);
}

function normalizeHrefKey(path: string): string {
  return normalizePath(stripFragment(path)).toLowerCase();
}

function createFileLookup(zip: JSZip): Map<string, string> {
  const lookup = new Map<string, string>();

  for (const fileName of Object.keys(zip.files)) {
    lookup.set(normalizeHrefKey(fileName), fileName);
  }

  return lookup;
}

async function readZipText(zip: JSZip, lookup: Map<string, string>, path: string): Promise<string> {
  const candidates = [path];

  try {
    candidates.push(decodeURIComponent(path));
  } catch {
    // Keep the original path if it is not URI-encoded.
  }

  for (const candidate of candidates) {
    const exactFile = zip.file(candidate);
    if (exactFile) {
      return exactFile.async("string");
    }

    const matchedName = lookup.get(normalizeHrefKey(candidate));
    const matchedFile = matchedName ? zip.file(matchedName) : null;
    if (matchedFile) {
      return matchedFile.async("string");
    }
  }

  throw new Error(`EPUB 内缺少文件：${path}`);
}

function normalizeText(text: string): string {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function readElementText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = localName(element);

  if (ignoredTextTags.has(tagName)) {
    return "";
  }

  if (tagName === "br") {
    return "\n";
  }

  if (tagName === "img") {
    return element.getAttribute("alt") ?? element.getAttribute("title") ?? "";
  }

  return Array.from(element.childNodes)
    .map((child) => readElementText(child))
    .join("");
}

function hasCollectableChildren(element: Element): boolean {
  return Array.from(element.querySelectorAll("*")).some((child) => collectTextTags.has(localName(child)));
}

function collectTextBlocks(node: Node, blocks: string[]): void {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;
  const tagName = localName(element);

  if (ignoredTextTags.has(tagName)) {
    return;
  }

  if (collectTextTags.has(tagName)) {
    const text = normalizeText(readElementText(element));
    if (text) {
      blocks.push(text);
    }
    return;
  }

  if (!hasCollectableChildren(element)) {
    const text = normalizeText(readElementText(element));
    if (text) {
      blocks.push(text);
    }
    return;
  }

  for (const child of Array.from(element.children)) {
    collectTextBlocks(child, blocks);
  }
}

function extractHtmlText(document: Document): string {
  const root = document.body ?? document.documentElement;
  const blocks: string[] = [];

  for (const child of Array.from(root.children)) {
    collectTextBlocks(child, blocks);
  }

  const deduped = blocks.filter((block, index) => block && block !== blocks[index - 1]);
  return deduped.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractHtmlTitle(document: Document): string | undefined {
  for (const selector of ["h1", "h2", "h3", "title"]) {
    const text = document.querySelector(selector)?.textContent?.trim();
    if (text) {
      return normalizeText(text).slice(0, 80);
    }
  }

  return undefined;
}

function getRootFilePath(containerDocument: Document): string {
  const rootFile = getElementsByLocalName(containerDocument, "rootfile")[0];
  const fullPath = rootFile?.getAttribute("full-path");

  if (!fullPath) {
    throw new Error("EPUB 缺少 package 文件路径。");
  }

  return normalizePath(fullPath);
}

function getManifest(opfDocument: Document, baseDir: string): Map<string, ManifestItem> {
  const manifest = new Map<string, ManifestItem>();

  for (const item of getElementsByLocalName(opfDocument, "item")) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type") ?? "";

    if (id && href) {
      manifest.set(id, {
        id,
        href: resolvePath(baseDir, href),
        mediaType,
        properties: item.getAttribute("properties") ?? undefined,
      });
    }
  }

  return manifest;
}

function getSpineItems(opfDocument: Document, manifest: Map<string, ManifestItem>): ManifestItem[] {
  return getElementsByLocalName(opfDocument, "itemref")
    .filter((itemRef) => itemRef.getAttribute("linear") !== "no")
    .map((itemRef) => itemRef.getAttribute("idref"))
    .filter((idRef): idRef is string => Boolean(idRef))
    .map((idRef) => manifest.get(idRef))
    .filter(
      (item): item is ManifestItem =>
        item !== undefined &&
        htmlMediaTypes.has(item.mediaType) &&
        !item.properties?.split(/\s+/).includes("nav"),
    );
}

function getNavItem(manifest: Map<string, ManifestItem>): ManifestItem | undefined {
  return Array.from(manifest.values()).find((item) =>
    item.properties?.split(/\s+/).includes("nav"),
  );
}

function getNcxItem(opfDocument: Document, manifest: Map<string, ManifestItem>): ManifestItem | undefined {
  const spine = getElementsByLocalName(opfDocument, "spine")[0];
  const tocId = spine?.getAttribute("toc");

  if (tocId) {
    return manifest.get(tocId);
  }

  return Array.from(manifest.values()).find((item) => item.mediaType === "application/x-dtbncx+xml");
}

function getHrefTitleMapFromNav(document: Document, baseDir: string): Map<string, string> {
  const titleMap = new Map<string, string>();

  for (const link of Array.from(document.querySelectorAll("a[href]"))) {
    const href = link.getAttribute("href");
    const text = normalizeText(link.textContent ?? "");

    if (href && text) {
      titleMap.set(normalizeHrefKey(resolvePath(baseDir, href)), text.slice(0, 80));
    }
  }

  return titleMap;
}

function getHrefTitleMapFromNcx(document: Document, baseDir: string): Map<string, string> {
  const titleMap = new Map<string, string>();

  for (const navPoint of getElementsByLocalName(document, "navPoint")) {
    const content = getElementsByLocalName(navPoint, "content")[0];
    const src = content?.getAttribute("src");
    const text = getFirstTextByLocalName(navPoint, "text");

    if (src && text) {
      titleMap.set(normalizeHrefKey(resolvePath(baseDir, src)), normalizeText(text).slice(0, 80));
    }
  }

  return titleMap;
}

async function getTocTitleMap(
  zip: JSZip,
  lookup: Map<string, string>,
  opfDocument: Document,
  manifest: Map<string, ManifestItem>,
): Promise<Map<string, string>> {
  const navItem = getNavItem(manifest);
  if (navItem) {
    try {
      const navText = await readZipText(zip, lookup, navItem.href);
      return getHrefTitleMapFromNav(parseHtml(navText), dirname(navItem.href));
    } catch (error) {
      console.warn("Failed to parse EPUB nav document.", error);
    }
  }

  const ncxItem = getNcxItem(opfDocument, manifest);
  if (ncxItem) {
    try {
      const ncxText = await readZipText(zip, lookup, ncxItem.href);
      return getHrefTitleMapFromNcx(parseXml(ncxText, "EPUB NCX 目录"), dirname(ncxItem.href));
    } catch (error) {
      console.warn("Failed to parse EPUB NCX document.", error);
    }
  }

  return new Map<string, string>();
}

function getTitleFromToc(titleMap: Map<string, string>, href: string): string | undefined {
  const exactTitle = titleMap.get(normalizeHrefKey(href));
  if (exactTitle) {
    return exactTitle;
  }

  const hrefKey = normalizeHrefKey(href);
  const matchedEntry = Array.from(titleMap.entries()).find(([key]) => key === hrefKey || key.startsWith(`${hrefKey}#`));
  return matchedEntry?.[1];
}

function fallbackChapterTitle(index: number): string {
  return `第 ${index + 1} 章`;
}

export async function parseEpub(arrayBuffer: ArrayBuffer): Promise<EpubParseResult> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const lookup = createFileLookup(zip);
    const containerText = await readZipText(zip, lookup, containerPath);
    const containerDocument = parseXml(containerText, "EPUB container.xml");
    const rootFilePath = getRootFilePath(containerDocument);
    const opfText = await readZipText(zip, lookup, rootFilePath);
    const opfDocument = parseXml(opfText, "EPUB package");
    const baseDir = dirname(rootFilePath);
    const manifest = getManifest(opfDocument, baseDir);
    const spineItems = getSpineItems(opfDocument, manifest);

    if (spineItems.length === 0) {
      throw new Error("EPUB 没有找到可阅读章节。");
    }

    const titleMap = await getTocTitleMap(zip, lookup, opfDocument, manifest);
    const bookTitle = getFirstTextByLocalName(opfDocument, "title");
    const chapters: Chapter[] = [];

    for (const item of spineItems) {
      const chapterHtml = await readZipText(zip, lookup, item.href);
      const document = parseHtml(chapterHtml);
      const title =
        getTitleFromToc(titleMap, item.href) ??
        extractHtmlTitle(document) ??
        fallbackChapterTitle(chapters.length);
      const content = extractHtmlText(document);

      if (content || chapters.length === 0) {
        chapters.push({
          id: `chapter-${chapters.length}`,
          title,
          content,
        });
      }
    }

    if (chapters.length === 0) {
      throw new Error("EPUB 章节内容为空。");
    }

    return {
      title: bookTitle,
      chapters,
    };
  } catch (error) {
    console.error("Failed to parse EPUB.", error);

    if (error instanceof Error) {
      throw new Error(error.message || "EPUB 解析失败，请确认文件是否有效。");
    }

    throw new Error("EPUB 解析失败，请确认文件是否有效。");
  }
}
