/**
 * "App mode" = the site is running inside the Renderways Android app
 * (Capacitor). This inline script adds `class="app"` to <html> before first
 * paint, so CSS (the `app:` variant) can swap the website chrome without a
 * flash. Kept out of 'use client' modules so the root layout can import it.
 *
 * For previewing in a browser: open any page with ?app=1 (and ?app=0 to undo).
 */
export const APP_MODE_SCRIPT = `(function(){try{
var q=location.search,s=localStorage;
if(q.indexOf('app=1')>-1)s.setItem('rw_app','1');
if(q.indexOf('app=0')>-1)s.removeItem('rw_app');
var c=window.Capacitor;
if((c&&c.isNativePlatform&&c.isNativePlatform())||/RenderwaysApp/.test(navigator.userAgent)||s.getItem('rw_app')==='1')
document.documentElement.classList.add('app');
}catch(e){}})();`;
