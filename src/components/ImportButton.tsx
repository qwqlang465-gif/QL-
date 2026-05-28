import { useRef, useState, type Ref } from "react";
import { Upload } from "lucide-react";

interface ImportButtonProps {
  loading: boolean;
  onImport: (file: File, encoding: string) => Promise<void>;
  buttonRef?: Ref<HTMLButtonElement>;
}

const encodingOptions = [
  { label: "自动识别", value: "auto" },
  { label: "UTF-8", value: "utf-8" },
  { label: "GB18030", value: "gb18030" },
  { label: "UTF-16LE", value: "utf-16le" },
  { label: "UTF-16BE", value: "utf-16be" },
];

export function ImportButton({ loading, onImport, buttonRef }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [encoding, setEncoding] = useState("auto");

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onImport(file, encoding);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex min-h-11 items-center gap-2 rounded-full bg-reader-card px-4 text-sm text-reader-muted shadow-shelf">
        <span>TXT 编码</span>
        <select
          value={encoding}
          onChange={(event) => setEncoding(event.target.value)}
          className="bg-transparent text-reader-ink outline-none"
          disabled={loading}
        >
          {encodingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.epub,text/plain,application/epub+zip"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={openFilePicker}
        disabled={loading}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white shadow-shelf transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload size={18} />
        {loading ? "导入中..." : "导入 TXT / EPUB"}
      </button>
    </div>
  );
}
