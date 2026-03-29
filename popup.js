/**
 * DIAMOND – Prism of Light
 * Popup Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const mainToggle = document.getElementById('mainToggle');
  const modesSection = document.getElementById('modesSection');
  const channelsSection = document.getElementById('channelsSection');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const channelToggles = document.querySelectorAll('.channel-toggle input');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const urlInput = document.getElementById('urlInput');
  const analyzeUrlBtn = document.getElementById('analyzeUrlBtn');
  const urlStatus = document.getElementById('urlStatus');

  // Get current state from content script
  function getState() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: 'diamond-get-state' }, (response) => {
        if (chrome.runtime.lastError || !response) return;

        mainToggle.checked = response.active;
        updateUI(response.active);

        // Set mode
        if (response.mode) {
          modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === response.mode);
          });
        }

        // Set channels
        if (response.channels) {
          channelToggles.forEach(toggle => {
            toggle.checked = response.channels[toggle.dataset.channel] !== false;
          });
        }

        // Set score
        if (response.summary) {
          updateScore(response.summary.manipulationScore);
        }
      });
    });
  }

  // Toggle Diamond
  mainToggle.addEventListener('change', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, { action: 'diamond-toggle' }, (response) => {
        if (response) {
          updateUI(response.active);
        }
      });
    });
  });

  // Mode buttons
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'diamond-set-mode',
          mode: btn.dataset.mode
        });
      });
    });
  });

  // Channel toggles
  channelToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const channels = {};
      channelToggles.forEach(t => {
        channels[t.dataset.channel] = t.checked;
      });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'diamond-set-channels',
          channels: channels
        });
      });
    });
  });

  // Update UI based on active state
  function updateUI(active) {
    if (active) {
      modesSection.classList.remove('disabled');
      channelsSection.classList.remove('disabled');
    } else {
      modesSection.classList.add('disabled');
      channelsSection.classList.add('disabled');
      scoreDisplay.textContent = '--';
      scoreDisplay.className = 'mini-score-value';
    }
  }

  // Update score display
  function updateScore(score) {
    scoreDisplay.textContent = score;
    scoreDisplay.className = 'mini-score-value';

    if (score === 0) {
      scoreDisplay.classList.add('score-low');
    } else if (score < 30) {
      scoreDisplay.classList.add('score-medium');
    } else if (score < 60) {
      scoreDisplay.classList.add('score-high');
    } else {
      scoreDisplay.classList.add('score-critical');
    }
  }

  // ── URL Analysis ─────────────────────────────
  function analyzeUrl() {
    const url = urlInput.value.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      urlStatus.textContent = 'Ungültige URL';
      urlStatus.className = 'url-status error';
      return;
    }

    analyzeUrlBtn.disabled = true;
    urlStatus.textContent = 'Lädt...';
    urlStatus.className = 'url-status loading';

    chrome.runtime.sendMessage({ action: 'diamond-fetch-url', url }, (response) => {
      analyzeUrlBtn.disabled = false;

      if (chrome.runtime.lastError || !response) {
        urlStatus.textContent = 'Verbindungsfehler';
        urlStatus.className = 'url-status error';
        return;
      }
      if (response.error) {
        urlStatus.textContent = response.error;
        urlStatus.className = 'url-status error';
        return;
      }

      urlStatus.textContent = `Analysiert (${response.charCount} Zeichen)`;
      urlStatus.className = 'url-status success';

      // Make sure Diamond is shown as active in popup UI
      if (!mainToggle.checked) {
        mainToggle.checked = true;
        updateUI(true);
      }
    });
  }

  analyzeUrlBtn.addEventListener('click', analyzeUrl);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') analyzeUrl();
  });

  // Listen for analysis updates
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'diamond-analysis-complete' && msg.summary) {
      updateScore(msg.summary.manipulationScore);
    }
  });

  // Initialize
  getState();
});
