(function () {
  // === TAB SWITCHING ===
  let lastActiveTab = null;

  function activateTab(btn) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const panel = document.getElementById(btn.dataset.tab);
    if (panel) panel.classList.add("active");

    // Remember this as the last active checklist tab
    if (btn.dataset.type === "checklist" || !btn.dataset.type) {
      lastActiveTab = btn;
    }
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activateTab(btn);
      closeDrawer();
    });
  });

  // Store the first tab as default last active
  const firstTab = document.querySelector(".tab-btn[data-type='checklist']");
  if (firstTab) {
    lastActiveTab = firstTab;
  }

  // === MOBILE DRAWER ===
  const fab = document.getElementById("fab-menu");
  const drawer = document.getElementById("side-drawer");
  const overlay = document.getElementById("side-overlay");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("show");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
  }

  if (fab) fab.addEventListener("click", openDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  // === CHECKBOX LOGIC ===
  const all = Array.from(document.querySelectorAll(".task-checkbox"));
  const bySheet = {};

  all.forEach(box => {
    const si = parseInt(box.dataset.sheet, 10);
    if (!bySheet[si]) bySheet[si] = [];
    bySheet[si].push(box);
  });

  Object.keys(bySheet).forEach(k => {
    const si = parseInt(k, 10);
    const boxes = bySheet[si];
    const stateKey = "ckl__" + si;
    const stored = JSON.parse(localStorage.getItem(stateKey) || "{}");

    // Restore checked boxes & strikethrough
    boxes.forEach((b, i) => {
      b.checked = !!stored[i];
      const r = b.closest("tr");
      if (b.checked && r) {
        r.classList.add("strike");
      }
    });

    function updateState() {
      const st = {};
      boxes.forEach((b, i) => (st[i] = b.checked));
      localStorage.setItem(stateKey, JSON.stringify(st));
    }

    function applyRules() {
      boxes.forEach((b, i) => {
        if (i === 0) {
          // First real task (not header) is always enabled
          b.disabled = false;
        } else {
          // All subsequent tasks require previous to be checked
          b.disabled = !boxes[i - 1].checked;
        }
      });
    }

    // Change handler
    boxes.forEach((b, i) => {
      b.addEventListener("change", () => {
        const row = b.closest("tr");

        if (b.checked && row) {
          row.classList.add("strike");
        } else if (row) {
          row.classList.remove("strike");
          // uncheck & remove strike from following rows
          for (let j = i + 1; j < boxes.length; j++) {
            boxes[j].checked = false;
            const r = boxes[j].closest("tr");
            if (r) r.classList.remove("strike");
          }
        }

        updateState();
        applyRules();
      });
    });

    applyRules();
  });

  // === RESET BUTTON ===
  const reset = document.getElementById("reset-btn");
  if (reset) {
    reset.addEventListener("click", () => {
      if (confirm("Clear all checkboxes and progress?")) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("ckl__")) localStorage.removeItem(key);
        });
        location.reload();
      }
    });
  }
})();