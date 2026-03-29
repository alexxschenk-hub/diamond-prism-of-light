/**
 * DIAMOND – Prism of Light
 * Background Service Worker v2.0
 *
 * Manages persistence: keeps Diamond active across page navigations.
 * Forwards messages between popup and content scripts.
 */

// Forward analysis results to popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'diamond-analysis-complete') {
    chrome.runtime.sendMessage(msg).catch(() => {
      // Popup not open, ignore
    });
  }
  return false;
});

// Re-inject content scripts when navigating to new pages while active
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    // Check if Diamond is active
    chrome.storage.local.get(['diamondActive'], (result) => {
      if (result.diamondActive) {
        // Content scripts auto-inject via manifest, but we ensure they re-analyze
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action: 'diamond-get-state' }).catch(() => {
            // Content script not yet loaded, it will auto-activate from storage
          });
        }, 1000);
      }
    });
  }
});

// Keyboard shortcut support
chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'toggle-diamond') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'diamond-toggle' });
      }
    });
  }
});
