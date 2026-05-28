import type { BookFormat } from "../types/book";

export interface DecodedTextFile {
  text: string;
  encoding: string;
}

const SUPPORTED_ENCODINGS: Record<string, string> = {
  auto: "auto",
  "utf-8": "utf-8",
  utf8: "utf-8",
  gb18030: "gb18030",
  gbk: "gb18030",
  "utf-16": "utf-16le",
  "utf-16le": "utf-16le",
  "utf-16be": "utf-16be",
};

const DECODER_LABELS: Record<string, string> = {
  "utf-8": "UTF-8",
  gb18030: "GB18030",
  "utf-16le": "UTF-16LE",
  "utf-16be": "UTF-16BE",
};

interface TextQuality {
  replacementCount: number;
  controlCount: number;
  nullCount: number;
  privateUseCount: number;
}

export function getFileFormat(file: File): BookFormat | undefined {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".epub") || file.type === "application/epub+zip") {
    return "epub";
  }

  if (fileName.endsWith(".txt") || file.type === "text/plain") {
    return "txt";
  }

  return undefined;
}

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  try {
    return await file.arrayBuffer();
  } catch (error) {
    console.error("Failed to read file as ArrayBuffer.", error);
    throw new Error("读取文件失败，请重新选择文件。");
  }
}

export async function readTextFile(file: File, encoding: string): Promise<DecodedTextFile> {
  const normalizedEncoding = SUPPORTED_ENCODINGS[encoding.toLowerCase()] ?? "auto";
  const buffer = await fileToArrayBuffer(file);
  return decodeTextBuffer(buffer, normalizedEncoding);
}

export function decodeTextBuffer(buffer: ArrayBuffer, encoding: string): DecodedTextFile {
  const bytes = new Uint8Array(buffer);
  const normalizedEncoding = SUPPORTED_ENCODINGS[encoding.toLowerCase()] ?? "auto";

  if (normalizedEncoding === "auto") {
    return decodeTextBufferAutomatically(bytes);
  }

  const text = decodeWithEncoding(bytes, normalizedEncoding, normalizedEncoding === "utf-8");
  assertReadableText(text, normalizedEncoding);

  return {
    text,
    encoding: DECODER_LABELS[normalizedEncoding] ?? normalizedEncoding.toUpperCase(),
  };
}

function decodeTextBufferAutomatically(bytes: Uint8Array): DecodedTextFile {
  const bomEncoding = detectBomEncoding(bytes);
  if (bomEncoding) {
    return {
      text: decodeWithEncoding(bytes, bomEncoding, false),
      encoding: DECODER_LABELS[bomEncoding],
    };
  }

  const utf16Encoding = detectUtf16ByNullPattern(bytes);
  if (utf16Encoding) {
    const text = decodeWithEncoding(bytes, utf16Encoding, false);
    assertReadableText(text, utf16Encoding);
    return {
      text,
      encoding: DECODER_LABELS[utf16Encoding],
    };
  }

  try {
    const text = decodeWithEncoding(bytes, "utf-8", true);
    assertReadableText(text, "utf-8");
    return {
      text,
      encoding: "UTF-8",
    };
  } catch {
    const text = decodeWithEncoding(bytes, "gb18030", false);
    assertReadableText(text, "gb18030");
    return {
      text,
      encoding: "GB18030",
    };
  }
}

function decodeWithEncoding(bytes: Uint8Array, encoding: string, fatal: boolean): string {
  try {
    return new TextDecoder(encoding, { fatal }).decode(bytes);
  } catch (error) {
    console.error(`TextDecoder failed for ${encoding}.`, error);

    if (encoding === "gb18030") {
      throw new Error("当前浏览器不支持 GB18030 解码，请换一个现代浏览器，或先把 TXT 转为 UTF-8。");
    }

    if (encoding.startsWith("utf-16")) {
      throw new Error("当前浏览器不支持 UTF-16 解码，请先把 TXT 转为 UTF-8。");
    }

    throw new Error("文本解码失败，请尝试切换编码后重新导入。");
  }
}

function detectBomEncoding(bytes: Uint8Array): string | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return "utf-16le";
  }

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }

  return undefined;
}

function detectUtf16ByNullPattern(bytes: Uint8Array): string | undefined {
  const sampleLength = Math.min(bytes.length, 4096);
  if (sampleLength < 64) {
    return undefined;
  }

  let evenNulls = 0;
  let oddNulls = 0;

  for (let index = 0; index < sampleLength; index += 1) {
    if (bytes[index] !== 0) {
      continue;
    }

    if (index % 2 === 0) {
      evenNulls += 1;
    } else {
      oddNulls += 1;
    }
  }

  const pairs = sampleLength / 2;
  const evenRatio = evenNulls / pairs;
  const oddRatio = oddNulls / pairs;

  if (oddRatio > 0.28 && oddRatio > evenRatio * 4) {
    return "utf-16le";
  }

  if (evenRatio > 0.28 && evenRatio > oddRatio * 4) {
    return "utf-16be";
  }

  return undefined;
}

function getTextQuality(text: string): TextQuality {
  let replacementCount = 0;
  let controlCount = 0;
  let nullCount = 0;
  let privateUseCount = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);

    if (char === "\uFFFD") {
      replacementCount += 1;
    }

    if (char === "\0") {
      nullCount += 1;
    }

    if ((code >= 0 && code <= 8) || (code >= 14 && code <= 31)) {
      controlCount += 1;
    }

    if (code >= 0xe000 && code <= 0xf8ff) {
      privateUseCount += 1;
    }
  }

  return {
    replacementCount,
    controlCount,
    nullCount,
    privateUseCount,
  };
}

function assertReadableText(text: string, encoding: string): void {
  const quality = getTextQuality(text);
  const seriousBadChars = quality.replacementCount + quality.controlCount + quality.nullCount + quality.privateUseCount;
  const badRatio = text.length > 0 ? seriousBadChars / text.length : 0;

  if (quality.nullCount > 0 || quality.controlCount > 8 || quality.replacementCount > 12 || badRatio > 0.02) {
    const label = DECODER_LABELS[encoding] ?? encoding.toUpperCase();
    throw new Error(`使用 ${label} 解码后仍像乱码，请改用“自动识别”或换一种编码重新导入。`);
  }
}
