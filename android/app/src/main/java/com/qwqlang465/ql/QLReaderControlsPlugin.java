package com.qwqlang465.ql;

import android.graphics.Color;
import android.os.Build;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.ref.WeakReference;

@CapacitorPlugin(name = "QLReaderControls")
public class QLReaderControlsPlugin extends Plugin {
    private static WeakReference<QLReaderControlsPlugin> activePlugin = new WeakReference<>(null);
    private static boolean volumeKeyPageTurnEnabled = false;

    @Override
    public void load() {
        activePlugin = new WeakReference<>(this);
    }

    @PluginMethod
    public void apply(PluginCall call) {
        boolean keepScreenOn = Boolean.TRUE.equals(call.getBoolean("keepScreenOn", false));
        boolean edgeToEdge = Boolean.TRUE.equals(call.getBoolean("edgeToEdge", false));
        boolean hideStatusBar = Boolean.TRUE.equals(call.getBoolean("hideStatusBar", false));
        boolean hideNavigationBar = Boolean.TRUE.equals(call.getBoolean("hideNavigationBar", false));
        volumeKeyPageTurnEnabled = Boolean.TRUE.equals(call.getBoolean("volumeKeyPageTurn", false));

        getActivity().runOnUiThread(() -> {
            applyWindowOptions(keepScreenOn, edgeToEdge, hideStatusBar, hideNavigationBar);
            call.resolve();
        });
    }

    private void applyWindowOptions(
        boolean keepScreenOn,
        boolean edgeToEdge,
        boolean hideStatusBar,
        boolean hideNavigationBar
    ) {
        Window window = getActivity().getWindow();
        View decorView = window.getDecorView();

        if (keepScreenOn) {
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.layoutInDisplayCutoutMode = edgeToEdge
                ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT;
            window.setAttributes(attributes);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(edgeToEdge || hideStatusBar ? Color.TRANSPARENT : Color.BLACK);
            window.setNavigationBarColor(edgeToEdge || hideNavigationBar ? Color.TRANSPARENT : Color.BLACK);
        }

        boolean immersive = edgeToEdge || hideStatusBar || hideNavigationBar;
        WindowCompat.setDecorFitsSystemWindows(window, !immersive);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (hideStatusBar) {
                controller.hide(WindowInsets.Type.statusBars());
            } else {
                controller.show(WindowInsets.Type.statusBars());
            }

            if (hideNavigationBar) {
                controller.hide(WindowInsets.Type.navigationBars());
            } else {
                controller.show(WindowInsets.Type.navigationBars());
            }
        } else {
            int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
            if (edgeToEdge) {
                flags |= View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            }
            if (hideStatusBar) {
                flags |= View.SYSTEM_UI_FLAG_FULLSCREEN;
            }
            if (hideNavigationBar) {
                flags |= View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
            }
            decorView.setSystemUiVisibility(flags);
        }
    }

    public static boolean handleVolumeKey(int keyCode, int action) {
        if (!volumeKeyPageTurnEnabled) {
            return false;
        }

        if (keyCode != KeyEvent.KEYCODE_VOLUME_DOWN && keyCode != KeyEvent.KEYCODE_VOLUME_UP) {
            return false;
        }

        if (action == KeyEvent.ACTION_UP) {
            QLReaderControlsPlugin plugin = activePlugin.get();
            if (plugin != null) {
                JSObject data = new JSObject();
                data.put("direction", keyCode == KeyEvent.KEYCODE_VOLUME_DOWN ? "next" : "previous");
                plugin.notifyListeners("volumePageTurn", data);
            }
        }

        return true;
    }
}
