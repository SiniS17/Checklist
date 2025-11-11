(function () {
  // Tabs: show all, highlight active, others clickable
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-panel").forEach(function (p) {
        p.classList.remove("active");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const id = btn.getAttribute("data-tab");
      document.getElementById(id).classList.add("active");
    });
  });

  // Storage helpers (per file & per sheet scopes)
  const meta = window._CHECKLIST_META || { fileKey: "default", sheetCount: 0 };
  function storageKey(sheetIndex) {
    return "ckl__" + meta.fileKey + "__s" + sheetIndex;
  }
  function loadSheetState(sheetIndex) {
    try {
      const raw = localStorage.getItem(storageKey(sheetIndex));
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }
  function saveSheetState(sheetIndex, state) {
    try {
      localStorage.setItem(storageKey(sheetIndex), JSON.stringify(state));
    } catch (_) { /* ignore */ }
  }

  // Bucket checkboxes by sheet and enforce strict sequence:
  // - A checkbox is DISABLED until the previous one is checked.
  // - Unchecking a box clears & disables all following boxes.
  const all = Array.from(document.querySelectorAll(".task-checkbox"));
  const bySheet = {};
  all.forEach(function (box) {
    const si = parseInt(box.dataset.sheet, 10);
    if (!bySheet[si]) bySheet[si] = [];
    bySheet[si].push(box);
  });

  Object.keys(bySheet).forEach(function (k) {
    const si = parseInt(k, 10);
    const boxes = bySheet[si];
    const state = loadSheetState(si);

    // Restore checked state
    boxes.forEach(function (box, idx) {
      box.checked = !!state[idx];
    });

    // Apply gating (disable until previous is checked)
    function applyGating() {
      boxes.forEach(function (box, idx) {
        if (idx === 0) {
          box.disabled = false; // first one always available
        } else {
          box.disabled = !boxes[idx - 1].checked;
        }
      });
    }
    applyGating();

    // Change handler
    boxes.forEach(function (box, idx) {
      box.addEventListener("change", function () {
        if (!box.checked) {
          // Uncheck and disable all later boxes
          for (let j = idx + 1; j < boxes.length; j++) {
            boxes[j].checked = false;
          }
        }
        // Persist
        const next = {};
        boxes.forEach(function (b, i2) { next[i2] = b.checked; });
        saveSheetState(si, next);
        // Re-apply gating after any change
        applyGating();
      });
    });
  });
})();
