(function () {
  // Pre-configured script URL from report-config.js
  const scriptUrl = window.REPORT_SCRIPT_URL;

  // User session data
  let userData = {
    id: '',
    acRegis: '',
    engineModel: '',
    startTime: null
  };

  // Aircraft database cache
  let aircraftDatabase = [];

  // DOM Elements - Login
  const loginScreen = document.getElementById('login-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginIdInput = document.getElementById('login-id');
  const loginAcInput = document.getElementById('login-ac');
  const loginEngineInput = document.getElementById('login-engine');

  // DOM Elements - Main App
  const mainContainer = document.getElementById('main-container');
  const floatingReportBtn = document.getElementById('floating-report-btn');
  const fabMenu = document.getElementById('fab-menu');

  // DOM Elements - Report Modal
  const reportView = document.getElementById('report-view');
  const closeReportBtn = document.getElementById('close-report-btn');
  const submitReportBtn = document.getElementById('submit-report-btn');
  const viewLogBtn = document.getElementById('view-log-btn');
  const statusMessage = document.getElementById('status-message');

  // Display elements
  const displayId = document.getElementById('display-id');
  const displayAc = document.getElementById('display-ac');
  const displayEngine = document.getElementById('display-engine');
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
  const editEngineInput = document.getElementById('edit-engine');

  // === AUTO-COMPLETE SETUP ===
  function setupAutocomplete(input, suggestions) {
    if (!input) return;

    input.setAttribute('autocomplete', 'off');
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const list = document.createElement('datalist');
    list.id = input.id + '-datalist';
    suggestions.forEach(s => {
      const option = document.createElement('option');
      option.value = s;
      list.appendChild(option);
    });
    wrapper.appendChild(list);
    input.setAttribute('list', list.id);
  }

  // ID suggestions
  const idSuggestions = ['VAE'];
  setupAutocomplete(loginIdInput, idSuggestions);
  setupAutocomplete(editIdInput, idSuggestions);

  // A/C Registration suggestions
  const acSuggestions = ['VN-A','XU'];
  setupAutocomplete(loginAcInput, acSuggestions);
  setupAutocomplete(editAcInput, acSuggestions);

  // === AIRCRAFT DATABASE FUNCTIONS ===
  async function loadAircraftDatabase() {
    const dbUrl = window.AIRCRAFT_DATABASE_URL;
    
    if (!dbUrl || dbUrl === 'YOUR_AIRCRAFT_DATABASE_SHEET_URL_HERE') {
      console.log('Aircraft database URL not configured');
      return;
    }

    try {
      // Extract spreadsheet ID from URL
      const match = dbUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        console.error('Invalid Google Sheet URL');
        return;
      }

      const spreadsheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse CSV (simple parsing - assumes no commas in fields)
      const lines = csvText.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const regIndex = headers.indexOf('registration');
      const engineIndex = headers.indexOf('engine_model');

      if (regIndex === -1 || engineIndex === -1) {
        console.error('Required columns not found in aircraft database');
        return;
      }

      // Build aircraft database
      aircraftDatabase = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        if (values[regIndex] && values[engineIndex]) {
          aircraftDatabase.push({
            registration: values[regIndex].toUpperCase(),
            engineModel: values[engineIndex]
          });
        }
      }

      console.log('Aircraft database loaded:', aircraftDatabase.length, 'entries');
    } catch (error) {
      console.error('Error loading aircraft database:', error);
    }
  }

  function lookupEngineModel(registration) {
    if (!registration) return '';
    
    const reg = registration.toUpperCase().trim();
    const aircraft = aircraftDatabase.find(a => a.registration === reg);
    
    return aircraft ? aircraft.engineModel : '';
  }

  // Load aircraft database on page load
  loadAircraftDatabase();

  // Auto-fill engine model when A/C registration changes
  if (loginAcInput && loginEngineInput) {
    loginAcInput.addEventListener('input', () => {
      const engineModel = lookupEngineModel(loginAcInput.value);
      loginEngineInput.value = engineModel;
    });

    loginAcInput.addEventListener('change', () => {
      const engineModel = lookupEngineModel(loginAcInput.value);
      loginEngineInput.value = engineModel;
    });
  }

  // === LOGIN FLOW ===
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const id = loginIdInput.value.trim().toUpperCase();
      const acRegis = loginAcInput.value.trim().toUpperCase();
      const engineModel = loginEngineInput.value.trim();

      if (!id || !acRegis) {
        alert('Please fill in all fields');
        return;
      }

      // Store user data (in uppercase)
      userData.id = id;
      userData.acRegis = acRegis;
      userData.engineModel = engineModel;
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
    if (displayEngine) displayEngine.textContent = userData.engineModel || 'N/A';
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
    
    // Reset buttons
    if (submitReportBtn) submitReportBtn.style.display = 'inline-flex';
    if (viewLogBtn) viewLogBtn.style.display = 'none';
    hideStatus();
  }

  // === EDIT FUNCTIONALITY ===
  if (editInfoBtn) {
    editInfoBtn.addEventListener('click', () => {
      // Populate edit form
      editIdInput.value = userData.id;
      editAcInput.value = userData.acRegis;
      editEngineInput.value = userData.engineModel;

      // Toggle display
      reportInfoDisplay.style.display = 'none';
      reportEditForm.style.display = 'block';
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      const newId = editIdInput.value.trim().toUpperCase();
      const newAc = editAcInput.value.trim().toUpperCase();
      const newEngine = editEngineInput.value.trim();

      if (!newId || !newAc) {
        alert('Please fill in all fields');
        return;
      }

      // Update user data (in uppercase)
      userData.id = newId;
      userData.acRegis = newAc;
      userData.engineModel = newEngine;

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

  // === VIEW LOG BUTTON ===
  if (viewLogBtn) {
    viewLogBtn.addEventListener('click', () => {
      const sheetUrl = window.GOOGLE_SHEET_URL;
      
      if (sheetUrl && sheetUrl !== 'https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit') {
        // Open the Google Sheet in a new tab
        window.open(sheetUrl, '_blank');
      } else {
        alert('Google Sheet URL not configured. Please update GOOGLE_SHEET_URL in static/report-config.js');
      }
    });
  }

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
            data: {
              id: userData.id.toUpperCase(),
              acRegis: userData.acRegis.toUpperCase(),
              engineModel: userData.engineModel,
              activeTab: activeTab.toUpperCase(),
              progressCompleted: progress.completed,
              progressTotal: progress.total,
              submitTime: currentTime.toISOString()
            }
          })
        });

        // Assume success (no-cors mode doesn't allow response reading)
        showStatus('success', '✓ Report submitted successfully!');

        // Show view log button
        if (viewLogBtn) {
          viewLogBtn.style.display = 'inline-flex';
        }

        // Hide submit button after success
        submitReportBtn.style.display = 'none';

      } catch (error) {
        showStatus('error', 'Error submitting report: ' + error.message);
      } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.innerHTML = '<span>📤</span> Submit Report';
      }
    });
  }
})();
