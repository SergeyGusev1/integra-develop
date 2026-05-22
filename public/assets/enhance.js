/* ============================================================
   Integra Develop — enhancement layer (ADDITIVE, runs after React).
   Vanilla JS, no deps, wrapped in try/catch; never blocks the app.
   Targets STABLE hooks (#home, [data-fx], [data-magnetic], [data-admin])
   so it survives rebuilds. Does NOT touch backend, reveal, count-up.
   ============================================================ */
(function () {
  "use strict";
  if (window.__integraFX) return;
  window.__integraFX = true;

  var reduce = false, isTouch = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  try { isTouch = matchMedia("(hover: none), (pointer: coarse)").matches || "ontouchstart" in window; } catch (e) {}
  var smallScreen = (window.innerWidth || 1200) <= 1000;

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function mk(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function safe(fn) { try { return fn(); } catch (e) {} }

  function whenReady(selector, cb, timeout) {
    var found = $(selector);
    if (found) { cb(found); return; }
    var done = false;
    var obs = new MutationObserver(function () {
      var el = $(selector);
      if (el && !done) { done = true; obs.disconnect(); cb(el); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { if (!done) { done = true; obs.disconnect(); var el = $(selector); if (el) cb(el); } }, timeout || 8000);
  }

  function overlayOpen() { return !!$("[data-admin]"); }

  /* ---------------- Perlin noise (classic 2D) ---------------- */
  function makePerlin() {
    var p = new Uint8Array(512), perm = [];
    for (var i = 0; i < 256; i++) perm[i] = i;
    for (var i = 255; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (var i = 0; i < 512; i++) p[i] = perm[i & 255];
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function grad(h, x, y) { var u = (h & 1) ? -x : x, v = (h & 2) ? -y : y; return u + v; }
    return function (x, y) {
      var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      var u = fade(x), v = fade(y);
      var a = p[X] + Y, b = p[X + 1] + Y;
      return lerp(lerp(grad(p[a], x, y), grad(p[b], x - 1, y), u),
                  lerp(grad(p[a + 1], x, y - 1), grad(p[b + 1], x - 1, y - 1), u), v);
    };
  }

  var pointer = { x: -9999, y: -9999, active: false };
  var hidden = false;
  document.addEventListener("visibilitychange", function () { hidden = document.hidden; });
  window.addEventListener("mousemove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }, { passive: true });

  /* 1. GRAIN */
  function initGrain() { if (reduce) return; document.body.appendChild(mk("div", "integra-grain")); }

  /* 2. SCROLL PROGRESS */
  function initProgress() {
    var bar = mk("div", "integra-progress");
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      bar.style.width = clamp((h.scrollTop || window.pageYOffset) / max, 0, 1) * 100 + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* 3. CUSTOM MAGNETIC CURSOR */
  function initCursor() {
    if (reduce || isTouch || smallScreen) return;
    var ring = mk("div", "integra-cursor is-hidden");
    var dot = mk("div", "integra-cursor-dot is-hidden");
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("integra-cursor-on");
    var rx = window.innerWidth / 2, ry = window.innerHeight / 2, shown = false;
    var hoverSel = 'a,button,input,textarea,select,[data-fx="card"],[data-fx="contact-item"],[data-magnetic],[role="button"]';
    window.addEventListener("mousemove", function (e) {
      dot.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0) translate(-50%,-50%)";
      if (!shown) { shown = true; ring.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); }
    }, { passive: true });
    document.addEventListener("mouseover", function (e) { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add("is-hover"); });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) {
        var to = e.relatedTarget;
        if (!to || !(to.closest && to.closest(hoverSel))) ring.classList.remove("is-hover");
      }
    });
    document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
    document.addEventListener("mouseleave", function () { ring.classList.add("is-hidden"); dot.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", function () { if (shown) { ring.classList.remove("is-hidden"); dot.classList.remove("is-hidden"); } });
    (function loop() {
      rx = lerp(rx, pointer.x, 0.18); ry = lerp(ry, pointer.y, 0.18);
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* 4. INTRO CURTAIN (once per session) */
  function initIntro(done) {
    var KEY = "integraIntroShown", seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
    if (reduce || seen) { done(); return; }
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    var wrap = mk("div", "integra-intro");
    var word = mk("div", "integra-intro__word");
    "INTEGRA".split("").forEach(function (ch) { var b = document.createElement("b"); b.textContent = ch; word.appendChild(b); });
    var line = mk("div", "integra-intro__line");
    var mark = mk("div", "integra-intro__mark"); mark.textContent = "Develop Studio";
    wrap.appendChild(word); wrap.appendChild(line); wrap.appendChild(mark);
    document.body.appendChild(wrap);
    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      safe(function () { wrap.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], { duration: 850, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }); });
      setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); done(); }, 870);
    }
    safe(function () {
      var letters = $all("b", word);
      word.style.opacity = 1;
      letters.forEach(function (b, i) { b.animate([{ opacity: 0, transform: "translateY(70%)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 700, delay: 120 + i * 55, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }); });
      line.animate([{ width: "0px" }, { width: "120px" }], { duration: 800, delay: 560, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      mark.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 760, fill: "forwards" });
    });
    wrap.addEventListener("click", finish);
    setTimeout(finish, 1850);
    setTimeout(finish, 3200);
  }

  /* 5. HERO FLOW-FIELD */
  function initHeroField(hero) {
    if (reduce) return;
    var glow1 = mk("div", "integra-hero-glow");
    var glow2 = mk("div", "integra-hero-glow is-second");
    var canvas = mk("canvas", "integra-hero-fx");
    hero.insertBefore(canvas, hero.firstChild);
    hero.insertBefore(glow2, hero.firstChild);
    hero.insertBefore(glow1, hero.firstChild);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var noise = makePerlin();
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [], time = 0, raf = 0, frame = 0, paused = false;
    function resize() {
      var r = hero.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var target = clamp(Math.floor(W * H / 2700), 90, 460);
      particles = [];
      for (var i = 0; i < target; i++) particles.push(spawn());
    }
    function spawn() { return { x: Math.random() * W, y: Math.random() * H, px: 0, py: 0, life: 40 + Math.random() * 180, ink: Math.random() < 0.16 }; }
    function step() {
      raf = requestAnimationFrame(step);
      if (hidden) return;
      if ((frame++ & 15) === 0) paused = overlayOpen();
      if (paused) return;
      time += 0.0016;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      var scale = 0.0016, rect = canvas.getBoundingClientRect();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.px = p.x; p.py = p.y;
        var n = noise(p.x * scale + time, p.y * scale - time * 0.6);
        var ang = n * Math.PI * 2.4;
        p.x += Math.cos(ang) * 1.15; p.y += Math.sin(ang) * 1.15;
        if (pointer.active) {
          var dx = p.x - (pointer.x - rect.left), dy = p.y - (pointer.y - rect.top);
          var d2 = dx * dx + dy * dy;
          if (d2 < 17000 && d2 > 1) {
            var f = (17000 - d2) / 17000 * 1.4, inv = 1 / Math.sqrt(d2);
            p.x += (-dy * inv) * f * 2.2; p.y += (dx * inv) * f * 2.2;
          }
        }
        p.life--;
        if (p.life <= 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) { particles[i] = spawn(); continue; }
        ctx.beginPath();
        ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.ink ? "rgba(26,26,26,0.07)" : "rgba(138,111,63,0.22)";
        ctx.lineWidth = p.ink ? 0.7 : 0.9;
        ctx.stroke();
      }
    }
    safe(resize);
    requestAnimationFrame(function () { canvas.style.opacity = "1"; });
    raf = requestAnimationFrame(step);
    safe(function () { new ResizeObserver(function () { safe(resize); }).observe(hero); });
    window.addEventListener("resize", function () { safe(resize); });
  }

  /* 6. ABOUT-BOX GENERATIVE HARMONOGRAPH */
  function initVisualArt(box) {
    if (reduce) return;
    var canvas = mk("canvas", "integra-visual-fx");
    box.insertBefore(canvas, box.firstChild);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), t = 0, frame = 0, paused = false;
    function resize() {
      var r = box.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      requestAnimationFrame(draw);
      if (hidden) return;
      if ((frame++ & 15) === 0) paused = overlayOpen();
      if (paused) return;
      t += 0.005;
      ctx.clearRect(0, 0, W, H);
      var cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * 0.42;
      var f1 = 3 + Math.sin(t * 0.18) * 0.6, f2 = 2, f3 = 4 + Math.cos(t * 0.13) * 0.5, f4 = 5;
      ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(138,111,63,0.5)"; ctx.beginPath();
      var steps = 1100, TT = Math.PI * 2;
      for (var i = 0; i <= steps; i++) {
        var u = i / steps * TT;
        var x = cx + R * (Math.sin(f1 * u + t) * 0.62 + Math.sin(f2 * u) * 0.34);
        var y = cy + R * (Math.cos(f3 * u) * 0.6 + Math.cos(f4 * u + t * 0.7) * 0.32);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    safe(resize);
    canvas.style.opacity = "0.55";
    requestAnimationFrame(draw);
    safe(function () { new ResizeObserver(function () { safe(resize); }).observe(box); });
    window.addEventListener("resize", function () { safe(resize); });
  }

  /* 7. MAGNETIC */
  function initMagnetic() {
    if (reduce || isTouch || smallScreen) return;
    var sel = "[data-magnetic]";
    function bind(el) {
      if (el.__mag) return; el.__mag = true;
      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect();
        var mx = e.clientX - (b.left + b.width / 2), my = e.clientY - (b.top + b.height / 2);
        el.style.transform = "translate(" + (mx * 0.32) + "px," + (my * 0.40) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(function () { el.style.transition = ""; }, 460);
      });
    }
    $all(sel).forEach(bind);
    safe(function () { new MutationObserver(function () { $all(sel).forEach(bind); }).observe(document.body, { childList: true, subtree: true }); });
  }

  /* 8. CARD TILT */
  function initTilt() {
    if (reduce || isTouch || smallScreen) return;
    var sel = '[data-fx="card"]';
    function bind(el) {
      if (el.__tilt) return; el.__tilt = true;
      el.addEventListener("mousemove", function (e) {
        var b = el.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * 5) + "deg) rotateY(" + (px * 6) + "deg) translateZ(0)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = "perspective(900px) rotateX(0) rotateY(0)"; });
    }
    $all(sel).forEach(bind);
    safe(function () { new MutationObserver(function () { $all(sel).forEach(bind); }).observe(document.body, { childList: true, subtree: true }); });
  }

  /* 9. FLOATING TELEGRAM */
  function initTelegram() {
    var a = mk("a", "integra-tg");
    a.href = "https://t.me/magnatuch"; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", "Telegram");
    a.innerHTML = '<span class="integra-tg__label">Telegram</span>' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>';
    document.body.appendChild(a);
    var ticking = false;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > (window.innerHeight || 800) * 0.55) a.classList.add("is-in"); else a.classList.remove("is-in");
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function boot() {
    safe(initGrain);
    safe(initProgress);
    safe(initCursor);
    safe(initTelegram);
    initIntro(function () {});
    whenReady("#home", function (hero) { safe(function () { initHeroField(hero); }); });
    whenReady('[data-fx="art"]', function (box) { safe(function () { initVisualArt(box); }); });
    whenReady('[data-fx="card"]', function () { safe(initTilt); });
    whenReady("[data-magnetic]", function () { safe(initMagnetic); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { safe(boot); });
  else safe(boot);
})();
