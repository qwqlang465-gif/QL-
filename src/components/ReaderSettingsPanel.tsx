import { RotateCcw, X } from "lucide-react";
import type { FontFamily, ReaderSettings, ReaderTheme } from "../types/book";
import { IconButton } from "./IconButton";

interface ReaderSettingsPanelProps {
  open: boolean;
  settings: ReaderSettings;
  onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
  onResetSettings: () => void;
  onClose: () => void;
}

const themeOptions: Array<{ value: ReaderTheme; label: string; background: string; text: string }> = [
  { value: "light", label: "浅色", background: "#f6f4ef", text: "#2c2c2c" },
  { value: "dark", label: "深色", background: "#111827", text: "#d1d5db" },
  { value: "green", label: "护眼", background: "#eef5e8", text: "#263328" },
  { value: "paper", label: "纸张", background: "#f4ecd8", text: "#3a2f24" },
];

const fontOptions: Array<{ value: FontFamily; label: string }> = [
  { value: "serif", label: "宋体" },
  { value: "sans", label: "黑体" },
  { value: "mono", label: "等宽" },
];

function roundLineHeight(value: number): number {
  return Math.round(value * 10) / 10;
}

export function ReaderSettingsPanel({
  open,
  settings,
  onUpdateSettings,
  onResetSettings,
  onClose,
}: ReaderSettingsPanelProps) {
  return (
    <div className={open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}>
      <button
        type="button"
        aria-label="关闭设置"
        className={[
          "absolute inset-0 bg-black/25 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <section
        className={[
          "reader-panel absolute inset-x-0 bottom-0 rounded-t-[28px] border-t px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">阅读设置</div>
              <div className="reader-muted mt-1 text-xs">调整会立即保存</div>
            </div>
            <IconButton icon={<RotateCcw size={18} />} label="恢复默认" onClick={onResetSettings} />
            <IconButton icon={<X size={20} />} label="关闭设置" onClick={onClose} />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>字号</span>
                <span className="reader-muted">{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: settings.fontSize - 1 })}
                  className="h-10 w-14 rounded-full bg-black/5 text-sm transition hover:bg-primary-soft hover:text-primary"
                >
                  A-
                </button>
                <input
                  type="range"
                  min={14}
                  max={28}
                  step={1}
                  value={settings.fontSize}
                  onChange={(event) => onUpdateSettings({ fontSize: Number(event.target.value) })}
                  className="reader-range min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fontSize: settings.fontSize + 1 })}
                  className="h-10 w-14 rounded-full bg-black/5 text-sm transition hover:bg-primary-soft hover:text-primary"
                >
                  A+
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>行高</span>
                  <span className="reader-muted">{settings.lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={2.4}
                  step={0.1}
                  value={settings.lineHeight}
                  onChange={(event) =>
                    onUpdateSettings({ lineHeight: roundLineHeight(Number(event.target.value)) })
                  }
                  className="reader-range w-full"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>宽度</span>
                  <span className="reader-muted">{settings.contentWidth}px</span>
                </div>
                <input
                  type="range"
                  min={560}
                  max={960}
                  step={20}
                  value={settings.contentWidth}
                  onChange={(event) => onUpdateSettings({ contentWidth: Number(event.target.value) })}
                  className="reader-range w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm">字体</div>
                <div className="grid grid-cols-3 gap-2">
                  {fontOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: option.value })}
                      className={[
                        "h-10 rounded-full text-sm transition",
                        settings.fontFamily === option.value
                          ? "bg-primary text-white"
                          : "bg-black/5 hover:bg-primary-soft hover:text-primary",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm">主题</div>
                <div className="grid grid-cols-4 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSettings({ theme: option.value })}
                      className={[
                        "flex h-12 items-center justify-center gap-1 rounded-2xl border text-xs transition",
                        settings.theme === option.value
                          ? "border-primary text-primary"
                          : "border-transparent bg-black/5 hover:bg-primary-soft",
                      ].join(" ")}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-black/10"
                        style={{ background: option.background, color: option.text }}
                      />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
