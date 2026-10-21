package in.systimus.rtpl;

import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Colours the Android system bars to match the page: the purple app header at
 * the top, the tab bar at the bottom. The website calls this whenever the theme
 * changes (src/components/providers/system-bars-sync.tsx).
 */
@CapacitorPlugin(name = "AppBars")
public class AppBarsPlugin extends Plugin {

    @PluginMethod
    public void setColors(PluginCall call) {
        final int top;
        int bottom;
        try {
            top = Color.parseColor(call.getString("top", "#41249A").trim());
            bottom = Color.parseColor(call.getString("bottom", "#FFFFFF").trim());
        } catch (IllegalArgumentException e) {
            call.reject("Colours must look like #RRGGBB");
            return;
        }
        final boolean darkStatusIcons = Boolean.TRUE.equals(call.getBoolean("darkStatusIcons", false));
        boolean darkNavIcons = Boolean.TRUE.equals(call.getBoolean("darkNavIcons", false));

        // Android 7 cannot draw dark navigation buttons, so a light bar would hide them.
        if (darkNavIcons && Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            bottom = Color.BLACK;
            darkNavIcons = false;
        }

        final int bottomColor = bottom;
        final boolean darkNav = darkNavIcons;
        getBridge()
            .executeOnMainThread(() -> {
                Window window = getActivity().getWindow();
                // Bar colours apply up to Android 14; from 15 the page itself shows behind the bars.
                window.setStatusBarColor(top);
                window.setNavigationBarColor(bottomColor);
                // When the WebView is inset rather than drawn behind the bars (older WebViews), the
                // bar areas show the decor view, so paint its top in the header colour and its
                // bottom in the tab bar colour.
                window
                    .getDecorView()
                    .setBackground(
                        new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[] { top, top, bottomColor, bottomColor })
                    );

                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
                controller.setAppearanceLightStatusBars(darkStatusIcons);
                controller.setAppearanceLightNavigationBars(darkNav);
                call.resolve();
            });
    }
}
