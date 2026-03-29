/**
 * DIAMOND – Prism of Light
 * Content Script – Main Controller v2.0
 *
 * Orchestrates the analysis, highlighting, and sidebar.
 * AUTO-UPDATES on navigation, clicks, and DOM mutations.
 * Sidebar PERSISTS while filter is active.
 */

(function () {
  'use strict';

  // Prevent double initialization — but allow re-analysis on navigation
  if (window.__diamondInitialized) {
    // Already initialized — but check if URL changed (bfcache restore, SPA navigation)
    if (window.__diamondLastAnalyzedUrl !== location.href) {
      window.__diamondLastAnalyzedUrl = location.href;
      if (window.__diamondForceReanalyze) {
        console.log('[DIAMOND] Re-initialized page detected (bfcache/SPA). Forcing re-analysis.');
        window.__diamondForceReanalyze();
      }
    }
    return;
  }
  window.__diamondInitialized = true;
  window.__diamondLastAnalyzedUrl = location.href;

  // State
  let isActive = false;
  let currentMode = 'rohdiamant'; // rohdiamant, brillant, feuer
  let activeChannels = {
    infrared: true,
    orange: true,
    yellow: true,
    green: true,
    blue: true,
    ultraviolet: true
  };
  let highlightedElements = [];
  let analyzer = null;
  let essenzEngine = null;
  let gefrierpunktEngine = null;
  let profiteurEngine = null;
  let modulmanager = null;
  let sidebar = null;
  let summary = null;
  let mutationObserver = null;
  let reanalysisTimer = null;
  let lastUrl = location.href;

  // ═══════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════

  function init() {
    if (!window.DIAMOND_PATTERNS || !window.DiamondAnalyzer || !window.DiamondSidebar || !window.DiamondEssenz || !window.DiamondGefrierpunkt || !window.DiamondProfiteur || !window.DiamondModulmanager) {
      console.warn('[DIAMOND] Waiting for dependencies...');
      setTimeout(init, 100);
      return;
    }

    analyzer = new window.DiamondAnalyzer(window.DIAMOND_PATTERNS);
    essenzEngine = new window.DiamondEssenz();
    gefrierpunktEngine = new window.DiamondGefrierpunkt();
    profiteurEngine = new window.DiamondProfiteur();
    modulmanager = new window.DiamondModulmanager();
    sidebar = new window.DiamondSidebar();
    sidebar.create();

    // Initialize module manager (async load from storage)
    modulmanager.load().then(() => {
      sidebar.initModuleManager(modulmanager);
    });

    // Listen for module changes (re-run analysis)
    document.addEventListener('diamond-modules-changed', () => {
      if (isActive) runAnalysis();
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.action) {
        case 'diamond-toggle':
          toggleDiamond();
          sendResponse({ active: isActive });
          break;
        case 'diamond-get-state':
          sendResponse({
            active: isActive,
            mode: currentMode,
            channels: activeChannels,
            summary: summary
          });
          break;
        case 'diamond-set-mode':
          setMode(msg.mode);
          sendResponse({ mode: currentMode });
          break;
        case 'diamond-toggle-channel':
          activeChannels[msg.channel] = msg.enabled;
          if (isActive) scheduleReanalysis(100);
          sendResponse({ channels: activeChannels });
          break;
        case 'diamond-set-channels':
          activeChannels = msg.channels;
          if (isActive) scheduleReanalysis(100);
          sendResponse({ channels: activeChannels });
          break;
        case 'diamond-analyze-external-url':
          analyzeExternalUrl(msg.text, msg.url);
          sendResponse({ ok: true });
          break;
      }
      return true;
    });

    // ── AUTO-UPDATE: Listen for navigation events ──
    setupAutoUpdate();

    // ── TEXT SELECTION: Floating analyze button ──
    setupSelectionAnalysis();

    // ── Listen for sidebar "back" button in selection mode ──
    document.addEventListener('diamond-selection-cleared', () => {
      if (isSelectionMode && isActive) {
        isSelectionMode = false;
        runAnalysis();
      }
    });

    // Check stored state & auto-activate if it was active before
    chrome.storage.local.get(['diamondActive', 'diamondMode', 'diamondChannels'], (result) => {
      if (result.diamondMode) currentMode = result.diamondMode;
      if (result.diamondChannels) activeChannels = result.diamondChannels;
      if (result.diamondActive) {
        isActive = true;

        // Smart page-ready detection: run analysis once DOM content is ready
        const activateOnPage = () => {
          runAnalysis();
          sidebar.open();
          startObserving(); // ← was missing! enables MutationObserver for auto-updates

          // Secondary re-analysis after longer delay to catch lazy-loaded content
          setTimeout(() => {
            if (isActive && !isSelectionMode) {
              console.log('[DIAMOND] Secondary re-analysis for late-loading content');
              runAnalysis();
            }
          }, 2500);
        };

        if (document.readyState === 'complete') {
          // Page already loaded (e.g. cached / back-forward)
          setTimeout(activateOnPage, 300);
        } else if (document.readyState === 'interactive') {
          // DOM ready but resources still loading
          setTimeout(activateOnPage, 500);
        } else {
          // Still loading — wait for DOMContentLoaded
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(activateOnPage, 500);
          });
        }
      }
    });

    // ── Expose force-reanalyze for bfcache/SPA re-entry ──
    window.__diamondForceReanalyze = () => {
      if (isActive && !isSelectionMode) {
        console.log('[DIAMOND] Force re-analyze triggered');
        runAnalysis();
      }
    };

    // ── bfcache: page restored from back/forward cache ──
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && isActive) {
        console.log('[DIAMOND] Page restored from bfcache. Re-analyzing...');
        window.__diamondLastAnalyzedUrl = location.href;
        setTimeout(() => {
          if (isActive && !isSelectionMode) runAnalysis();
        }, 300);
      }
    });

    // ── Tab becomes visible again: check if URL changed ──
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isActive) {
        if (window.__diamondLastAnalyzedUrl !== location.href) {
          console.log('[DIAMOND] Tab visible with new URL. Re-analyzing...');
          window.__diamondLastAnalyzedUrl = location.href;
          setTimeout(() => {
            if (isActive && !isSelectionMode) runAnalysis();
          }, 500);
        }
      }
    });

    console.log('[DIAMOND] Prism of Light v2.0 initialized. Ready to analyze.');
  }

  // ═══════════════════════════════════════
  // AUTO-UPDATE SYSTEM
  // ═══════════════════════════════════════

  function setupAutoUpdate() {
    // 1. MutationObserver – watch for DOM changes (dynamic content, SPA navigation)
    mutationObserver = new MutationObserver((mutations) => {
      if (!isActive) return;

      // Check if significant content changed (not just our own highlights)
      const significantChange = mutations.some(m => {
        if (m.target.closest && m.target.closest('#diamond-sidebar')) return false;
        if (m.target.classList && m.target.classList.contains('diamond-highlight')) return false;
        if (m.target.classList && m.target.classList.contains('diamond-tooltip')) return false;

        // New nodes added (articles loading, SPA content swap)
        if (m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && !node.closest?.('#diamond-sidebar') &&
                !node.classList?.contains('diamond-highlight') &&
                !node.classList?.contains('diamond-tooltip')) {
              return true;
            }
          }
        }
        return false;
      });

      if (significantChange) {
        scheduleReanalysis(800);
      }
    });

    // 2. URL change detection (SPA navigation, pushState, hash changes)
    const checkUrlChange = () => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        window.__diamondLastAnalyzedUrl = location.href;
        if (isActive) {
          // URL changed → clear selection mode (old selection is gone)
          isSelectionMode = false;
          console.log('[DIAMOND] URL changed, re-analyzing...');
          // Longer delay for full page content to load on new URL
          scheduleReanalysis(1500);
        }
      }
    };

    // Poll for URL changes (catches pushState/replaceState)
    setInterval(checkUrlChange, 300);

    // Also listen for popstate (back/forward)
    window.addEventListener('popstate', () => {
      if (isActive) scheduleReanalysis(500);
    });

    // 3. Listen for click events – re-analyze after navigation-like clicks
    document.addEventListener('click', (e) => {
      if (!isActive) return;

      const link = e.target.closest('a[href]');
      if (link) {
        // User clicked a link, schedule re-analysis after page loads
        scheduleReanalysis(1500);
      }
    }, true);

    // 4. DOMContentLoaded for cases where content script runs early
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (isActive) scheduleReanalysis(500);
      });
    }

    // 5. Load event – catch lazy-loaded content
    window.addEventListener('load', () => {
      if (isActive) scheduleReanalysis(1000);
    });
  }

  /**
   * Debounced re-analysis to avoid running too frequently
   */
  function scheduleReanalysis(delayMs) {
    if (reanalysisTimer) clearTimeout(reanalysisTimer);
    reanalysisTimer = setTimeout(() => {
      if (isActive && !isSelectionMode) {
        runAnalysis();
      }
    }, delayMs);
  }

  // ═══════════════════════════════════════
  // TOGGLE & MODE
  // ═══════════════════════════════════════

  function toggleDiamond() {
    isActive = !isActive;

    if (isActive) {
      runAnalysis();
      sidebar.open();
      startObserving();
    } else {
      stopObserving();
      clearHighlights();
      sidebar.close();
      restoreOriginalText();
    }

    chrome.storage.local.set({ diamondActive: isActive });
  }

  function setMode(mode) {
    currentMode = mode;
    chrome.storage.local.set({ diamondMode: mode });
    if (isActive) {
      clearHighlights();
      restoreOriginalText();
      runAnalysis();
    }
  }

  function startObserving() {
    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  function stopObserving() {
    if (mutationObserver) {
      mutationObserver.disconnect();
    }
  }

  // ═══════════════════════════════════════
  // MAIN ANALYSIS
  // ═══════════════════════════════════════

  function runAnalysis() {
    // Track what URL we're analyzing
    window.__diamondLastAnalyzedUrl = location.href;
    console.log('[DIAMOND] Running analysis on:', location.href.substring(0, 80));

    // Clear URL-mode indicator (we're analyzing the current page now)
    if (sidebar) sidebar.setUrlIndicator(null);

    // Temporarily disconnect observer to avoid feedback loop
    stopObserving();

    clearHighlights();
    restoreOriginalText();

    // ── CONTENT EXTRACTION ──────────────────────────────────
    // Selectors ordered from MOST to LEAST specific.
    // We pick the single best candidate, then strip noise from it.
    const PRIORITY_SELECTORS = [
      // Semantic article
      '[role="article"]',
      'article',
      // Common article body classes (news sites)
      '.article-body', '.article-text', '.article-content', '.article__body',
      '.story-body', '.story-content', '.story-text', '.story__body',
      '.post-body', '.post-content', '.post-text',
      '.entry-content', '.entry-body',
      // ORF-specific (news.orf.at, science.orf.at)
      '.story-story', '.ticker-story', '.oon-article',
      '.story-detail', '.article-detail',
      // Generic fallbacks
      '[role="main"]', 'main',
      '#article', '#story', '#content', '#main-content',
      '.news-article', '.news-content', '.news-body',
    ];

    // CSS classes/roles that signal NOISE — to be stripped before text extraction
    const NOISE_SELECTORS = [
      'nav', 'header', 'footer', 'aside',
      '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
      '[role="contentinfo"]', '[role="search"]',
      // Class-based noise patterns (navigation, sidebars, teasers, ads, share buttons)
      '[class*="nav"]', '[class*="menu"]', '[class*="sidebar"]',
      '[class*="related"]', '[class*="recommend"]', '[class*="teaser"]',
      '[class*="ticker"]', '[class*="breaking"]', '[class*="share"]',
      '[class*="social"]', '[class*="comment"]', '[class*="ad-"]',
      '[class*="-ad"]', '[class*="promo"]', '[class*="banner"]',
      '[class*="breadcrumb"]', '[class*="pagination"]', '[class*="author-bio"]',
      '[class*="tag-list"]', '[class*="topic-list"]', '[class*="more-stories"]',
      '[class*="mehr-"]', '[class*="-mehr"]', '[class*="aktuell"]',
      // ID-based noise
      '[id*="nav"]', '[id*="sidebar"]', '[id*="related"]', '[id*="comment"]',
      '[id*="footer"]', '[id*="header"]',
      // Our own elements
      '#diamond-sidebar',
    ].join(', ');

    /**
     * Extract clean article text from an element by removing navigation/noise.
     */
    function extractCleanText(root) {
      const clone = root.cloneNode(true);
      // Remove all noise elements from clone
      try {
        clone.querySelectorAll(NOISE_SELECTORS).forEach(el => el.remove());
      } catch (e) { /* ignore invalid selectors in edge cases */ }
      return (clone.innerText || clone.textContent || '').trim();
    }

    /**
     * Find the best article content root.
     * Returns the element with the most clean text from the most specific selector.
     */
    function findBestContentRoot() {
      for (const sel of PRIORITY_SELECTORS) {
        const candidates = document.querySelectorAll(sel);
        if (candidates.length === 0) continue;

        // Pick candidate with most text (filters out empty/hidden elements)
        let best = null;
        let bestLen = 0;
        candidates.forEach(el => {
          // Skip elements that are inside our sidebar
          if (el.closest('#diamond-sidebar')) return;
          const txt = extractCleanText(el);
          if (txt.length > bestLen) {
            bestLen = txt.length;
            best = el;
          }
        });

        // Accept if we found meaningful content (>200 chars = likely a real article)
        if (best && bestLen > 200) {
          console.log(`[DIAMOND] Content root: "${sel}" (${bestLen} chars)`);
          return best;
        }
      }

      // Last resort: body minus noise
      console.log('[DIAMOND] Content root: body (fallback)');
      return document.body;
    }

    const bestRoot = findBestContentRoot();
    const allText = extractCleanText(bestRoot);
    const contentRoots = [bestRoot]; // kept for highlight pass below

    console.log(`[DIAMOND] Extracted ${allText.length} chars. First 120: "${allText.substring(0, 120).replace(/\n/g, ' ')}"`);

    summary = analyzer.analyzePage(allText);

    // Extract GEFRIERPUNKT – the naked power mechanic
    const allMatches = analyzer.analyzeText(allText);
    const gefrierpunktResult = modulmanager && !modulmanager.isEnabled('gefrierpunkt')
      ? { text: '', category: null, resource: null, mechanism: null, strategy: null }
      : gefrierpunktEngine.extract(allText, allMatches);
    const profiteurResult = modulmanager && !modulmanager.isEnabled('profiteure')
      ? { text: '', profiteers: [] }
      : profiteurEngine.extract(allText);

    // Run custom modules
    const customResults = modulmanager ? modulmanager.runAllCustomModules(allText) : {};

    // Update sidebar
    sidebar.updateResults(summary);
    sidebar.updateEssenz(gefrierpunktResult);
    sidebar.updateProfiteur(profiteurResult);
    sidebar.renderCustomResults(customResults);

    // Apply mode to each content root
    contentRoots.forEach(root => {
      if (currentMode === 'brillant') {
        applyBrilliantCut(root);
      } else {
        highlightTextNodes(root);
      }
    });

    // Re-enable observer
    if (isActive) startObserving();

    // Notify popup
    try {
      chrome.runtime.sendMessage({
        action: 'diamond-analysis-complete',
        summary: summary
      });
    } catch (e) {
      // Popup might not be open
    }

    console.log(`[DIAMOND] Analysis complete: ${summary.totalMatches} matches, score ${summary.manipulationScore}`);
  }

  // ═══════════════════════════════════════
  // HIGHLIGHTING
  // ═══════════════════════════════════════

  function highlightTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          // Skip our own elements
          if (node.parentElement) {
            if (node.parentElement.closest('#diamond-sidebar')) return NodeFilter.FILTER_REJECT;
            if (node.parentElement.closest('.diamond-tooltip')) return NodeFilter.FILTER_REJECT;
            if (node.parentElement.classList.contains('diamond-highlight')) return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent || node.textContent.trim().length < 3) {
            return NodeFilter.FILTER_REJECT;
          }
          const tag = node.parentElement ? node.parentElement.tagName : '';
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CODE', 'PRE', 'TEXTAREA', 'INPUT'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const matches = analyzer.analyzeText(text);

      // Filter by active channels
      const activeMatches = matches.filter(m => activeChannels[m.channel]);
      if (activeMatches.length === 0) return;

      // Create highlighted version
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      activeMatches.forEach(match => {
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }

        const span = document.createElement('span');
        span.className = `diamond-highlight diamond-channel-${match.channel}`;
        span.style.backgroundColor = match.colorLight;
        span.style.borderBottom = `2px solid ${match.color}`;
        span.style.position = 'relative';
        span.style.cursor = 'pointer';
        span.textContent = text.substring(match.index, match.index + match.length);

        span.dataset.diamondChannel = match.channel;
        span.dataset.diamondLabel = match.label.de;
        span.dataset.diamondDescription = match.description.de;
        span.dataset.diamondIcon = match.icon;
        span.dataset.diamondColor = match.color;

        span.addEventListener('mouseenter', showTooltip);
        span.addEventListener('mouseleave', hideTooltip);

        fragment.appendChild(span);
        lastIndex = match.index + match.length;
        highlightedElements.push(span);
      });

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      textNode.__diamondOriginal = text;

      try {
        textNode.parentNode.replaceChild(fragment, textNode);
      } catch (e) {
        // Node might have been removed by dynamic content
      }
    });
  }

  function applyBrilliantCut(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (node.parentElement && node.parentElement.closest('#diamond-sidebar')) return NodeFilter.FILTER_REJECT;
          if (!node.textContent || node.textContent.trim().length < 5) return NodeFilter.FILTER_REJECT;
          const tag = node.parentElement ? node.parentElement.tagName : '';
          if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CODE', 'PRE'].includes(tag)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(textNode => {
      const originalText = textNode.textContent;
      const cleaned = analyzer.getBrilliantCut(originalText);
      if (cleaned !== originalText) {
        textNode.__diamondOriginal = originalText;
        textNode.textContent = cleaned;
        if (textNode.parentElement) {
          textNode.parentElement.classList.add('diamond-brillant-applied');
        }
      }
    });
  }

  // ═══════════════════════════════════════
  // TOOLTIPS
  // ═══════════════════════════════════════

  let tooltipEl = null;

  function showTooltip(e) {
    const target = e.currentTarget;
    hideTooltip();

    tooltipEl = document.createElement('div');
    tooltipEl.className = 'diamond-tooltip';
    tooltipEl.innerHTML = `
      <div class="diamond-tooltip-header" style="color:${target.dataset.diamondColor}">
        ${target.dataset.diamondIcon} ${target.dataset.diamondLabel}
      </div>
      <div class="diamond-tooltip-body">
        ${target.dataset.diamondDescription}
      </div>
    `;

    document.body.appendChild(tooltipEl);

    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    let top = rect.top - tooltipRect.height - 8 + window.scrollY;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;

    if (top < window.scrollY + 10) {
      top = rect.bottom + 8 + window.scrollY;
    }
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';
    tooltipEl.classList.add('diamond-tooltip-visible');
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  }

  // ═══════════════════════════════════════
  // TEXT SELECTION ANALYSIS
  // ═══════════════════════════════════════

  let selectionFab = null;
  let isSelectionMode = false;

  function setupSelectionAnalysis() {
    // Create the floating action button (hidden by default)
    selectionFab = document.createElement('div');
    selectionFab.id = 'diamond-selection-fab';
    selectionFab.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align:middle;margin-right:4px">
        <polygon points="12,1 22,9 18,22 6,22 2,9" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>
      Analysieren
    `;
    selectionFab.style.display = 'none';
    document.body.appendChild(selectionFab);

    // Click handler on FAB
    selectionFab.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 10) {
        runSelectionAnalysis(selectedText);
      }
    });

    // Show FAB when text is selected
    document.addEventListener('mouseup', (e) => {
      // Don't trigger on sidebar or FAB clicks
      if (e.target.closest('#diamond-sidebar') || e.target.closest('#diamond-selection-fab')) return;

      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 15 && isActive) {
          // Position FAB near the end of the selection
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          selectionFab.style.display = 'flex';
          selectionFab.style.top = (rect.bottom + window.scrollY + 8) + 'px';
          selectionFab.style.left = Math.min(
            rect.left + window.scrollX + (rect.width / 2) - 60,
            window.innerWidth - 140
          ) + 'px';
        } else {
          hideSelectionFab();
          // If we were in selection mode and user clicks elsewhere, return to full analysis
          if (isSelectionMode && isActive) {
            isSelectionMode = false;
            sidebar.clearSelectionMode();
            runAnalysis();
          }
        }
      }, 10);
    });

    // Hide FAB on scroll or keypress
    document.addEventListener('keydown', hideSelectionFab);
  }

  function hideSelectionFab() {
    if (selectionFab) {
      selectionFab.style.display = 'none';
    }
  }

  /**
   * Analyze only the selected text
   */
  function runSelectionAnalysis(selectedText) {
    hideSelectionFab();
    isSelectionMode = true;

    // Run analysis on just the selected text
    const selMatches = analyzer.analyzeText(selectedText);
    const selSummary = analyzer.analyzePage(selectedText);
    const selGefrierpunkt = gefrierpunktEngine.extract(selectedText, selMatches);
    const selProfiteur = profiteurEngine.extract(selectedText);

    // Update sidebar in selection mode
    sidebar.showSelectionAnalysis(selSummary, selGefrierpunkt, selectedText, selProfiteur);

    // Open sidebar if not already open
    if (!sidebar.isOpen) sidebar.open();

    // Also make sure body is shifted
    document.body.classList.add('diamond-body-shifted');

    console.log(`[DIAMOND] Selection analysis: ${selSummary.totalMatches} matches, score ${selSummary.manipulationScore}`);
  }

  // ═══════════════════════════════════════
  // EXTERNAL URL ANALYSIS
  // ═══════════════════════════════════════

  /**
   * Analyze text fetched from an external URL (no DOM extraction, no highlighting).
   * Called when the user enters a URL in the popup.
   */
  function analyzeExternalUrl(text, sourceUrl) {
    console.log('[DIAMOND] External URL analysis:', sourceUrl.substring(0, 80));

    // Activate Diamond if not already active
    if (!isActive) {
      isActive = true;
      chrome.storage.local.set({ diamondActive: true });
      sidebar.open();
      startObserving();
    }

    // Pause observer to avoid feedback loop
    stopObserving();

    // Clear any existing page highlights (we won't highlight the current page DOM)
    clearHighlights();
    restoreOriginalText();

    // Run all analysis engines on the fetched text
    summary = analyzer.analyzePage(text);
    const allMatches = analyzer.analyzeText(text);

    const gefrierpunktResult = (modulmanager && !modulmanager.isEnabled('gefrierpunkt'))
      ? { text: '', category: null, resource: null, mechanism: null, strategy: null }
      : gefrierpunktEngine.extract(text, allMatches);

    const profiteurResult = (modulmanager && !modulmanager.isEnabled('profiteure'))
      ? { text: '', profiteers: [] }
      : profiteurEngine.extract(text);

    const customResults = modulmanager ? modulmanager.runAllCustomModules(text) : {};

    // Update sidebar with results
    sidebar.updateResults(summary);
    sidebar.updateEssenz(gefrierpunktResult);
    sidebar.updateProfiteur(profiteurResult);
    sidebar.renderCustomResults(customResults);
    sidebar.setUrlIndicator(sourceUrl);

    // Re-enable observer
    if (isActive) startObserving();

    // Notify popup of score
    try {
      chrome.runtime.sendMessage({ action: 'diamond-analysis-complete', summary });
    } catch (e) { /* popup may be closed */ }

    console.log(`[DIAMOND] External URL analysis done: ${summary.totalMatches} matches, score ${summary.manipulationScore}`);
  }

  // ═══════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════

  function clearHighlights() {
    highlightedElements.forEach(el => {
      el.removeEventListener('mouseenter', showTooltip);
      el.removeEventListener('mouseleave', hideTooltip);
    });
    highlightedElements = [];
    hideTooltip();

    document.querySelectorAll('.diamond-highlight').forEach(span => {
      try {
        const text = document.createTextNode(span.textContent);
        span.parentNode.replaceChild(text, span);
      } catch (e) {}
    });

    document.querySelectorAll('.diamond-brillant-applied').forEach(el => {
      el.classList.remove('diamond-brillant-applied');
    });
  }

  function restoreOriginalText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (node.__diamondOriginal) {
        node.textContent = node.__diamondOriginal;
        delete node.__diamondOriginal;
      }
    }
  }

  // Start
  init();

})();
