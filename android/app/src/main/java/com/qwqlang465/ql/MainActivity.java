package com.qwqlang465.ql;

import android.os.Bundle;
import android.view.KeyEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(QLReaderControlsPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (QLReaderControlsPlugin.handleVolumeKey(event.getKeyCode(), event.getAction())) {
            return true;
        }

        return super.dispatchKeyEvent(event);
    }
}
