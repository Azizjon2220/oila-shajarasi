/* Oila shajarasi — daraxtni chizish va boshqarish.
   Ismlar data.js faylida turadi; bu faylni o'zgartirish shart emas. */
(function () {
  "use strict";

  // O'lchamlar (piksel)
  const CW = 200, CH = 86, HG = 24, VG = 68, ROOT_GAP = 72, PANEL_W = 388;
  const MIN_K = 0.15, MAX_K = 2.5;

  const $ = (id) => document.getElementById(id);
  const viewport = $("viewport"), stage = $("stage"), linksSvg = $("links"), nodesEl = $("nodes");
  const panel = $("panel"), panelBody = $("panelBody"), noticeEl = $("notice");
  const searchInput = $("search"), resultsEl = $("results");
  const mqMobile = window.matchMedia("(max-width: 680px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICON_RINGS = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="9" r="3.8"/><circle cx="10" cy="9" r="3.8"/></svg>';
  const ICON_LINK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';
  const ICON_CLOSE = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---------- Yordamchi funksiyalar ----------

  const clampK = (k) => Math.min(MAX_K, Math.max(MIN_K, k));
  const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().replace(/[ʻʼ’‘`]/g, "'").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const yearOf = (v) => { const m = String(v || "").match(/\d{4}/); return m ? +m[0] : null; };

  // data.js da xato bo'lsa, o'zgaruvchilar umuman bo'lmasligi mumkin
  function read(getter, fallback) {
    try { const v = getter(); return v === undefined ? fallback : v; } catch (e) { return fallback; }
  }

  const cfg = {
    nomi: read(() => SHAJARA_NOMI, ""),
    tavsif: read(() => SHAJARA_TAVSIF, ""),
    namuna: read(() => NAMUNA, false) === true,
  };
  const rawList = read(() => ODAMLAR, null);

  // ---------- Ma'lumotlarni tayyorlash ----------

  const people = new Map();
  const roots = [];
  const errors = [];

  function build(list) {
    list.forEach((r, i) => {
      if (!r || typeof r !== "object") { errors.push(`${i + 1}-yozuv noto'g'ri yozilgan.`); return; }
      const label = has(r.ism) ? `"${r.ism}"` : `${i + 1}-yozuv`;
      if (!has(r.id)) { errors.push(`${label}: id raqami yozilmagan.`); return; }
      const id = String(r.id).trim();
      if (people.has(id)) {
        errors.push(`id ${id} ikki marta ishlatilgan: "${people.get(id).ism}" va ${label}. Har biriga alohida raqam bering.`);
        return;
      }
      if (!has(r.ism)) errors.push(`id ${id}: ism yozilmagan.`);
      people.set(id, {
        id,
        ism: has(r.ism) ? String(r.ism).trim() : "Noma'lum",
        jinsi: String(r.jinsi || "").trim().toLowerCase().charAt(0),
        turmush: has(r.turmush) ? String(r.turmush).trim() : "",
        tugilgan: has(r.tugilgan) ? String(r.tugilgan).trim() : "",
        vafot: has(r.vafot) ? String(r.vafot).trim() : "",
        izoh: has(r.izoh) ? String(r.izoh).trim() : "",
        parentId: has(r.farzandi) ? String(r.farzandi).trim() : null,
        parent: null,
        children: [],
        depth: 0,
        desc: 0,
        collapsed: false,
        x: 0, y: 0, w: 0,
      });
    });

    people.forEach((p) => {
      if (p.parentId === null) return;
      const par = people.get(p.parentId);
      if (!par) errors.push(`"${p.ism}" (id ${p.id}): farzandi: ${p.parentId} deb yozilgan, lekin bunday id yo'q.`);
      else if (par === p) errors.push(`"${p.ism}" (id ${p.id}): odam o'zining farzandi bo'la olmaydi.`);
      else p.parent = par;
    });

    // Aylana bo'lib qolgan bog'lanishlarni uzamiz (A — B ning farzandi, B — A ning farzandi)
    people.forEach((p) => {
      const seen = new Set([p]);
      let cur = p;
      while (cur.parent) {
        if (seen.has(cur.parent)) {
          errors.push(`"${cur.ism}" (id ${cur.id}): farzandi raqami aylana hosil qilgan — tekshirib ko'ring.`);
          cur.parent = null;
          break;
        }
        seen.add(cur.parent);
        cur = cur.parent;
      }
    });

    people.forEach((p) => (p.parent ? p.parent.children.push(p) : roots.push(p)));

    const setDepth = (p, d) => { p.depth = d; p.children.forEach((c) => setDepth(c, d + 1)); };
    const countDesc = (p) => (p.desc = p.children.reduce((s, c) => s + 1 + countDesc(c), 0));
    roots.forEach((r) => { setDepth(r, 0); countDesc(r); });
  }

  // ---------- Joylashtirish ----------

  let visible = [];
  const bounds = { w: 0, h: 0 };

  function measure(p) {
    if (p.collapsed || !p.children.length) return (p.w = CW);
    const sum = p.children.reduce((s, c) => s + measure(c), 0) + HG * (p.children.length - 1);
    return (p.w = Math.max(CW, sum));
  }

  function place(p, left) {
    p.x = left + p.w / 2;
    p.y = p.depth * (CH + VG);
    visible.push(p);
    if (p.collapsed || !p.children.length) return;
    const total = p.children.reduce((s, c) => s + c.w, 0) + HG * (p.children.length - 1);
    let cur = p.x - total / 2;
    p.children.forEach((c) => { place(c, cur); cur += c.w + HG; });
  }

  function layout() {
    visible = [];
    let left = 0;
    roots.forEach((r) => { measure(r); place(r, left); left += r.w + ROOT_GAP; });
    const maxDepth = visible.reduce((m, p) => Math.max(m, p.depth), 0);
    bounds.w = Math.max(CW, left - ROOT_GAP);
    bounds.h = (maxDepth + 1) * (CH + VG) - VG + 14;
  }

  // ---------- Chizish ----------

  let selectedId = null;

  function lineage() {
    const s = new Set();
    for (let p = people.get(selectedId); p; p = p.parent) s.add(p.id);
    return s;
  }

  function yearsText(p) {
    if (p.tugilgan && p.vafot) return `${p.tugilgan} – ${p.vafot}`;
    if (p.tugilgan) return /^\d{4}$/.test(p.tugilgan) ? `${p.tugilgan}-yil tug'ilgan` : `Tug'ilgan: ${p.tugilgan}`;
    if (p.vafot) return `Vafot: ${p.vafot}`;
    return "";
  }

  function linkPath(a, b) {
    const x1 = a.x, y1 = a.y + CH, x2 = b.x, y2 = b.y, my = y1 + VG / 2;
    if (Math.abs(x2 - x1) < 1) return `M${x1},${y1}V${y2}`;
    const r = Math.min(10, Math.abs(x2 - x1) / 2), s = x2 > x1 ? 1 : -1;
    return `M${x1},${y1}V${my - r}Q${x1},${my} ${x1 + s * r},${my}H${x2 - s * r}Q${x2},${my} ${x2},${my + r}V${y2}`;
  }

  function nodeEl(p, lin) {
    const wrap = document.createElement("div");
    wrap.className = "node";
    wrap.dataset.id = p.id;
    wrap.style.left = p.x - CW / 2 + "px";
    wrap.style.top = p.y + "px";

    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    if (p.jinsi === "e" || p.jinsi === "a") card.classList.add("g-" + p.jinsi);
    if (p.vafot) card.classList.add("deceased");
    if (lin.has(p.id)) card.classList.add(p.id === selectedId ? "selected" : "lineage");
    const years = yearsText(p);
    card.title = [p.ism, p.turmush && "Turmush o'rtog'i: " + p.turmush, years].filter(Boolean).join("\n");
    card.innerHTML =
      `<span class="name">${esc(p.ism)}</span>` +
      (p.turmush ? `<span class="spouse">${ICON_RINGS}<span>${esc(p.turmush)}</span></span>` : "") +
      (years ? `<span class="years">${esc(years)}</span>` : "");
    card.addEventListener("click", () => select(p.id));
    wrap.appendChild(card);

    if (p.children.length) {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "toggle" + (p.collapsed ? " is-collapsed" : "");
      t.textContent = p.collapsed ? "+" + p.desc : "−";
      const label = p.collapsed ? `${p.ism}ning ${p.desc} ta avlodini ko'rsatish` : `${p.ism}ning avlodlarini yashirish`;
      t.title = label;
      t.setAttribute("aria-label", label);
      t.setAttribute("aria-expanded", String(!p.collapsed));
      t.addEventListener("click", (e) => { e.stopPropagation(); toggle(p); });
      wrap.appendChild(t);
    }
    return wrap;
  }

  function render() {
    layout();
    const lin = lineage();

    linksSvg.setAttribute("width", bounds.w);
    linksSvg.setAttribute("height", bounds.h);
    let plain = "", hl = "";
    visible.forEach((p) => {
      if (!p.parent) return;
      const d = `<path${lin.has(p.id) ? ' class="hl"' : ""} d="${linkPath(p.parent, p)}"/>`;
      lin.has(p.id) ? (hl += d) : (plain += d);
    });
    linksSvg.innerHTML = plain + hl;

    const frag = document.createDocumentFragment();
    visible.forEach((p) => frag.appendChild(nodeEl(p, lin)));
    nodesEl.replaceChildren(frag);
  }

  const nodeCard = (id) => nodesEl.querySelector(`.node[data-id="${CSS.escape(id)}"] .card`);

  // ---------- Ko'rinish: siljitish va kattalashtirish ----------

  const view = { x: 0, y: 0, k: 1 };
  let anim = 0;

  function applyView() {
    stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
    let g = 24 * view.k;
    while (g < 12) g *= 2;
    viewport.style.backgroundSize = `${g}px ${g}px`;
    viewport.style.backgroundPosition = `${view.x}px ${view.y}px`;
  }

  function go(t, animate = true) {
    cancelAnimationFrame(anim);
    if (!animate || reduceMotion) { Object.assign(view, t); applyView(); return; }
    const s = { ...view }, t0 = performance.now(), D = 420;
    const step = (now) => {
      const u = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - u, 3);
      view.x = s.x + (t.x - s.x) * e;
      view.y = s.y + (t.y - s.y) * e;
      view.k = s.k + (t.k - s.k) * e;
      applyView();
      if (u < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  // Panel ochiq bo'lsa, daraxtning ko'rinib turgan qismi kichrayadi
  function visibleArea() {
    let w = viewport.clientWidth, h = viewport.clientHeight;
    if (panel.classList.contains("open")) {
      if (mqMobile.matches) h -= panel.offsetHeight;
      else w -= PANEL_W;
    }
    return { w: Math.max(w, 160), h: Math.max(h, 120) };
  }

  function zoomAt(px, py, k) {
    k = clampK(k);
    view.x = px - (px - view.x) * (k / view.k);
    view.y = py - (py - view.y) * (k / view.k);
    view.k = k;
    applyView();
  }

  function zoomBy(f) {
    const a = visibleArea(), k = clampK(view.k * f), cx = a.w / 2, cy = a.h / 2;
    go({ k, x: cx - (cx - view.x) * (k / view.k), y: cy - (cy - view.y) * (k / view.k) });
  }

  // Tepadagi xabar ochiq bo'lsa, daraxtni undan pastroqdan boshlaymiz
  const topPad = () => (noticeEl.hidden ? 40 : noticeEl.offsetTop + noticeEl.offsetHeight + 24);

  function fit(animate = true) {
    if (!visible.length) return;
    const a = visibleArea(), pad = 40, top = topPad();
    const k = clampK(Math.min((a.w - pad * 2) / bounds.w, (a.h - top - pad) / bounds.h, 1));
    go({ k, x: (a.w - bounds.w * k) / 2, y: Math.max(top, (a.h - bounds.h * k) / 2) }, animate);
  }

  function centerOn(p, k = view.k) {
    k = clampK(k);
    const a = visibleArea();
    go({ k, x: a.w / 2 - p.x * k, y: a.h / 2 - (p.y + CH / 2) * k });
  }

  function ensureVisible(p) {
    const a = visibleArea(), m = 24;
    const sx = view.x + (p.x - CW / 2) * view.k, sy = view.y + p.y * view.k;
    if (sx < m || sy < m || sx + CW * view.k > a.w - m || sy + CH * view.k > a.h - m) centerOn(p);
  }

  function initialView() {
    if (!visible.length) return;
    const a = visibleArea(), pad = 40, top = topPad();
    const kFit = Math.min((a.w - pad * 2) / bounds.w, (a.h - top - pad) / bounds.h, 1);
    if (kFit >= 0.55) { fit(false); return; }
    const k = mqMobile.matches ? 0.7 : 0.85;
    go({ k, x: a.w / 2 - roots[0].x * k, y: top }, false);
  }

  // Sichqoncha / barmoq bilan siljitish, ikki barmoq bilan kattalashtirish
  const pointers = new Map();
  let drag = null, pinch = null, suppressClickUntil = 0;

  function pinchState() {
    const [a, b] = [...pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(anim);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: view.x, y0: view.y, moved: false };
    } else if (pointers.size === 2) {
      pinch = { ...pinchState(), k0: view.k, x0: view.x, y0: view.y };
      if (drag) drag.moved = true;
      pointers.forEach((_, id) => { try { viewport.setPointerCapture(id); } catch (err) { /* allaqachon qo'yib yuborilgan */ } });
    }
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size >= 2) {
      const s = pinchState(), r = viewport.getBoundingClientRect();
      const k = clampK(pinch.k0 * (s.d / pinch.d));
      const wx = (pinch.mx - r.left - pinch.x0) / pinch.k0, wy = (pinch.my - r.top - pinch.y0) / pinch.k0;
      view.k = k;
      view.x = s.mx - r.left - wx * k;
      view.y = s.my - r.top - wy * k;
      applyView();
      return;
    }

    if (drag && drag.id === e.pointerId) {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 5) {
        drag.moved = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add("dragging");
      }
      if (drag.moved) {
        view.x = drag.x0 + dx;
        view.y = drag.y0 + dy;
        applyView();
      }
    }
  });

  function endPointer(e) {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size < 2) pinch = null;
    if (drag && drag.moved) suppressClickUntil = performance.now() + 300;
    if (pointers.size === 0) {
      drag = null;
      viewport.classList.remove("dragging");
    } else if (pointers.size === 1 && drag) {
      // Ikki barmoqdan biri ko'tarildi — qolgan barmoq bilan siljitishni davom ettiramiz
      const [id, pt] = [...pointers.entries()][0];
      drag = { id, sx: pt.x, sy: pt.y, x0: view.x, y0: view.y, moved: true };
    }
  }
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  // Siljitgandan keyin tasodifiy bosilish bo'lmasin
  viewport.addEventListener("click", (e) => {
    if (performance.now() < suppressClickUntil) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  // Bo'sh joy bosilsa — panel yopiladi
  viewport.addEventListener("click", (e) => {
    if (!e.target.closest(".node")) closePanel(false);
  });

  // Trackpad: ikki barmoq bilan siljitish, chimdib kattalashtirish (ctrl + g'ildirak)
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    cancelAnimationFrame(anim);
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewport.clientHeight : 1;
    if (e.ctrlKey || e.metaKey) {
      const r = viewport.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, view.k * Math.exp(-e.deltaY * unit * 0.01));
    } else {
      view.x -= e.deltaX * unit;
      view.y -= e.deltaY * unit;
      applyView();
    }
  }, { passive: false });

  // Tab tugmasi bilan yurganda brauzer o'zi aylantirib yubormasin — o'zimiz ko'rsatamiz
  viewport.addEventListener("scroll", () => { viewport.scrollLeft = 0; viewport.scrollTop = 0; });
  viewport.addEventListener("focusin", (e) => {
    const n = e.target.closest(".node");
    if (n && e.target.matches(":focus-visible")) ensureVisible(people.get(n.dataset.id));
  });

  $("zoomIn").addEventListener("click", () => zoomBy(1.25));
  $("zoomOut").addEventListener("click", () => zoomBy(0.8));
  $("fit").addEventListener("click", () => fit());

  // ---------- Tanlash va panel ----------

  function toggle(p) {
    const bx = view.x + p.x * view.k, by = view.y + p.y * view.k;
    p.collapsed = !p.collapsed;
    render();
    // Bosilgan karta joyidan qimirlamasin
    view.x += bx - (view.x + p.x * view.k);
    view.y += by - (view.y + p.y * view.k);
    applyView();
    const t = nodesEl.querySelector(`.node[data-id="${CSS.escape(p.id)}"] .toggle`);
    if (t) t.focus({ preventScroll: true });
  }

  function select(id, { center = false, zoom = false, updateHash = true } = {}) {
    const p = people.get(String(id));
    if (!p) return;
    for (let a = p.parent; a; a = a.parent) a.collapsed = false;
    if (noticeEl.classList.contains("info")) noticeEl.hidden = true;
    selectedId = p.id;
    render();
    openPanel(p);
    if (center) centerOn(p, zoom ? Math.max(view.k, 0.9) : view.k);
    else ensureVisible(p);
    if (updateHash) history.replaceState(null, "", "#" + encodeURIComponent(p.id));
  }

  const chip = (p, label) =>
    `<button type="button" class="chip" data-go="${esc(p.id)}"><span class="dot${p.jinsi === "e" || p.jinsi === "a" ? " g-" + p.jinsi : ""}"></span>${esc(label || p.ism)}</button>`;

  function openPanel(p) {
    const facts = [];
    if (p.tugilgan) facts.push(["Tug'ilgan", p.tugilgan]);
    if (p.vafot) facts.push(["Vafot etgan", p.vafot]);
    const yb = yearOf(p.tugilgan), yd = yearOf(p.vafot), now = new Date().getFullYear();
    if (yb && yd && yd >= yb) facts.push(["Umr ko'rgan", `${yd - yb} yil`]);
    else if (yb && !p.vafot && now - yb <= 105) facts.push(["Yoshi", `${now - yb} yosh`]);
    if (p.desc) facts.push(["Avlodlari", `${p.desc} kishi`]);

    const siblings = p.parent ? p.parent.children.filter((c) => c !== p) : [];
    const parentLabel = p.parent && (p.parent.turmush ? `${p.parent.ism} va ${p.parent.turmush}` : p.parent.ism);

    panelBody.innerHTML =
      `<div class="p-gen">${p.depth + 1}-avlod</div>` +
      `<h2 class="p-name">${esc(p.ism)}</h2>` +
      (p.turmush ? `<p class="p-spouse">${ICON_RINGS}<span>Turmush o'rtog'i: <b>${esc(p.turmush)}</b></span></p>` : "") +
      (facts.length ? `<dl class="p-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : "") +
      (p.izoh ? `<p class="p-note">${esc(p.izoh)}</p>` : "") +
      (p.parent ? `<section class="p-sec"><h3>Ota-onasi</h3><div class="chips">${chip(p.parent, parentLabel)}</div></section>` : "") +
      (siblings.length ? `<section class="p-sec"><h3>Tug'ishganlari</h3><div class="chips">${siblings.map((s) => chip(s)).join("")}</div></section>` : "") +
      (p.children.length ? `<section class="p-sec"><h3>Farzandlari (${p.children.length})</h3><div class="chips">${p.children.map((c) => chip(c)).join("")}</div></section>` : "") +
      `<button type="button" class="p-copy" data-copy>${ICON_LINK}<span>Havolani nusxalash</span></button>`;

    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    panelBody.scrollTop = 0;
  }

  function closePanel(restoreFocus = true) {
    if (!panel.classList.contains("open")) return;
    const prev = selectedId;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
    selectedId = null;
    render();
    history.replaceState(null, "", location.pathname + location.search);
    const card = restoreFocus && prev && nodeCard(prev);
    if (card) card.focus({ preventScroll: true });
  }

  panelBody.addEventListener("click", (e) => {
    const link = e.target.closest("[data-go]");
    if (link) { select(link.dataset.go, { center: true }); return; }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const label = copy.querySelector("span");
      const done = (txt) => { label.textContent = txt; setTimeout(() => (label.textContent = "Havolani nusxalash"), 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => done("Nusxalandi ✓"), () => done(location.href));
      else done(location.href);
    }
  });
  $("panelClose").addEventListener("click", () => closePanel());

  // ---------- Qidiruv ----------

  let results = [], active = -1;

  function hideResults() {
    resultsEl.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }

  function drawResults() {
    if (!results.length) {
      resultsEl.innerHTML = `<li class="empty">Hech kim topilmadi</li>`;
    } else {
      resultsEl.innerHTML = results.map((r, i) => {
        const p = r.p;
        const meta = r.bySpouse
          ? `${p.ism}ning turmush o'rtog'i`
          : (p.parent ? `${p.parent.ism}ning farzandi` : "Shajara boshi");
        return `<li id="opt-${i}" role="option" aria-selected="${i === active}" class="${i === active ? "active" : ""}" data-i="${i}">` +
          `<span class="r-name">${esc(r.bySpouse ? p.turmush : p.ism)}</span>` +
          `<span class="r-meta">${esc(meta)} · ${p.depth + 1}-avlod</span></li>`;
      }).join("");
    }
    resultsEl.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
    if (active >= 0) searchInput.setAttribute("aria-activedescendant", "opt-" + active);
  }

  function pick(i) {
    const r = results[i];
    if (!r) return;
    hideResults();
    searchInput.value = "";
    searchInput.blur();
    select(r.p.id, { center: true, zoom: true });
  }

  searchInput.addEventListener("input", () => {
    const q = norm(searchInput.value.trim());
    if (!q) { hideResults(); return; }
    results = [];
    people.forEach((p) => {
      if (norm(p.ism).includes(q)) results.push({ p, bySpouse: false });
      else if (norm(p.turmush).includes(q)) results.push({ p, bySpouse: true });
    });
    results = results.slice(0, 8);
    active = results.length ? 0 : -1;
    drawResults();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!results.length || resultsEl.hidden) return;
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      drawResults();
    } else if (e.key === "Enter") {
      if (active >= 0 && !resultsEl.hidden) { e.preventDefault(); pick(active); }
    } else if (e.key === "Escape") {
      searchInput.value = "";
      hideResults();
    }
  });

  resultsEl.addEventListener("mousedown", (e) => e.preventDefault());
  resultsEl.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) pick(+li.dataset.i);
  });
  searchInput.addEventListener("blur", hideResults);

  // ---------- Klaviatura ----------

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    const step = 80;
    switch (e.key) {
      case "Escape": closePanel(); break;
      case "+": case "=": zoomBy(1.25); break;
      case "-": case "_": zoomBy(0.8); break;
      case "0": fit(); break;
      case "/": e.preventDefault(); searchInput.focus(); break;
      case "ArrowLeft": view.x += step; applyView(); break;
      case "ArrowRight": view.x -= step; applyView(); break;
      case "ArrowUp": view.y += step; applyView(); break;
      case "ArrowDown": view.y -= step; applyView(); break;
      default: return;
    }
  });

  // ---------- Xabarlar ----------

  function showNotice(kind, html) {
    noticeEl.className = "notice " + kind;
    noticeEl.innerHTML = `<div class="n-body">${html}</div><button type="button" class="notice-close" aria-label="Yopish">${ICON_CLOSE}</button>`;
    noticeEl.hidden = false;
  }
  noticeEl.addEventListener("click", (e) => { if (e.target.closest(".notice-close")) noticeEl.hidden = true; });

  function dataLoadMessage() {
    const err = window.__dataErr;
    if (err) {
      const hint = /not defined/i.test(err.msg)
        ? `Ehtimol, biror ism qo'shtirnoq ichiga olinmagan. To'g'ri yozuv: <code>ism: "Karim"</code>`
        : "Ko'pincha sabab: tushib qolgan vergul (,), qo'shtirnoq (\") yoki qavs.";
      return `<b>data.js faylining ${err.line}-qatorida xato bor.</b><br>${hint}<br><small>${esc(err.msg)}</small>`;
    }
    return `<b>Ma'lumotlar topilmadi.</b><br>data.js fayli yuklanmadi yoki undagi <code>ODAMLAR</code> ro'yxati o'chib ketgan.`;
  }

  // ---------- Boshlash ----------

  if (has(cfg.nomi)) { $("title").textContent = cfg.nomi; document.title = cfg.nomi; }
  if (has(cfg.tavsif)) $("subtitle").textContent = cfg.tavsif;
  else $("subtitle").hidden = true;

  if (!Array.isArray(rawList)) {
    showNotice("error", dataLoadMessage());
    viewport.insertAdjacentHTML("beforeend", `<div class="empty-state"><b>Shajara ochilmadi</b><span>Yuqoridagi xabarni o'qing.</span></div>`);
    return;
  }

  build(rawList);

  if (!people.size) {
    viewport.insertAdjacentHTML("beforeend", `<div class="empty-state"><b>Hali hech kim qo'shilmagan</b><span>Ismlarni data.js fayliga yozing.</span></div>`);
  }

  const generations = [...people.values()].reduce((m, p) => Math.max(m, p.depth + 1), 0);
  $("stats").innerHTML = `<b>${people.size}</b> kishi · <b>${generations}</b> avlod`;

  if (errors.length) {
    const shown = errors.slice(0, 8).map((m) => `<li>${esc(m)}</li>`).join("");
    const more = errors.length > 8 ? `<li>…yana ${errors.length - 8} ta</li>` : "";
    showNotice("error", `<b>data.js faylida ${errors.length} ta xato topildi:</b><ul>${shown}${more}</ul>`);
  } else if (cfg.namuna) {
    showNotice("info", "Hozir <b>namuna ismlar</b> ko'rsatilmoqda. Haqiqiy shajara tez orada qo'shiladi.");
  }

  render();
  initialView();

  // Foydalanuvchi hali hech narsa qilmagan bo'lsa, oyna o'lchami o'zgarganda qaytadan joylaymiz
  let touched = false;
  ["pointerdown", "wheel", "keydown"].forEach((ev) => window.addEventListener(ev, () => (touched = true), { capture: true, passive: true }));
  new ResizeObserver(() => { if (!touched && !selectedId) initialView(); }).observe(viewport);

  const fromHash = () => decodeURIComponent(location.hash.slice(1));
  if (people.has(fromHash())) select(fromHash(), { center: true, zoom: true, updateHash: false });
  window.addEventListener("hashchange", () => {
    if (people.has(fromHash())) select(fromHash(), { center: true, zoom: true, updateHash: false });
  });
})();
