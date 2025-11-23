(function () {
  // Pre-configured script URL from report-config.js
  const scriptUrl = window.REPORT_SCRIPT_URL;

  // User session data
  let userData = {
    id: '',
    acRegis: '',
    startTime: null
  };

  // DOM Elements - Login
  const loginScreen = document.getElementById('login-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginIdInput = document.getElementById('login-id');
  const loginAcInput = document.getElementById('login-ac');

  // DOM Elements - Main App
  const mainContainer = document.getElementById('main-container');
  const floatingReportBtn = document.getElementById('floating-report-btn');
  const fabMenu = document.getElementById('fab-menu');

  // DOM Elements - Report Modal
  const reportView = document.getElementById('report-view');
  const closeReportBtn = document.getElementById('close-report-btn');
  const submitReportBtn = document.getElementById('submit-report-btn');
  const statusMessage = document.getElementById('status-message');

  // Display elements
  const displayId = document.getElementById('display-id');
  const displayAc = document.getElementById('display-ac');
  const displayDatetime = document.getElementById('display-datetime');
  const displayActiveTab = document.getElementById('display-active-tab');
  const displayProgress = document.getElementById('display-progress');

  // Edit elements
  const reportInfoDisplay = document.getElementById('report-info-display');
  const reportEditForm = document.getElementById('report-edit-form');
  const editInfoBtn = document.getElementById('edit-info-btn');
  const saveEditBtn = document.getElementById('save-edit-btn');
  const editIdInput = document.getElementById('edit-id');
  const editAcInput = document.getElementById('edit-ac');

  // === LOGIN FLOW ===
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const id = loginIdInput.value.trim();
      const acRegis = loginAcInput.value.trim();

      if (!id || !acRegis) {
        alert('Please fill in all fields');
        return;
      }

      // Store user data
      userData.id = id;
      userData.acRegis = acRegis;
      userData.startTime = new Date();

      // Hide login, show app
      loginScreen.style.display = 'none';
      mainContainer.style.display = 'block';
      floatingReportBtn.style.display = 'flex';
      fabMenu.style.display = 'flex';

      // Update display
      updateReportDisplay();
    });

    // Allow Enter key to submit
    loginIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loginAcInput.focus();
    });

    loginAcInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }

  // === REPORT MODAL ===
  function getActiveTabName() {
    const activeBtn = document.querySelector('.tab-btn.active[data-type="checklist"]');
    return activeBtn ? activeBtn.textContent.trim() : 'Unknown';
  }

  function getActiveTabIndex() {
    const activeBtn = document.querySelector('.tab-btn.active[data-type="checklist"]');
    if (!activeBtn) return 0;
    const tabId = activeBtn.getAttribute('data-tab');
    return parseInt(tabId.replace('tab-', ''), 10);
  }

  function updateReportDisplay() {
    if (displayId) displayId.textContent = userData.id;
    if (displayAc) displayAc.textContent = userData.acRegis;
    if (displayDatetime && userData.startTime) {
      displayDatetime.textContent = userData.startTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Update active tab name and progress
    const activeTabName = getActiveTabName();
    const activeTabElement = document.getElementById('display-active-tab');
    if (activeTabElement) {
      activeTabElement.textContent = activeTabName + ':';
    }

    // Calculate progress for active tab only
    const progress = calculateActiveTabProgress();
    if (displayProgress) displayProgress.textContent = progress.completed + '/' + progress.total;
  }

  function calculateActiveTabProgress() {
    const activeTabIndex = getActiveTabIndex();
    const activePanel = document.getElementById('tab-' + activeTabIndex);

    if (!activePanel) {
      return { completed: 0, total: 0 };
    }

    const checkboxes = activePanel.querySelectorAll('.task-checkbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

    return {
      completed: checkedCount,
      total: checkboxes.length
    };
  }

  function showReportModal() {
    updateReportDisplay();
    if (reportView) {
      reportView.style.display = 'flex';
      hideStatus();
    }
  }

  function closeReportModal() {
    if (reportView) reportView.style.display = 'none';
    // Hide edit form when closing
    if (reportEditForm) reportEditForm.style.display = 'none';
    if (reportInfoDisplay) reportInfoDisplay.style.display = 'block';
  }

  // === EDIT FUNCTIONALITY ===
  if (editInfoBtn) {
    editInfoBtn.addEventListener('click', () => {
      // Populate edit form
      editIdInput.value = userData.id;
      editAcInput.value = userData.acRegis;

      // Toggle display
      reportInfoDisplay.style.display = 'none';
      reportEditForm.style.display = 'block';
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      const newId = editIdInput.value.trim();
      const newAc = editAcInput.value.trim();

      if (!newId || !newAc) {
        alert('Please fill in all fields');
        return;
      }

      // Update user data
      userData.id = newId;
      userData.acRegis = newAc;

      // Toggle back to display
      reportEditForm.style.display = 'none';
      reportInfoDisplay.style.display = 'block';

      updateReportDisplay();
      showStatus('success', 'Details updated successfully');
    });
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
  if (floatingReportBtn) {
    floatingReportBtn.addEventListener('click', showReportModal);
  }

  if (closeReportBtn) {
    closeReportBtn.addEventListener('click', closeReportModal);
  }

  // Close modal when clicking outside
  if (reportView) {
    reportView.addEventListener('click', (e) => {
      if (e.target === reportView) {
        closeReportModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reportView && reportView.style.display === 'flex') {
      closeReportModal();
    }
  });

  // === SUBMIT REPORT ===
  if (submitReportBtn) {
    submitReportBtn.addEventListener('click', async () => {
      if (!scriptUrl || scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        showStatus('error', 'Google Apps Script URL not configured. Please check static/report-config.js');
        return;
      }

      const progress = calculateActiveTabProgress();
      const activeTab = getActiveTabName();
      const currentTime = new Date();

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
            sheetName: 'Reports',
            data: {
              id: userData.id,
              acRegis: userData.acRegis,
              activeTab: activeTab,
              progressCompleted: progress.completed,
              progressTotal: progress.total,
              startTime: userData.startTime.toISOString(),
              submitTime: currentTime.toISOString()
            }
          })
        });

        // Assume success (no-cors mode doesn't allow response reading)
        showStatus('success', '✓ Report submitted successfully!');

        // Close modal after 2 seconds
        setTimeout(() => {
          closeReportModal();
        }, 2000);

      } catch (error) {
        showStatus('error', 'Error submitting report: ' + error.message);
      } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.innerHTML = '<span>📤</span> Submit Report';
      }
    });
  }
})();