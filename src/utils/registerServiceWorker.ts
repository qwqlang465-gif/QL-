export function registerServiceWorker(): void {
  if (
    !import.meta.env.PROD ||
    !("serviceWorker" in navigator) ||
    window.location.protocol === "file:"
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Failed to register QL service worker.", error);
    });
  });
}
