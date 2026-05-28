import { RotateCcw, X } from "lucide-react";
import type { FontFamily, ReaderFontWeight, ReaderPageTurnMode, ReaderSettings, ReaderTheme } from "../types/book";
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
  { value: "paper", label: "纸张", background: "#f4ecd8", text: "#3a2f24" },
  { value: "green", label: "护眼", background: "#eef5e8", text: "#263328" },
  { value: "warm", label: "暖阳", background: "#fff0e6", text: "#3b2a22" },
  { value: "blue", label: "雾蓝", background: "#eaf1f7", text: "#243241" },
  { value: "dark", label: "深灰", background: "#1b2029", text: "#d1d5db" },
  { value: "night", label: "夜间", background: "#0b1020", text: "#b9c3d4" },
];

const fontOptions: Array<{ value: FontFamily; label: string }> = [
  { value: "system", label: "系统" },
  { value: "sans", label: "黑体" },
  { value: "serif", label: "宋体" },
  { value: "kai", label: "楷体" },
  { value: "mono", label: "等宽" },
];

const fontWeightOptions: Array<{ value: ReaderFontWeight; label: string }> = [
  { value: "light", label: "细" },
  { value: "regular", label: "常规" },
  { value: "medium", label: "中" },
  { value: "bold", label: "粗" },
];

const pageTurnOptions: Array<{ value: ReaderPageTurnMode; label: string }> = [
  { value: "cover", label: "覆盖" },
  { value: "slide", label: "滑动" },
  { value: "simulation", label: "仿真" },
  { value: "scroll", label: "滚动" },
  { value: "none", label: "无" },
];

function roundLineHeight(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundSpacing(value: number): number {
  return Math.round(value * 100) / 100;
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
          "reader-panel absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] border-t px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">界面</div>
            </div>
            <IconButton icon={<RotateCcw size={18} />} label="恢复默认" onClick={onResetSettings} />
            <IconButton icon={<X size={20} />} label="关闭设置" onClick={onClose} />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm">翻页</div>
              <div className="grid grid-cols-5 gap-2 max-[430px]:grid-cols-3">
                {pageTurnOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onUpdateSettings({ pageTurnMode: option.value })}
                    className={[
                      "h-10 rounded-full px-2 text-sm transition",
                      settings.pageTurnMode === option.value
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
                  <span>段距</span>
                  <span className="reader-muted">{settings.paragraphSpacing.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.2}
                  step={0.05}
                  value={settings.paragraphSpacing}
                  onChange={(event) =>
                    onUpdateSettings({ paragraphSpacing: roundSpacing(Number(event.target.value)) })
                  }
                  className="reader-range w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>字距</span>
                  <span className="reader-muted">{settings.letterSpacing.toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={0.2}
                  value={settings.letterSpacing}
                  onChange={(event) =>
                    onUpdateSettings({ letterSpacing: roundSpacing(Number(event.target.value)) })
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
                <div className="grid grid-cols-5 gap-2 max-[430px]:grid-cols-3">
                  {fontOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: option.value })}
                      className={[
                        "h-10 rounded-full px-2 text-sm transition",
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
                <div className="mb-2 text-sm">字重</div>
                <div className="grid grid-cols-4 gap-2">
                  {fontWeightOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSettings({ fontWeight: option.value })}
                      className={[
                        "h-10 rounded-full px-2 text-sm transition",
                        settings.fontWeight === option.value
                          ? "bg-primary text-white"
                          : "bg-black/5 hover:bg-primary-soft hover:text-primary",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm">排版</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ textAlign: settings.textAlign === "justify" ? "start" : "justify" })
                    }
                    className={[
                      "h-10 rounded-full px-2 text-sm transition",
                      settings.textAlign === "justify"
                        ? "bg-primary text-white"
                        : "bg-black/5 hover:bg-primary-soft hover:text-primary",
                    ].join(" ")}
                  >
                    两端对齐
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ textBottomAlign: !settings.textBottomAlign })}
                    className={[
                      "h-10 rounded-full px-2 text-sm transition",
                      settings.textBottomAlign
                        ? "bg-primary text-white"
                        : "bg-black/5 hover:bg-primary-soft hover:text-primary",
                    ].join(" ")}
                  >
                    底部对齐
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm">主题</div>
                <div className="grid grid-cols-4 gap-2 max-[430px]:grid-cols-3">
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
