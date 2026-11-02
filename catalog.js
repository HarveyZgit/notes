
(function () {
  var allowed = {
    cat: ["", "AI", "认知", "科技"],
    src: ["", "YouTube", "X", "官方", "Website"]
  };
  var state = { cat: "", src: "", q: "" };
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
  var count = document.getElementById("result-count");
  var source = document.getElementById("source");
  var reset = document.getElementById("reset-filters");
  var empty = document.getElementById("empty");
  var search = document.getElementById("q");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var searchTimer = 0;

  function hay(row) {
    var title = ((row.querySelector(".title") || {}).textContent || "");
    var blurb = ((row.querySelector(".blurb") || {}).textContent || "");
    var cat = row.getAttribute("data-category") || "";
    var src = row.getAttribute("data-source") || "";
    var meta = ((row.querySelector(".meta") || {}).textContent || "");
    return (title + " " + blurb + " " + cat + " " + src + " " + meta).toLowerCase();
  }

  function apply() {
    var q = (state.q || "").trim().toLowerCase();
    var shown = 0;
    entries.forEach(function (row) {
      var okCat = !state.cat || row.getAttribute("data-category") === state.cat;
      var okSrc = !state.src || row.getAttribute("data-source") === state.src;
      var okQ = !q || hay(row).indexOf(q) >= 0;
      var on = okCat && okSrc && okQ;
      row.classList.toggle("is-hidden", !on);
      if (on) shown += 1;
    });
    empty.classList.toggle("is-shown", shown === 0);
    count.textContent = "显示 " + shown + " / " + entries.length + " 篇笔记";
    reset.disabled = !(state.cat || state.src || state.q);
  }

  function paintChips() {
    Array.prototype.slice.call(document.querySelectorAll(".group")).forEach(function (group) {
      var key = group.getAttribute("data-group");
      Array.prototype.slice.call(group.querySelectorAll(".chip")).forEach(function (chip) {
        var on = (chip.getAttribute("data-value") || "") === state[key];
        chip.classList.toggle("is-on", on);
        chip.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
    if (source) source.value = state.src;
    if (search && search.value !== state.q) search.value = state.q;
  }

  function writeUrl() {
    var q = new URLSearchParams();
    if (state.cat) q.set("cat", state.cat);
    if (state.src) q.set("src", state.src);
    if (state.q) q.set("q", state.q);
    var qs = q.toString();
    var next = location.pathname + (qs ? "?" + qs : "") + location.hash;
    var now = location.pathname + location.search + location.hash;
    if (next !== now) {
      try { history.replaceState(null, "", next); } catch (err) { /* file:// preview */ }
    }
  }

  function readUrl() {
    var q = new URLSearchParams(location.search);
    var cat = q.get("cat") || "";
    var src = q.get("src") || "";
    state.cat = allowed.cat.indexOf(cat) >= 0 ? cat : "";
    state.src = allowed.src.indexOf(src) >= 0 ? src : "";
    state.q = q.get("q") || "";
  }

  function sync(write) {
    paintChips();
    apply();
    if (write) writeUrl();
  }

  reset.addEventListener("click", function () {
    clearTimeout(searchTimer);
    state = { cat: "", src: "", q: "" };
    sync(true);
    search.focus();
  });

  source.addEventListener("change", function () { state.src = source.value; sync(true); });
  document.getElementById("empty-reset").addEventListener("click", function () { reset.click(); });
  readUrl();
  sync(false);

  Array.prototype.slice.call(document.querySelectorAll(".group")).forEach(function (group) {
    var key = group.getAttribute("data-group");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn || !group.contains(btn)) return;
      state[key] = btn.getAttribute("data-value") || "";
      sync(true);
    });
  });

  if (search) {
    search.addEventListener("input", function () {
      state.q = search.value || "";
      if (reduceMotion) {
        sync(true);
        return;
      }
      if (searchTimer) window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        searchTimer = 0;
        sync(true);
      }, 80);
    });
  }

  window.addEventListener("popstate", function () {
    readUrl();
    sync(false);
  });
})();
