(function () {
  "use strict";

  var overlay;
  var panel;
  var bodyEl;
  var captionEl;
  var closeBtn;
  var lastFocus = null;

  function isLogo(img) {
    if (!img) return true;
    if (img.closest(".brand-mark, .masthead, .lb-overlay")) return true;
    var src = (img.getAttribute("src") || "") + " " + (img.getAttribute("alt") || "");
    src = src.toLowerCase();
    if (/(?:^|\/)(?:logo|favicon)(?:\b|\.)/.test(src) || /favicon/.test(src)) return true;
    return false;
  }

  function isZoomableImg(img) {
    if (!img || img.tagName !== "IMG") return false;
    if (isLogo(img)) return false;
    if (img.closest(".lb-overlay")) return false;
    if (img.closest("figure")) return true;
    if (img.closest("main")) return true;
    return false;
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "放大查看");
    overlay.hidden = true;

    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "lb-close";
    closeBtn.setAttribute("aria-label", "关闭");
    closeBtn.textContent = "×";

    panel = document.createElement("div");
    panel.className = "lb-panel";

    bodyEl = document.createElement("div");
    bodyEl.className = "lb-body";

    captionEl = document.createElement("p");
    captionEl.className = "lb-caption";
    captionEl.hidden = true;

    panel.appendChild(bodyEl);
    panel.appendChild(captionEl);
    overlay.appendChild(closeBtn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);
  }

  function setCaption(text) {
    if (text) {
      captionEl.textContent = text;
      captionEl.hidden = false;
    } else {
      captionEl.textContent = "";
      captionEl.hidden = true;
    }
  }

  function openLightbox() {
    ensureOverlay();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("lb-open");
    closeBtn.focus();
  }

  function closeLightbox() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("lb-open");
    bodyEl.className = "lb-body";
    bodyEl.innerHTML = "";
    setCaption("");
    var restore = lastFocus;
    lastFocus = null;
    if (restore && typeof restore.focus === "function") {
      try { restore.focus(); } catch (err) {}
    }
  }

  function openImage(img) {
    ensureOverlay();
    bodyEl.className = "lb-body";
    bodyEl.innerHTML = "";
    var large = document.createElement("img");
    large.src = img.currentSrc || img.src;
    large.alt = img.alt || "";
    large.decoding = "async";
    bodyEl.appendChild(large);
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    setCaption(cap ? cap.textContent.trim() : "");
    openLightbox();
  }

  function openTable(table) {
    ensureOverlay();
    bodyEl.className = "lb-body lb-body--table";
    bodyEl.innerHTML = "";
    var clone = table.cloneNode(true);
    var nodes = clone.querySelectorAll("[id]");
    for (var i = 0; i < nodes.length; i++) nodes[i].removeAttribute("id");
    bodyEl.appendChild(clone);
    setCaption("");
    openLightbox();
  }

  function wrapTables() {
    var tables = document.querySelectorAll("main table, .deck table");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      if (table.closest(".lb-overlay")) continue;
      var wrap = table.closest(".table-wrap");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "table-wrap";
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
      }
      if (!wrap.querySelector(".table-zoom")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "table-zoom";
        btn.textContent = "放大";
        btn.setAttribute("aria-label", "放大表格");
        wrap.appendChild(btn);
      }
    }
  }

  function hasTextSelection() {
    var sel = window.getSelection && window.getSelection();
    return !!(sel && String(sel).length);
  }

  document.addEventListener("click", function (e) {
    var zoomBtn = e.target.closest(".table-zoom");
    if (zoomBtn) {
      e.preventDefault();
      var wrap = zoomBtn.closest(".table-wrap");
      var table = wrap && wrap.querySelector("table");
      if (table) openTable(table);
      return;
    }

    var table = e.target.closest("main table, .deck table");
    if (table && !e.target.closest("a, button, input, textarea, select, .lb-overlay")) {
      if (!hasTextSelection()) openTable(table);
      return;
    }

    var img = e.target.closest("img");
    if (img && isZoomableImg(img) && !e.target.closest("a")) {
      e.preventDefault();
      openImage(img);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;
    var img = e.target;
    if (img && img.tagName === "IMG" && isZoomableImg(img)) {
      e.preventDefault();
      openImage(img);
    }
  });

  wrapTables();
})();
