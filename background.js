/**
 * DIAMOND – Prism of Light
 * Background Service Worker v2.1
 *
 * Manages persistence: keeps Diamond active across page navigations.
 * Forwards messages between popup and content scripts.
 * Fetches external URLs for analysis on request.
 */

// Forward analysis results to popup + handle URL fetch requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'diamond-analysis-complete') {
    chrome.runtime.sendMessage(msg).catch(() => {
      // Popup not open, ignore
    });
    return false;
  }

  if (msg.action === 'diamond-fetch-url') {
    (async () => {
      try {
        const response = await fetch(msg.url, {
          headers: { 'Accept': 'text/html,application/xhtml+xml' }
        });

        if (!response.ok) {
          sendResponse({ error: `HTTP ${response.status}` });
          return;
        }

        const html = await response.text();

        // Parse HTML and extract article text
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Strip noise elements
        doc.querySelectorAll('nav, header, footer, aside, script, style, noscript, [class*="ad-"], [class*="banner"], [class*="comment"]')
          .forEach(el => el.remove());

        // Find best content container (ordered by specificity)
        const SELECTORS = [
          '[role="article"]', 'article',
          '.article-body', '.article-text', '.article-content', '.article__body',
          '.story-body', '.story-content', '.post-body', '.post-content',
          '.entry-content', '[role="main"]', 'main', 'body'
        ];

        let text = '';
        for (const sel of SELECTORS) {
          const el = doc.querySelector(sel);
          if (el) {
            text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (text.length > 200) break;
          }
        }

        if (text.length < 100) {
          sendResponse({ error: 'Kein Inhalt gefunden' });
          return;
        }

        // Send extracted text to the active tab's content script
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]) {
          sendResponse({ error: 'Kein aktiver Tab' });
          return;
        }

        await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'diamond-analyze-external-url',
          text: text,
          url: msg.url
        });

        sendResponse({ success: true, charCount: text.length });
      } catch (err) {
        sendResponse({ error: err.message || 'Ladefehler' });
      }
    })();
    return true; // keep channel open for async sendResponse
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
