export function registerServiceWorker(): void {
  const canUseServiceWorkerProtocol =
    window.location.protocol === "http:" || window.location.protocol === "https:";
  const localShellProtocols = new Set(["file:", "tauri:", "capacitor:"]);
  const localShellHosts = new Set(["tauri.localhost", "ql.localhost", "capacitor.localhost"]);

  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    !canUseServiceWorkerProtocol ||
    localShellProtocols.has(window.location.protocol) ||
    localShellHosts.has(window.location.hostname)
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Failed to register QL service worker.", error);
    });
  });
}
