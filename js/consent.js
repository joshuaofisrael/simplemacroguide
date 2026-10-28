/* Simple Macro Guide cookie banner (Google Consent Mode v2).
   Defaults (set inline in each page head): analytics_storage, ad_storage, ad_user_data, ad_personalization denied.
   The Google Analytics 4 tag is downloaded only after Accept. Reject or no choice never loads gtag.js.
   The choice is kept in localStorage. Any element with data-consent-open reopens the banner. */
(function () {
  var KEY = "mtm-analytics-consent";
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function g() { if (typeof window.gtag === "function") window.gtag.apply(null, arguments); }
  function grant() {
    g("consent", "update", { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  }
  function loadGa() {
    if (window.__mtmGaLoaded || !window.__mtmGaId) return;
    window.__mtmGaLoaded = true;
    grant();
    g("js", new Date());
    g("config", window.__mtmGaId, { allow_google_signals: false });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(window.__mtmGaId);
    document.head.appendChild(s);
  }
  function clearGa() {
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n === "_ga" || n.indexOf("_ga_") === 0) {
        ["", "; domain=." + host, "; domain=" + host].forEach(function (d) {
          document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }
  var css =
    "#mtm-consent{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fff;color:#1a1a1a;border-top:3px solid #2a6f6f;box-shadow:0 -2px 10px rgba(0,0,0,.12);padding:.75rem 1rem;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
    "#mtm-consent .in{max-width:64rem;margin:0 auto;display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}" +
    "#mtm-consent p{margin:0;flex:1 1 22rem}#mtm-consent a{color:#2a6f6f;text-decoration:underline}" +
    "#mtm-consent .b{display:flex;gap:.5rem}#mtm-consent button{font:inherit;padding:.45rem 1.1rem;border-radius:4px;border:2px solid #2a6f6f;cursor:pointer;min-height:44px}" +
    "#mtm-consent .acc{background:#2a6f6f;color:#fff}#mtm-consent .rej{background:#fff;color:#2a6f6f}" +
    "#mtm-consent button:focus-visible{outline:3px solid #b45309;outline-offset:2px}" +
    ".consent-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}";
  function style() {
    if (document.getElementById("mtm-consent-css")) return;
    var s = document.createElement("style"); s.id = "mtm-consent-css"; s.textContent = css; document.head.appendChild(s);
  }
  function close() { var el = document.getElementById("mtm-consent"); if (el) el.parentNode.removeChild(el); }
  function choose(v) {
    save(v);
    if (v === "granted") loadGa();
    else {
      g("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      clearGa();
    }
    close();
  }
  function show(focus) {
    style();
    if (document.getElementById("mtm-consent")) return;
    var box = document.createElement("div");
    box.id = "mtm-consent";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Cookie choices");
    box.innerHTML =
      '<div class="in"><p>With your permission we use Google Analytics cookies to count visits, and Google may use advertising cookies. ' +
      'Nothing from Google Analytics loads unless you choose Accept. ' +
      '<a href="/privacy/#google-analytics">Privacy Policy</a></p>' +
      '<div class="b"><button type="button" class="acc">Accept</button>' +
      '<button type="button" class="rej">Reject</button></div></div>';
    box.querySelector(".acc").addEventListener("click", function () { choose("granted"); });
    box.querySelector(".rej").addEventListener("click", function () { choose("denied"); });
    document.body.appendChild(box);
    if (focus) box.querySelector(".acc").focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-consent-open]") : null;
    if (t) { e.preventDefault(); show(true); }
  });
  function init() {
    var v = read();
    if (v === "granted") loadGa();
    else if (v !== "denied") show(false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
