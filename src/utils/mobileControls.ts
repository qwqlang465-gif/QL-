import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import type { ReaderSettings } from "../types/book";

type VolumePageTurnDirection = "previous" | "next";

interface MobileReaderControlsOptions {
  keepScreenOn: boolean;
  edgeToEdge: boolean;
  hideStatusBar: boolean;
  hideNavigationBar: boolean;
  volumeKeyPageTurn: boolean;
}

interface VolumePageTurnEvent {
  direction: VolumePageTurnDirection;
}

interface QLReaderControlsPlugin {
  apply(options: MobileReaderControlsOptions): Promise<void>;
  addListener(
    eventName: "volumePageTurn",
    listenerFunc: (event: VolumePageTurnEvent) => void,
  ): Promise<PluginListenerHandle>;
}

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
}

const QLReaderControls = registerPlugin<QLReaderControlsPlugin>("QLReaderControls");

let wakeLock: WakeLockSentinelLike | undefined;

async function syncWebWakeLock(keepScreenOn: boolean): Promise<void> {
  try {
    const navigatorWithWakeLock = navigator as unknown as NavigatorWithWakeLock;

    if (!keepScreenOn) {
      if (wakeLock) {
        await wakeLock.release();
        wakeLock = undefined;
      }
      return;
    }

    if (!wakeLock && navigatorWithWakeLock.wakeLock && document.visibilityState === "visible") {
      wakeLock = await navigatorWithWakeLock.wakeLock.request("screen");
    }
  } catch (error) {
    console.warn("QL failed to update screen wake lock.", error);
  }
}

export async function applyMobileReaderControls(settings: ReaderSettings): Promise<void> {
  const options: MobileReaderControlsOptions = {
    keepScreenOn: settings.keepScreenOn,
    edgeToEdge: settings.edgeToEdge,
    hideStatusBar: settings.hideStatusBar,
    hideNavigationBar: settings.hideNavigationBar,
    volumeKeyPageTurn: settings.volumeKeyPageTurn,
  };

  try {
    if (Capacitor.isNativePlatform()) {
      await QLReaderControls.apply(options);
    }
  } catch (error) {
    console.warn("QL failed to apply native reader controls.", error);
  }

  await syncWebWakeLock(settings.keepScreenOn);
}

export function subscribeVolumePageTurn(
  onPageTurn: (direction: VolumePageTurnDirection) => void,
): () => void {
  let active = true;
  let listenerHandle: PluginListenerHandle | undefined;

  if (Capacitor.isNativePlatform()) {
    QLReaderControls.addListener("volumePageTurn", (event) => {
      if (active) {
        onPageTurn(event.direction);
      }
    })
      .then((handle) => {
        listenerHandle = handle;
        if (!active) {
          void listenerHandle.remove();
        }
      })
      .catch((error) => {
        console.warn("QL failed to listen for volume page turn.", error);
      });
  }

  return () => {
    active = false;
    if (listenerHandle) {
      void listenerHandle.remove();
    }
  };
}
