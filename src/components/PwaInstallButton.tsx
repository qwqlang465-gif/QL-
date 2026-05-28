import { Download } from "lucide-react";
import { usePwaInstallPrompt } from "../hooks/usePwaInstallPrompt";

export function PwaInstallButton() {
  const { canInstall, promptInstall } = usePwaInstallPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        void promptInstall();
      }}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-reader-card px-4 text-sm font-medium text-reader-ink shadow-shelf transition hover:bg-primary-soft hover:text-primary active:scale-[0.98]"
    >
      <Download size={17} />
      安装 QL
    </button>
  );
}
