(function () {
  // Pre-configured script URL from report-config.js
  const scriptUrl = window.REPORT_SCRIPT_URL;

  // DOM Elements
  const checklistView = document.getElementById('checklist-view');
  const reportView = document.getElementById('report-view');
  const reportBtn = document.getElementById('report-btn');
  const backToChecklistBtn = document.getElementById('back-to-checklist');
  const submitReportBtn = document.getElementById('submit-report-btn');
  const statusMessage = document.getElementById('status-message');
  const reportIdInput = document.getElementById('report-id');
  const reportAcInput = document.getElementById('report-ac');
  const reportDateInput = document.getElementById('report-date');
  const sideDrawer = document.getElementById('side-drawer');
  const sideOverlay = document.getElementById('side-overlay');

  // Set today's date as default
  if (reportDateInput) {
    reportDateInput.value = new Date().toISOString().split('T')[0];
  }

  // === NAVIGATION ===
  function showReportForm() {
    if (checklistView) checklistView.style.display = 'none';
    if (reportView) reportView.style.display = 'block';
    closeDrawer();
  }

  function showChecklist() {
    if (reportView) reportView.style.display = 'none';
    if (checklistView) checklistView.style.display = 'block';
    closeDrawer();
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove('open');
    if (sideOverlay) sideOverlay.classList.remove('show');
  }

  // === STATUS MESSAGES ===
  function showStatus(type, message) {
    if (!statusMessage) return;
    statusMessage.className = type;
    statusMessage.textContent = message;
    statusMessage.style.display = 'flex';
    
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 5000);
    }
  }

  function hideStatus() {
    if (statusMessage) statusMessage.style.display = 'none';
  }

  // === EVENT LISTENERS ===
  if (reportBtn) {
    reportBtn.addEventListener('click', showReportForm);
  }

  if (backToChecklistBtn) {
    backToChecklistBtn.addEventListener('click', showChecklist);
  }

  // === SUBMIT REPORT ===
  if (submitReportBtn) {
    submitReportBtn.addEventListener('click', async () => {
      const id = reportIdInput.value.trim();
      const acRegis = reportAcInput.value.trim();
      const date = reportDateInput.value;

      if (!id || !acRegis) {
        showStatus('error', 'Please fill in all required fields');
        return;
      }

      if (!scriptUrl || scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        showStatus('error', 'Google Apps Script URL not configured. Please check static/report-config.js');
        return;
      }

      submitReportBtn.disabled = true;
      submitReportBtn.innerHTML = '<span>⏳</span> Submitting...';
      hideStatus();

      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addReport',
            sheetName: 'Reports', // Default sheet name
            data: {
              id: id,
              acRegis: acRegis,
              date: date
            }
          })
        });

        // Assume success (no-cors mode doesn't allow response reading)
        showStatus('success', '✓ Report submitted successfully!');
        
        // Clear form
        reportIdInput.value = '';
        reportAcInput.value = '';
        reportDateInput.value = new Date().toISOString().split('T')[0];

      } catch (error) {
        showStatus('error', 'Error submitting report: ' + error.message);
      } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.innerHTML = '<span>📤</span> Submit Report';
      }
    });
  }
})();
