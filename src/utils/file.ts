const SUPPORTED_ENCODINGS: Record<string, string> = {
  "utf-8": "utf-8",
  utf8: "utf-8",
  gb18030: "gb18030",
};

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  try {
    return await file.arrayBuffer();
  } catch (error) {
    console.error("Failed to read file as ArrayBuffer.", error);
    throw new Error("读取 TXT 文件失败，请重新选择文件。");
  }
}

export async function readTextFile(file: File, encoding: string): Promise<string> {
  const normalizedEncoding = SUPPORTED_ENCODINGS[encoding.toLowerCase()] ?? "utf-8";
  const buffer = await fileToArrayBuffer(file);

  try {
    const decoder = new TextDecoder(normalizedEncoding, { fatal: false });
    return decoder.decode(buffer);
  } catch (error) {
    console.error(`TextDecoder does not support ${normalizedEncoding}.`, error);

    if (normalizedEncoding === "gb18030") {
      throw new Error("当前浏览器不支持 GB18030 解码，请尝试使用 UTF-8 或换一个现代浏览器。");
    }

    throw new Error("文本解码失败，请尝试切换编码后重新导入。");
  }
}
