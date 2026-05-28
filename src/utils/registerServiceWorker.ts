export function registerServiceWorker(): void {
  const canUseServiceWorkerProtocol =
    window.location.protocol === "http:" || window.location.protocol === "https:";

  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    !canUseServiceWorkerProtocol
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Failed to register QL service worker.", error);
    });
  });
}
