package in.systimus.rtpl;

import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.view.View;
import android.view.Window;
import androidx.core.view.ViewCompat;
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

    private Integer top;
    private Integer bottom;
    private boolean darkStatusIcons;
    private boolean darkNavIcons;

    @PluginMethod
    public void setColors(PluginCall call) {
        final int topColor;
        int bottomColor;
        try {
            topColor = parse(call.getString("top", "#41249A"));
            bottomColor = parse(call.getString("bottom", "#FFFFFF"));
        } catch (IllegalArgumentException e) {
            call.reject("Colours must look like #RRGGBB");
            return;
        }
        boolean darkNav = Boolean.TRUE.equals(call.getBoolean("darkNavIcons", false));

        // Android 7 cannot draw dark navigation buttons, so a light bar would hide them.
        if (darkNav && Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            bottomColor = Color.BLACK;
            darkNav = false;
        }

        top = topColor;
        bottom = bottomColor;
        darkStatusIcons = Boolean.TRUE.equals(call.getBoolean("darkStatusIcons", false));
        darkNavIcons = darkNav;

        getBridge()
            .executeOnMainThread(() -> {
                if (apply()) call.resolve();
                else call.reject("No activity");
            });
    }

    /** Capacitor's SystemBars resets the window background on rotation and theme changes. */
    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        if (top != null) getBridge().getWebView().post(this::apply);
    }

    private boolean apply() {
        if (getActivity() == null || top == null || bottom == null) return false;

        Window window = getActivity().getWindow();
        View decor = window.getDecorView();

        // Bar colours apply up to Android 14; from 15 the page itself shows behind the bars.
        window.setStatusBarColor(top);
        window.setNavigationBarColor(bottom);

        // When the WebView is inset rather than drawn behind the bars (older WebViews), the bar
        // areas show the decor view: paint its top in the header colour and its bottom in the
        // tab bar colour.
        decor.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[] { top, top, bottom, bottom }));
        // A new decor background resets its padding, which is how Capacitor keeps the page out
        // from under the bars, so have the insets applied again.
        ViewCompat.requestApplyInsets(decor);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);
        controller.setAppearanceLightStatusBars(darkStatusIcons);
        controller.setAppearanceLightNavigationBars(darkNavIcons);
        return true;
    }

    /** Color.parseColor, plus the short #RGB form that minified CSS produces. */
    private static int parse(String value) {
        String color = value.trim();
        if (color.matches("#[0-9a-fA-F]{3}")) {
            color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
        }
        return Color.parseColor(color);
    }
}
