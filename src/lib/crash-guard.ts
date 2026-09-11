/**
 * Last-resort visible fallback for a client-side crash that happens before
 * (or outside) React's own error boundary can catch it - e.g. a stale HTML
 * shell requesting a JS chunk that no longer exists after a new deploy,
 * which throws/rejects during module loading rather than during render.
 * Without this, that failure mode is a permanently blank/stuck page with
 * no visible signal of what went wrong. Injected into <head> so it's
 * listening before hydration starts; see THEME_INIT_SCRIPT for the pattern.
 */
export const CRASH_GUARD_SCRIPT = `(function(){
  var shown = false;
  function show(message){
    if (shown) return;
    shown = true;
    try {
      var el = document.createElement("div");
      el.setAttribute("style", "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;background:#fff;color:#111;font-family:system-ui,sans-serif;text-align:center;");
      var h = document.createElement("div");
      h.textContent = "Barata couldn't load";
      h.setAttribute("style", "font-size:1.1rem;font-weight:600;");
      var p = document.createElement("div");
      p.textContent = (message || "Unknown error") + " - try reloading the page.";
      p.setAttribute("style", "font-size:0.85rem;color:#555;max-width:32rem;word-break:break-word;");
      var b = document.createElement("button");
      b.textContent = "Reload";
      b.setAttribute("style", "height:40px;padding:0 20px;border-radius:8px;border:0;background:#0f6e5c;color:#fff;font-size:0.9rem;cursor:pointer;");
      b.onclick = function(){ location.reload(); };
      el.appendChild(h); el.appendChild(p); el.appendChild(b);
      document.body.appendChild(el);
    } catch (e) {}
  }
  window.addEventListener("error", function(e){
    show(e && e.message ? e.message : "A script failed to load.");
  });
  window.addEventListener("unhandledrejection", function(e){
    var reason = e && e.reason;
    var message = reason && reason.message ? reason.message : String(reason || "A request failed.");
    show(message);
  });
})();`;
