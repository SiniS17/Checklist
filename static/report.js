(function () {
  // State
  let sheets = [];
  let activeSheet = 0;
  let scriptUrl = localStorage.getItem('report_script_url') || '';

  // DOM Elements
  const setupPanel = document.getElementById('setup-panel');
  const reportForm = document.getElementById('report-form');
  const scriptUrlInput = document.getElementById('script-url');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const backToSetupBtn = document.getElementById('back-to-setup-btn');
  const submitReportBtn = document.getElementById('submit-report-btn');
  const statusMessage = document.getElementById('status-message');
  const activeSheetName = document.getElementById('active-sheet-name');
  const sheetsList = document.getElementById('sheets-list');
  const sheetInfoDetails = document.getElementById('sheet-info-details');
  const reportIdInput = document.getElementById('report-id');
  const reportAcInput = document.getElementById('report-ac');
  const reportDateInput = document.getElementById('report-date');
  const fabMenu = document.getElementById('fab-menu');
  const sideDrawer = document.getElementById('side-drawer');
  const sideOverlay = document.getElementById('side-overlay');

  // Set today's date as default
  reportDateInput.value = new Date().toISOString().split('T')[0];

  // Initialize
  if (scriptUrl) {
    scriptUrlInput.value = scriptUrl;
    loadSheets();
  }

  // === STATUS MESSAGES ===
  function showStatus(type, message) {
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
    statusMessage.style.display = 'none';
  }

  // === LOAD SHEETS FROM GOOGLE SHEETS ===
  async function loadSheets() {
    if (!scriptUrl) return;

    try {
      const response = await fetch(`${scriptUrl}?action=getSheets`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        sheets = data.sheets;
        renderSheetsList();
        showReportForm();
        showStatus('success', 'Sheets loaded successfully!');
        
        // Show hamburger menu once sheets are loaded
        if (sheets.length > 0) {
          fabMenu.style.display = 'flex';
        }
      } else {
        showStatus('error', data.error || 'Failed to load sheets');
      }
    } catch (error) {
      showStatus('error', 'Error connecting to Google Sheets: ' + error.message);
    }
  }

  // === RENDER SHEETS LIST ===
  function renderSheetsList() {
    if (sheets.length === 0) {
      sheetsList.innerHTML = '<p class="text-muted">No sheets available</p>';
      return;
    }

    sheetsList.innerHTML = '';
    sheets.forEach((sheet, index) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (index === activeSheet ? ' active' : '');
      btn.textContent = sheet.name;
      btn.onclick = () => {
        activeSheet = index;
        renderSheetsList();
        updateActiveSheetDisplay();
        closeDrawer();
      };
      sheetsList.appendChild(btn);
    });
  }

  // === UPDATE ACTIVE SHEET DISPLAY ===
  function updateActiveSheetDisplay() {
    if (sheets[activeSheet]) {
      activeSheetName.textContent = sheets[activeSheet].name;
      sheetInfoDetails.innerHTML = `
        <strong>Name:</strong> ${sheets[activeSheet].name}<br>
        <strong>Rows:</strong> ${sheets[activeSheet].rowCount}
      `;
    }
  }

  // === SHOW/HIDE PANELS ===
  function showSetupPanel() {
    setupPanel.style.display = 'block';
    reportForm.style.display = 'none';
    fabMenu.style.display = 'none';
  }

  function showReportForm() {
    setupPanel.style.display = 'none';
    reportForm.style.display = 'block';
    updateActiveSheetDisplay();
  }

  // === SAVE CONFIGURATION ===
  saveConfigBtn.addEventListener('click', () => {
    const url = scriptUrlInput.value.trim();
    
    if (!url) {
      showStatus('error', 'Please enter your Google Apps Script URL');
      return;
    }

    scriptUrl = url;
    localStorage.setItem('report_script_url', scriptUrl);
    hideStatus();
    loadSheets();
  });

  // === BACK TO SETUP ===
  backToSetupBtn.addEventListener('click', () => {
    showSetupPanel();
  });

  // === SUBMIT REPORT ===
  submitReportBtn.addEventListener('click', async () => {
    const id = reportIdInput.value.trim();
    const acRegis = reportAcInput.value.trim();
    const date = reportDateInput.value;

    if (!id || !acRegis) {
      showStatus('error', 'Please fill in all required fields');
      return;
    }

    if (!scriptUrl) {
      showStatus('error', 'Please configure your Google Apps Script URL first');
      return;
    }

    submitReportBtn.disabled = true;
    submitReportBtn.textContent = 'Submitting...';
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
          sheetName: sheets[activeSheet]?.name || 'Reports',
          data: {
            id: id,
            acRegis: acRegis,
            date: date
          }
        })
      });

      // Assume success (no-cors mode doesn't allow response reading)
      showStatus('success', 'Report submitted successfully!');
      
      // Clear form
      reportIdInput.value = '';
      reportAcInput.value = '';
      reportDateInput.value = new Date().toISOString().split('T')[0];

      // Reload sheets
      setTimeout(() => loadSheets(), 1000);
    } catch (error) {
      showStatus('error', 'Error submitting report: ' + error.message);
    } finally {
      submitReportBtn.disabled = false;
      submitReportBtn.innerHTML = '<span>📤</span> Submit Report';
    }
  });

  // === MOBILE DRAWER ===
  function openDrawer() {
    sideDrawer.classList.add('open');
    sideOverlay.classList.add('show');
  }

  function closeDrawer() {
    sideDrawer.classList.remove('open');
    sideOverlay.classList.remove('show');
  }

  if (fabMenu) fabMenu.addEventListener('click', openDrawer);
  if (sideOverlay) sideOverlay.addEventListener('click', closeDrawer);
})();
