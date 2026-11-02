(function () {
  "use strict";
  var overlay, bodyEl, captionEl, closeBtn, zoomBtn, lastFocus, activeImage;
  var inertState = [], zoomed = false;

  function isZoomableImg(img) {
    if (!img || img.tagName !== "IMG" || img.closest(".brand-mark, .masthead, .lb-overlay, a")) return false;
    var src = ((img.getAttribute("src") || "") + " " + (img.alt || "")).toLowerCase();
    if (/(?:^|\/)(?:logo|favicon)(?:\b|\.)/.test(src) || /favicon/.test(src)) return false;
    return !!img.closest("figure, main, .deck");
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "放大查看");
    overlay.hidden = true;
    var toolbar = document.createElement("div");
    toolbar.className = "lb-toolbar";
    zoomBtn = document.createElement("button");
    zoomBtn.type = "button";
    zoomBtn.className = "lb-zoom";
    zoomBtn.textContent = "放大 2×";
    zoomBtn.setAttribute("aria-pressed", "false");
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "lb-close";
    closeBtn.setAttribute("aria-label", "关闭放大查看");
    closeBtn.textContent = "×";
    toolbar.appendChild(zoomBtn);
    toolbar.appendChild(closeBtn);
    var panel = document.createElement("div");
    panel.className = "lb-panel";
    bodyEl = document.createElement("div");
    bodyEl.className = "lb-body";
    bodyEl.tabIndex = 0;
    bodyEl.setAttribute("role", "region");
    bodyEl.setAttribute("aria-label", "查看区域，可滚动查看放大的内容");
    captionEl = document.createElement("p");
    captionEl.className = "lb-caption";
    captionEl.hidden = true;
    panel.appendChild(bodyEl);
    panel.appendChild(captionEl);
    overlay.appendChild(toolbar);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeLightbox(); });
    closeBtn.addEventListener("click", closeLightbox);
    zoomBtn.addEventListener("click", toggleZoom);
  }

  function setCaption(text) {
    captionEl.textContent = text || "";
    captionEl.hidden = !text;
  }

  function openLightbox(trigger) {
    lastFocus = trigger || document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("lb-open");
    inertState = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === overlay || /^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return;
      inertState.push({ el: el, inert: el.inert });
      el.inert = true;
    });
    closeBtn.focus();
  }

  function closeLightbox() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("lb-open");
    inertState.forEach(function (item) { item.el.inert = item.inert; });
    inertState = [];
    bodyEl.className = "lb-body";
    bodyEl.replaceChildren();
    activeImage = null;
    zoomed = false;
    setCaption("");
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function toggleZoom() {
    if (!activeImage) return;
    zoomed = !zoomed;
    if (zoomed) {
      var fittedWidth = activeImage.getBoundingClientRect().width;
      // At least twice the fitted width; preserve native detail in large diagrams.
      activeImage.style.width = Math.max(fittedWidth * 2, activeImage.naturalWidth) + "px";
      bodyEl.classList.add("is-zoomed");
    } else {
      activeImage.style.width = "";
      bodyEl.classList.remove("is-zoomed");
      bodyEl.scrollTop = bodyEl.scrollLeft = 0;
    }
    zoomBtn.textContent = zoomed ? "适应屏幕" : "放大 2×";
    zoomBtn.setAttribute("aria-pressed", String(zoomed));
  }

  function openImage(img) {
    ensureOverlay();
    bodyEl.className = "lb-body";
    bodyEl.replaceChildren();
    zoomed = false;
    zoomBtn.hidden = false;
    zoomBtn.textContent = "放大 2×";
    zoomBtn.setAttribute("aria-pressed", "false");
    activeImage = document.createElement("img");
    activeImage.src = img.currentSrc || img.src;
    activeImage.alt = img.alt || "";
    activeImage.decoding = "async";
    activeImage.addEventListener("click", toggleZoom);
    bodyEl.appendChild(activeImage);
    var fig = img.closest("figure"), cap = fig && fig.querySelector("figcaption");
    setCaption(cap ? cap.textContent.trim() : img.alt);
    openLightbox(img);
  }

  function openTable(table, trigger) {
    ensureOverlay();
    bodyEl.className = "lb-body lb-body--table";
    bodyEl.replaceChildren();
    activeImage = null;
    zoomBtn.hidden = true;
    var clone = table.cloneNode(true);
    clone.removeAttribute("id");
    Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (el) { el.removeAttribute("id"); });
    bodyEl.appendChild(clone);
    setCaption("表格 · 可横向滚动查看");
    openLightbox(trigger);
  }

  function wrapTables() {
    Array.prototype.forEach.call(document.querySelectorAll("main table, .deck table"), function (table) {
      if (table.closest(".lb-overlay")) return;
      var wrap = table.closest(".table-wrap");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "table-wrap";
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
      }
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", "表格，可横向滚动");
      if (!wrap.querySelector(".table-zoom")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "table-zoom";
        btn.textContent = "放大表格";
        wrap.insertBefore(btn, table);
      }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".table-zoom");
    if (btn) {
      var table = btn.closest(".table-wrap").querySelector("table");
      if (table) openTable(table, btn);
      return;
    }
    var clickedTable = e.target.closest("main table, .deck table");
    if (clickedTable && !e.target.closest("a, button, input, textarea, select, .lb-overlay")) {
      if (!String(window.getSelection ? window.getSelection() : "")) {
        openTable(clickedTable, clickedTable.closest(".table-wrap").querySelector(".table-zoom"));
      }
      return;
    }
    var img = e.target.closest("img");
    if (isZoomableImg(img)) { e.preventDefault(); openImage(img); }
  });

  document.addEventListener("keydown", function (e) {
    if (overlay && !overlay.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeLightbox(); return; }
      if (e.key === "Tab") {
        var focusable = Array.prototype.filter.call(overlay.querySelectorAll("button, a[href], input, select, textarea, [tabindex]"), function (el) {
          return !el.disabled && el.tabIndex >= 0 && el.getClientRects().length > 0;
        });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
      }
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && isZoomableImg(e.target)) {
      e.preventDefault(); openImage(e.target);
    }
  });
  // Prevent programmatic focus from escaping the modal as well as keyboard Tab.
  document.addEventListener("focusin", function (e) {
    if (overlay && !overlay.hidden && !overlay.contains(e.target)) closeBtn.focus();
  });
  Array.prototype.forEach.call(document.querySelectorAll("figure img, main img, .deck img"), function (img) {
    if (!isZoomableImg(img)) return;
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-haspopup", "dialog");
    img.setAttribute("aria-label", "放大图片" + (img.alt ? "：" + img.alt : ""));
  });
  wrapTables();
})();
