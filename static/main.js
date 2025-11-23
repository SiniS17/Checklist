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

        applyRules();
      });
    });

    applyRules();
  });

  // === RESET BUTTON ===
  const mobileResetBtn = document.getElementById("mobile-reset-btn");
  if (mobileResetBtn) {
    mobileResetBtn.addEventListener("click", () => {
      if (confirm("Clear all checkboxes and progress?")) {
        // Uncheck all checkboxes and remove strikethrough
        document.querySelectorAll(".task-checkbox").forEach(checkbox => {
          checkbox.checked = false;
          checkbox.disabled = false;
          const row = checkbox.closest("tr");
          if (row) {
            row.classList.remove("strike");
          }
        });

        // Reapply rules for each sheet
        Object.keys(bySheet).forEach(k => {
          const boxes = bySheet[k];
          boxes.forEach((b, i) => {
            if (i === 0) {
              b.disabled = false;
            } else {
              b.disabled = !boxes[i - 1].checked;
            }
          });
        });
      }
      closeDrawer();
    });
  }
})();