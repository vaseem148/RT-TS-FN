/**
 * "App mode" = the site is running inside the Renderways Android app
 * (Capacitor). This inline script adds `class="app"` to <html> before first
 * paint, so CSS (the `app:` variant) can swap the website chrome without a
 * flash. Kept out of 'use client' modules so the root layout can import it.
 *
 * In the app it also:
 * - defaults the theme to light (the app design is light; a saved choice wins)
 * - adds viewport-fit=cover, which lets Capacitor draw the page behind the
 *   status and navigation bars so the purple headers run to the top edge
 *   (the meta tag is already parsed — Next renders it before this script)
 *
 * For previewing in a browser: open any page with ?app=1 (and ?app=0 to undo).
 */
export const APP_MODE_SCRIPT = `(function(){try{
var q=location.search,s=localStorage;
if(q.indexOf('app=1')>-1)s.setItem('rw_app','1');
if(q.indexOf('app=0')>-1)s.removeItem('rw_app');
var c=window.Capacitor;
if(!((c&&c.isNativePlatform&&c.isNativePlatform())||/RenderwaysApp/.test(navigator.userAgent)||s.getItem('rw_app')==='1'))return;
document.documentElement.classList.add('app');
if(!s.getItem('theme'))s.setItem('theme','light');
var m=document.querySelector('meta[name=viewport]');
if(m&&m.content.indexOf('viewport-fit')<0)m.content+=', viewport-fit=cover';
}catch(e){}})();`;
