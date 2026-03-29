/**
 * DIAMOND – Prism of Light
 * Sidebar Panel Component
 *
 * Renders the spectral analysis sidebar with prism visualization.
 */

class DiamondSidebar {
  constructor() {
    this.isOpen = false;
    this.panel = null;
    this.summary = null;
  }

  create() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.id = 'diamond-sidebar';
    this.panel.innerHTML = this.getTemplate();
    document.body.appendChild(this.panel);

    // Close button
    this.panel.querySelector('#diamond-close-btn').addEventListener('click', () => {
      this.toggle();
    });

    // Tab switching
    this.panel.querySelectorAll('.diamond-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  getTemplate() {
    return `
      <div class="diamond-sidebar-inner">
        <!-- Header -->
        <div class="diamond-header">
          <div class="diamond-logo-row">
            <svg class="diamond-icon-svg" viewBox="0 0 40 40" width="32" height="32">
              <defs>
                <linearGradient id="diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#FF3B30"/>
                  <stop offset="20%" style="stop-color:#FF9500"/>
                  <stop offset="40%" style="stop-color:#FFB800"/>
                  <stop offset="60%" style="stop-color:#34C759"/>
                  <stop offset="80%" style="stop-color:#007AFF"/>
                  <stop offset="100%" style="stop-color:#AF52DE"/>
                </linearGradient>
              </defs>
              <polygon points="20,2 38,16 30,38 10,38 2,16" fill="none" stroke="url(#diamond-grad)" stroke-width="2.5"/>
              <polygon points="20,8 32,18 26,34 14,34 8,18" fill="none" stroke="url(#diamond-grad)" stroke-width="1" opacity="0.5"/>
              <line x1="20" y1="2" x2="20" y2="38" stroke="url(#diamond-grad)" stroke-width="0.5" opacity="0.3"/>
              <line x1="2" y1="16" x2="38" y2="16" stroke="url(#diamond-grad)" stroke-width="0.5" opacity="0.3"/>
            </svg>
            <div class="diamond-title">
              <span class="diamond-name">DIAMOND</span>
              <span class="diamond-subtitle">Prism of Light</span>
            </div>
          </div>
          <button id="diamond-close-btn" class="diamond-close-btn" title="Close">&times;</button>
        </div>

        <!-- Tagline -->
        <div class="diamond-tagline">Don't just see the news. See the spectrum.</div>

        <!-- GEFRIERPUNKT BOX -->
        <div class="diamond-essenz-section diamond-gefrierpunkt" id="diamond-essenz-section">
          <div class="diamond-essenz-header">
            <span class="diamond-essenz-icon">&#10052;</span>
            <span class="diamond-essenz-title">GEFRIERPUNKT</span>
            <span class="diamond-essenz-subtitle">&ndash; Die nackte Mechanik</span>
          </div>
          <div class="diamond-category-tag" id="diamond-category-tag" style="display:none;"></div>
          <div class="diamond-essenz-text" id="diamond-essenz-text">
            Wird kristallisiert...
          </div>
          <div class="diamond-gfp-meta" id="diamond-gfp-meta" style="display:none;"></div>
        </div>

        <!-- PROFITEUR BOX -->
        <div class="diamond-essenz-section diamond-profiteur" id="diamond-profiteur-section">
          <div class="diamond-essenz-header">
            <span class="diamond-essenz-icon diamond-profiteur-icon">&#128176;</span>
            <span class="diamond-essenz-title">PROFITEURE</span>
            <span class="diamond-essenz-subtitle">&ndash; Wer profitiert wirklich?</span>
          </div>
          <div class="diamond-profiteur-text" id="diamond-profiteur-text">
            Wird destilliert...
          </div>
          <div class="diamond-profiteur-chips" id="diamond-profiteur-chips" style="display:none;"></div>
        </div>

        <!-- Score -->
        <div class="diamond-score-section" id="diamond-score-section">
          <div class="diamond-score-ring" id="diamond-score-ring">
            <svg viewBox="0 0 100 100" width="90" height="90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2a2a2e" stroke-width="8"/>
              <circle id="diamond-score-circle" cx="50" cy="50" r="42" fill="none"
                      stroke="url(#diamond-grad)" stroke-width="8"
                      stroke-dasharray="264" stroke-dashoffset="264"
                      stroke-linecap="round" transform="rotate(-90 50 50)"/>
              <text x="50" y="46" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="700"
                    id="diamond-score-value">0</text>
              <text x="50" y="62" text-anchor="middle" fill="#8e8e93" font-size="9">
                MANIPULATION
              </text>
            </svg>
          </div>
          <div class="diamond-score-label" id="diamond-score-label">Seite wird analysiert...</div>
        </div>

        <!-- Tabs -->
        <div class="diamond-tabs">
          <button class="diamond-tab-btn active" data-tab="spectrum">Spektrum</button>
          <button class="diamond-tab-btn" data-tab="details">Details</button>
          <button class="diamond-tab-btn" data-tab="module">Module</button>
          <button class="diamond-tab-btn" data-tab="about">Info</button>
        </div>

        <!-- Tab Content -->
        <div class="diamond-tab-content" id="diamond-tab-spectrum">
          <div id="diamond-channel-bars"></div>
        </div>

        <div class="diamond-tab-content hidden" id="diamond-tab-details">
          <div id="diamond-details-list"></div>
        </div>

        <div class="diamond-tab-content hidden" id="diamond-tab-module">
          <div class="diamond-module-manager" id="diamond-module-manager">
            <div class="diamond-module-header-row">
              <span class="diamond-module-header-title">Analyse-Module</span>
              <button class="diamond-module-add-btn" id="diamond-module-add-btn" title="Neues Destillat erstellen">+ Neu</button>
            </div>
            <div id="diamond-module-list"></div>
            <div id="diamond-custom-results"></div>
          </div>
          <!-- Editor overlay (hidden by default) -->
          <div class="diamond-module-editor" id="diamond-module-editor" style="display:none;">
            <div class="diamond-editor-header">
              <span class="diamond-editor-title" id="diamond-editor-title">Neues Destillat</span>
              <button class="diamond-editor-close" id="diamond-editor-close">&times;</button>
            </div>
            <div class="diamond-editor-body">
              <label class="diamond-editor-label">Name</label>
              <input type="text" id="diamond-editor-name" class="diamond-editor-input" placeholder="z.B. Klimaframing" />
              <label class="diamond-editor-label">Icon (Emoji)</label>
              <input type="text" id="diamond-editor-icon" class="diamond-editor-input diamond-editor-icon-input" placeholder="&#128269;" maxlength="4" />
              <label class="diamond-editor-label">Farbe</label>
              <input type="color" id="diamond-editor-color" class="diamond-editor-color" value="#8E8E93" />
              <label class="diamond-editor-label">Beschreibung</label>
              <input type="text" id="diamond-editor-desc" class="diamond-editor-input" placeholder="Was analysiert dieses Modul?" />
              <label class="diamond-editor-label">Satzvorlage</label>
              <input type="text" id="diamond-editor-template" class="diamond-editor-input" placeholder="{{matches}} erkannt. Gewinne: {{gains}}" />
              <p class="diamond-editor-hint">Variablen: <code>{{matches}}</code> <code>{{count}}</code> <code>{{gains}}</code> <code>{{losses}}</code> <code>{{risks}}</code></p>
              <label class="diamond-editor-label">Regeln</label>
              <div id="diamond-editor-rules"></div>
              <button class="diamond-editor-add-rule" id="diamond-editor-add-rule">+ Regel hinzuf&uuml;gen</button>
              <div class="diamond-editor-actions">
                <button class="diamond-editor-save" id="diamond-editor-save">&#10004; Speichern</button>
                <button class="diamond-editor-delete" id="diamond-editor-delete" style="display:none;">&#128465; L&ouml;schen</button>
              </div>
            </div>
          </div>
        </div>

        <div class="diamond-tab-content hidden" id="diamond-tab-about">
          <div class="diamond-about">
            <p class="diamond-about-text">
              <strong>DIAMOND</strong> spaltet Nachrichten wie ein Prisma das Licht in seine
              einzelnen Farben auf. Jede Farbe steht f&uuml;r eine Manipulationstechnik.
            </p>
            <div class="diamond-legend">
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#FF3B30"></span>
                <span><strong>Infrarot</strong> &ndash; Angst &amp; Bedrohung</span>
              </div>
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#FF9500"></span>
                <span><strong>Orange</strong> &ndash; K&uuml;nstliche Dringlichkeit</span>
              </div>
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#FFB800"></span>
                <span><strong>Gelb</strong> &ndash; Interessen &amp; Profit</span>
              </div>
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#34C759"></span>
                <span><strong>Gr&uuml;n</strong> &ndash; Wir gegen Die</span>
              </div>
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#007AFF"></span>
                <span><strong>Blau</strong> &ndash; K&uuml;nstliche Autorit&auml;t</span>
              </div>
              <div class="diamond-legend-item">
                <span class="diamond-legend-dot" style="background:#AF52DE"></span>
                <span><strong>Ultraviolett</strong> &ndash; Ethische &Uuml;berh&ouml;hung</span>
              </div>
            </div>
            <div class="diamond-gfp-info">
              <p class="diamond-about-text" style="margin-top:12px">
                <strong>&#10052; GEFRIERPUNKT</strong> destilliert jeden Artikel auf die nackte Machtmechanik:
                <em>Wer will was von wem mit welchem Hebel?</em>
              </p>
              <p class="diamond-about-text" style="font-size:11px; opacity:0.7; margin-top:4px">
                3 Schnitte: Ressource &rarr; Profiteur &rarr; Mechanik &rarr; max. 15 W&ouml;rter.
              </p>
              <div class="diamond-legend" style="margin-top:8px">
                <p class="diamond-about-text" style="font-size:11px; margin-bottom:6px; opacity:0.8"><strong>Erkannte Kategorien:</strong></p>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#FF3B30">&#9876;&#65039;</span><span><strong>Geopolitik</strong> &ndash; Konflikte, Kriege, Sanktionen</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#007AFF">&#127963;</span><span><strong>Innenpolitik</strong> &ndash; Gesetze, Regulierung, Reformen</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#FFB800">&#128176;</span><span><strong>Wirtschaft</strong> &ndash; Handel, Finanzen, Ressourcenfl&uuml;sse</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#34C759">&#128138;</span><span><strong>Gesundheit</strong> &ndash; Medizin, Di&auml;t, Konsum</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#AF52DE">&#128274;</span><span><strong>Digital</strong> &ndash; Daten, &Uuml;berwachung, Tech</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#FF9500">&#127758;</span><span><strong>Klima</strong> &ndash; Energie, Umwelt, Nachhaltigkeit</span></div>
                <div class="diamond-legend-item"><span class="diamond-legend-dot" style="background:#8E8E93">&#128226;</span><span><strong>Gesellschaft</strong> &ndash; Narrative, Meinungsbildung</span></div>
              </div>
            </div>
            <div class="diamond-gfp-info">
              <p class="diamond-about-text" style="margin-top:12px">
                <strong>&#128176; PROFITEURE</strong> identifiziert wer wirklich von der Nachricht profitiert:
                <em>Direkte, indirekte und verborgene Gewinner.</em>
              </p>
              <p class="diamond-about-text" style="font-size:11px; opacity:0.7; margin-top:4px">
                3 Ebenen: &#127919; Direkt &rarr; &#127760; Indirekt &rarr; &#128065; Verborgen
              </p>
            </div>
            <p class="diamond-about-text diamond-about-footer">
              100% lokal &ndash; Keine Daten verlassen deinen Browser.<br/>
              Open Source &ndash; Frei f&uuml;r alle.
            </p>
            <p class="diamond-about-quote">
              &bdquo;Ihre Schlagzeilen sind ihre Waffen,<br/>
              aber meine Wahrnehmung ist mein Diamond.&ldquo;
            </p>
          </div>
        </div>
      </div>
    `;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.panel) {
      this.panel.classList.toggle('diamond-sidebar-open', this.isOpen);
    }
    // Push page content
    document.body.classList.toggle('diamond-body-shifted', this.isOpen);
  }

  open() {
    if (!this.isOpen) this.toggle();
  }

  close() {
    if (this.isOpen) this.toggle();
  }

  switchTab(tabName) {
    this.panel.querySelectorAll('.diamond-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    this.panel.querySelectorAll('.diamond-tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `diamond-tab-${tabName}`);
    });
  }

  /**
   * Show analysis of selected text – replaces main view temporarily
   */
  showSelectionAnalysis(selSummary, selEssenz, originalText, selProfiteur) {
    if (!this.panel) return;

    // Show selection indicator
    let selBanner = this.panel.querySelector('#diamond-selection-banner');
    if (!selBanner) {
      selBanner = document.createElement('div');
      selBanner.id = 'diamond-selection-banner';
      const scoreSection = this.panel.querySelector('#diamond-essenz-section');
      if (scoreSection) {
        scoreSection.parentNode.insertBefore(selBanner, scoreSection);
      }
    }

    // Truncate original text for display
    const displayText = originalText.length > 120
      ? originalText.substring(0, 120) + '...'
      : originalText;

    selBanner.innerHTML = `
      <div class="diamond-sel-banner">
        <div class="diamond-sel-banner-header">
          <span class="diamond-sel-banner-icon">&#9998;</span>
          <span class="diamond-sel-banner-title">SELEKTION</span>
          <button class="diamond-sel-close" id="diamond-sel-close-btn">&times; Zur&uuml;ck</button>
        </div>
        <div class="diamond-sel-banner-text">&bdquo;${this._escapeHtmlSafe(displayText)}&ldquo;</div>
      </div>
    `;
    selBanner.style.display = 'block';

    // Close button
    const closeBtn = selBanner.querySelector('#diamond-sel-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.clearSelectionMode();
      });
    }

    // Update essenz, profiteur, and score with selection data
    this.updateEssenz(selEssenz);
    if (selProfiteur) this.updateProfiteur(selProfiteur);
    this.updateResults(selSummary);
  }

  /**
   * Exit selection mode, return to full page view
   */
  clearSelectionMode() {
    const banner = this.panel ? this.panel.querySelector('#diamond-selection-banner') : null;
    if (banner) {
      banner.style.display = 'none';
    }
    // Notify content.js to restore full-page analysis
    document.dispatchEvent(new CustomEvent('diamond-selection-cleared'));
  }

  _escapeHtmlSafe(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  updateProfiteur(profResult) {
    console.log('[DIAMOND] updateProfiteur called with:', typeof profResult === 'object' ? profResult.text : profResult);
    const el = this.panel ? this.panel.querySelector('#diamond-profiteur-text') : null;
    const section = this.panel ? this.panel.querySelector('#diamond-profiteur-section') : null;
    const chipsEl = this.panel ? this.panel.querySelector('#diamond-profiteur-chips') : null;
    if (!el || !section) return;

    const text = (typeof profResult === 'object' && profResult !== null) ? profResult.text : profResult;
    const profiteers = (typeof profResult === 'object' && profResult !== null) ? profResult.profiteers : [];

    if (text && text.length > 10) {
      el.textContent = text;
      section.classList.remove('diamond-essenz-empty');
      section.classList.add('diamond-essenz-visible');

      // Show profiteer chips with type indicators
      if (chipsEl && profiteers.length > 0) {
        const TYPE_ICONS = { direct: '\u{1F3AF}', indirect: '\u{1F310}', hidden: '\u{1F441}' };
        const TYPE_LABELS = { direct: 'Direkt', indirect: 'Indirekt', hidden: 'Verborgen' };
        const chips = profiteers.map(p => {
          const icon = TYPE_ICONS[p.type] || '\u25C6';
          const typeLabel = TYPE_LABELS[p.type] || p.type;
          return `<span class="diamond-prof-chip diamond-prof-${p.type}" title="${typeLabel}: ${p.gain}">` +
            `${icon} ${p.actor}</span>`;
        });
        chipsEl.innerHTML = chips.join('');
        chipsEl.style.display = 'flex';
      } else if (chipsEl) {
        chipsEl.style.display = 'none';
      }
    } else {
      el.textContent = 'Keine Profiteure identifiziert.';
      section.classList.add('diamond-essenz-empty');
      section.classList.remove('diamond-essenz-visible');
      if (chipsEl) chipsEl.style.display = 'none';
    }
  }

  updateEssenz(gfpResult) {
    console.log('[DIAMOND] updateEssenz called with:', typeof gfpResult === 'object' ? gfpResult.text : gfpResult);
    const el = this.panel ? this.panel.querySelector('#diamond-essenz-text') : null;
    const section = this.panel ? this.panel.querySelector('#diamond-essenz-section') : null;
    const categoryTag = this.panel ? this.panel.querySelector('#diamond-category-tag') : null;
    const metaEl = this.panel ? this.panel.querySelector('#diamond-gfp-meta') : null;
    if (!el || !section) return;

    // Support both old string format and new object format
    const text = (typeof gfpResult === 'object' && gfpResult !== null) ? gfpResult.text : gfpResult;
    const category = (typeof gfpResult === 'object' && gfpResult !== null) ? gfpResult.category : null;
    const resource = (typeof gfpResult === 'object' && gfpResult !== null) ? gfpResult.resource : null;
    const mechanism = (typeof gfpResult === 'object' && gfpResult !== null) ? gfpResult.mechanism : null;
    const strategy = (typeof gfpResult === 'object' && gfpResult !== null) ? gfpResult.strategy : null;

    if (text && text.length > 10) {
      el.textContent = text;
      section.classList.remove('diamond-essenz-empty');
      section.classList.add('diamond-essenz-visible');

      // Show category tag
      if (categoryTag && category) {
        categoryTag.innerHTML = `<span class="diamond-cat-icon">${category.icon}</span> <span class="diamond-cat-label">${category.label}</span>`;
        categoryTag.style.display = 'flex';
        categoryTag.title = 'Erkannte Artikelkategorie';
      }

      // Show meta info (resource + mechanism + strategy)
      if (metaEl) {
        const parts = [];
        if (resource) parts.push(`<span class="diamond-gfp-chip" title="Ressource (Schnitt 1)">&#9670; ${resource.label}</span>`);
        if (mechanism) parts.push(`<span class="diamond-gfp-chip" title="Mechanik (Schnitt 3)">&#9881; ${mechanism.shortLabel}</span>`);
        if (strategy) parts.push(`<span class="diamond-gfp-chip diamond-gfp-strategy" title="Kompositionsstrategie">&#9654; ${strategy}</span>`);
        if (parts.length > 0) {
          metaEl.innerHTML = parts.join('');
          metaEl.style.display = 'flex';
        } else {
          metaEl.style.display = 'none';
        }
      }
    } else {
      el.textContent = 'Kein Artikeltext erkannt.';
      section.classList.add('diamond-essenz-empty');
      section.classList.remove('diamond-essenz-visible');
      if (categoryTag) categoryTag.style.display = 'none';
      if (metaEl) metaEl.style.display = 'none';
    }
  }

  updateResults(summary) {
    this.summary = summary;

    // Update score
    const score = summary.manipulationScore;
    const scoreValue = this.panel.querySelector('#diamond-score-value');
    const scoreCircle = this.panel.querySelector('#diamond-score-circle');
    const scoreLabel = this.panel.querySelector('#diamond-score-label');

    if (scoreValue) {
      scoreValue.textContent = score;
    }

    if (scoreCircle) {
      const circumference = 264;
      const offset = circumference - (score / 100) * circumference;
      scoreCircle.style.strokeDashoffset = offset;
      scoreCircle.style.transition = 'stroke-dashoffset 1.5s ease-out';
    }

    if (scoreLabel) {
      if (score === 0) {
        scoreLabel.textContent = 'Keine Manipulation erkannt';
        scoreLabel.className = 'diamond-score-label diamond-score-clean';
      } else if (score < 20) {
        scoreLabel.textContent = 'Leichte Tendenzen';
        scoreLabel.className = 'diamond-score-label diamond-score-low';
      } else if (score < 50) {
        scoreLabel.textContent = 'Deutliche Manipulation';
        scoreLabel.className = 'diamond-score-label diamond-score-medium';
      } else {
        scoreLabel.textContent = 'Starke Manipulation';
        scoreLabel.className = 'diamond-score-label diamond-score-high';
      }
    }

    // Update channel bars
    this.updateChannelBars(summary);

    // Update details
    this.updateDetails(summary);
  }

  updateChannelBars(summary) {
    const container = this.panel.querySelector('#diamond-channel-bars');
    if (!container) return;

    const maxCount = Math.max(1, ...Object.values(summary.channels).map(c => c.count));

    let html = '';
    const channelOrder = ['infrared', 'orange', 'yellow', 'green', 'blue', 'ultraviolet'];

    channelOrder.forEach(channelId => {
      const channel = summary.channels[channelId];
      if (!channel) return;

      const percentage = (channel.count / maxCount) * 100;
      const lang = document.documentElement.lang === 'en' ? 'en' : 'de';
      const label = channel.label[lang] || channel.label.de;

      html += `
        <div class="diamond-bar-row" data-channel="${channelId}">
          <div class="diamond-bar-label">
            <span class="diamond-bar-icon">${channel.icon}</span>
            <span class="diamond-bar-name">${label}</span>
            <span class="diamond-bar-count">${channel.count}</span>
          </div>
          <div class="diamond-bar-track">
            <div class="diamond-bar-fill" style="width: ${percentage}%; background: ${channel.color}; transition: width 1s ease-out"></div>
          </div>
        </div>
      `;
    });

    if (summary.totalMatches === 0) {
      html = `
        <div class="diamond-no-results">
          <div class="diamond-clean-icon">&#9830;</div>
          <p>Diese Seite erscheint neutral.</p>
          <p class="diamond-subtext">Keine bekannten Manipulationsmuster erkannt.</p>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  updateDetails(summary) {
    const container = this.panel.querySelector('#diamond-details-list');
    if (!container) return;

    let html = '';

    if (summary.topPatterns.length > 0) {
      html += '<div class="diamond-details-section">';
      html += '<h4 class="diamond-details-heading">H&auml;ufigste Muster</h4>';

      summary.topPatterns.forEach(({ pattern, count }) => {
        // Find which channel this pattern belongs to
        let channelColor = '#8e8e93';
        Object.values(summary.channels).forEach(ch => {
          if (ch.matches && ch.matches.some(m => m.toLowerCase().includes(pattern.toLowerCase()))) {
            channelColor = ch.color;
          }
        });

        html += `
          <div class="diamond-detail-item">
            <span class="diamond-detail-dot" style="background:${channelColor}"></span>
            <span class="diamond-detail-text">&bdquo;${this.escapeHtml(pattern)}&ldquo;</span>
            <span class="diamond-detail-count">&times;${count}</span>
          </div>
        `;
      });

      html += '</div>';
    }

    // Show matches per channel
    const channelOrder = ['infrared', 'orange', 'yellow', 'green', 'blue', 'ultraviolet'];
    channelOrder.forEach(channelId => {
      const channel = summary.channels[channelId];
      if (!channel || channel.count === 0) return;

      const lang = document.documentElement.lang === 'en' ? 'en' : 'de';
      const label = channel.label[lang] || channel.label.de;

      html += `<div class="diamond-details-section">`;
      html += `<h4 class="diamond-details-heading" style="color:${channel.color}">${channel.icon} ${label}</h4>`;

      // Show unique matches
      const uniqueMatches = [...new Set(channel.matches.map(m => m.toLowerCase()))].slice(0, 8);
      uniqueMatches.forEach(match => {
        html += `
          <div class="diamond-detail-item">
            <span class="diamond-detail-dot" style="background:${channel.color}"></span>
            <span class="diamond-detail-text">${this.escapeHtml(match)}</span>
          </div>
        `;
      });

      html += '</div>';
    });

    if (!html) {
      html = '<div class="diamond-no-results"><p>Keine Details verf&uuml;gbar.</p></div>';
    }

    container.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════
  // MODULE MANAGER UI
  // ═══════════════════════════════════════

  initModuleManager(modulmanager) {
    this._modulmanager = modulmanager;

    // "Add" button
    const addBtn = this.panel.querySelector('#diamond-module-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._openEditor(null));

    // Editor close
    const closeBtn = this.panel.querySelector('#diamond-editor-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this._closeEditor());

    // Save
    const saveBtn = this.panel.querySelector('#diamond-editor-save');
    if (saveBtn) saveBtn.addEventListener('click', () => this._saveModule());

    // Delete
    const delBtn = this.panel.querySelector('#diamond-editor-delete');
    if (delBtn) delBtn.addEventListener('click', () => this._deleteModule());

    // Add rule
    const addRuleBtn = this.panel.querySelector('#diamond-editor-add-rule');
    if (addRuleBtn) addRuleBtn.addEventListener('click', () => this._addRuleRow());

    this.renderModuleList();
  }

  renderModuleList() {
    if (!this._modulmanager) return;
    const container = this.panel.querySelector('#diamond-module-list');
    if (!container) return;

    const modules = this._modulmanager.getAllModules();
    let html = '';

    for (const mod of modules) {
      const checked = mod.enabled ? 'checked' : '';
      const builtinBadge = mod.builtin
        ? '<span class="diamond-mod-badge diamond-mod-builtin">Eingebaut</span>'
        : '<span class="diamond-mod-badge diamond-mod-custom">Eigenes Destillat</span>';
      const versionBadge = mod.version ? `<span class="diamond-mod-version">v${mod.version}</span>` : '';
      const editBtn = mod.builtin
        ? ''
        : `<button class="diamond-mod-edit-btn" data-module-id="${mod.id}" title="Bearbeiten">\u270E</button>`;
      const ruleCount = mod.ruleCount ? `<span class="diamond-mod-rules">${mod.ruleCount} Regeln</span>` : '';

      html += `
        <div class="diamond-mod-card${mod.enabled ? '' : ' diamond-mod-disabled'}" data-module-id="${mod.id}">
          <div class="diamond-mod-card-header">
            <span class="diamond-mod-icon" style="color:${mod.color}">${mod.icon}</span>
            <div class="diamond-mod-info">
              <div class="diamond-mod-name-row">
                <span class="diamond-mod-name">${mod.name}</span>
                ${builtinBadge}${versionBadge}${ruleCount}
              </div>
              <span class="diamond-mod-desc">${mod.description}</span>
            </div>
            <div class="diamond-mod-actions">
              ${editBtn}
              <label class="diamond-mod-toggle">
                <input type="checkbox" class="diamond-mod-checkbox" data-module-id="${mod.id}" ${checked}>
                <span class="diamond-mod-slider"></span>
              </label>
            </div>
          </div>
          <div class="diamond-mod-details">
            ${(mod.details || []).map(d => `<div class="diamond-mod-detail-item">\u2022 ${d}</div>`).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Bind toggle events
    container.querySelectorAll('.diamond-mod-checkbox').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        const moduleId = e.target.dataset.moduleId;
        await this._modulmanager.toggleModule(moduleId);
        this.renderModuleList();
        // Notify content.js to re-run analysis
        document.dispatchEvent(new CustomEvent('diamond-modules-changed'));
      });
    });

    // Bind edit buttons
    container.querySelectorAll('.diamond-mod-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const moduleId = e.target.dataset.moduleId;
        const config = this._modulmanager.getCustomConfig(moduleId);
        if (config) this._openEditor(config);
      });
    });
  }

  /**
   * Show custom module results in the Module tab
   */
  renderCustomResults(results) {
    const container = this.panel ? this.panel.querySelector('#diamond-custom-results') : null;
    if (!container) return;

    const entries = Object.entries(results).filter(([, r]) => r.text);
    if (entries.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = '<div class="diamond-custom-results-header">Eigene Destillat-Ergebnisse</div>';
    for (const [moduleId, result] of entries) {
      const config = this._modulmanager ? this._modulmanager.getCustomConfig(moduleId) : null;
      const icon = config ? config.icon : '\u{1F52C}';
      const name = config ? config.name : moduleId;
      const color = config ? config.color : '#8E8E93';

      html += `
        <div class="diamond-custom-result-card" style="border-left-color: ${color}">
          <div class="diamond-custom-result-header">
            <span>${icon}</span>
            <strong>${name}</strong>
          </div>
          <div class="diamond-custom-result-text">${this.escapeHtml(result.text)}</div>
          ${result.matches.length > 0 ? `
            <div class="diamond-custom-result-matches">
              ${result.matches.slice(0, 5).map(m =>
                `<span class="diamond-custom-match-chip" title="${m.context}">${m.label} (${m.count || 1}x)</span>`
              ).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ─── EDITOR ───

  _openEditor(existingConfig) {
    const editor = this.panel.querySelector('#diamond-module-editor');
    if (!editor) return;

    this._editingModuleId = existingConfig ? existingConfig.id : null;

    // Set title
    const title = editor.querySelector('#diamond-editor-title');
    if (title) title.textContent = existingConfig ? 'Destillat bearbeiten' : 'Neues Destillat';

    // Fill fields
    editor.querySelector('#diamond-editor-name').value = existingConfig ? existingConfig.name : '';
    editor.querySelector('#diamond-editor-icon').value = existingConfig ? existingConfig.icon : '\u{1F52C}';
    editor.querySelector('#diamond-editor-color').value = existingConfig ? existingConfig.color : '#8E8E93';
    editor.querySelector('#diamond-editor-desc').value = existingConfig ? existingConfig.description : '';
    editor.querySelector('#diamond-editor-template').value = existingConfig ? existingConfig.template : '{{matches}}';

    // Delete button
    const delBtn = editor.querySelector('#diamond-editor-delete');
    if (delBtn) delBtn.style.display = existingConfig ? 'inline-flex' : 'none';

    // Rules
    const rulesContainer = editor.querySelector('#diamond-editor-rules');
    rulesContainer.innerHTML = '';
    if (existingConfig && existingConfig.rules) {
      existingConfig.rules.forEach(r => this._addRuleRow(r));
    } else {
      this._addRuleRow(); // Start with one empty rule
    }

    editor.style.display = 'block';
  }

  _closeEditor() {
    const editor = this.panel.querySelector('#diamond-module-editor');
    if (editor) editor.style.display = 'none';
    this._editingModuleId = null;
  }

  _addRuleRow(ruleData) {
    const container = this.panel.querySelector('#diamond-editor-rules');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'diamond-rule-row';
    row.innerHTML = `
      <input type="text" class="diamond-rule-pattern" placeholder="RegExp (z.B. klimawandel|erderwärmung)" value="${(ruleData && ruleData.pattern) || ''}" />
      <input type="text" class="diamond-rule-label" placeholder="Label (z.B. Klimaangst)" value="${(ruleData && ruleData.label) || ''}" />
      <select class="diamond-rule-category">
        <option value="neutral" ${(!ruleData || ruleData.category === 'neutral') ? 'selected' : ''}>Neutral</option>
        <option value="gain" ${(ruleData && ruleData.category === 'gain') ? 'selected' : ''}>Gewinn</option>
        <option value="loss" ${(ruleData && ruleData.category === 'loss') ? 'selected' : ''}>Verlust</option>
        <option value="risk" ${(ruleData && ruleData.category === 'risk') ? 'selected' : ''}>Risiko</option>
      </select>
      <button class="diamond-rule-remove" title="Entfernen">&times;</button>
    `;

    row.querySelector('.diamond-rule-remove').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  async _saveModule() {
    const editor = this.panel.querySelector('#diamond-module-editor');
    if (!editor || !this._modulmanager) return;

    const name = editor.querySelector('#diamond-editor-name').value.trim();
    if (!name) {
      editor.querySelector('#diamond-editor-name').style.borderColor = '#FF3B30';
      return;
    }

    const config = {
      id: this._editingModuleId || undefined,
      name,
      icon: editor.querySelector('#diamond-editor-icon').value || '\u{1F52C}',
      color: editor.querySelector('#diamond-editor-color').value || '#8E8E93',
      description: editor.querySelector('#diamond-editor-desc').value || '',
      template: editor.querySelector('#diamond-editor-template').value || '{{matches}}',
      rules: [],
    };

    // Collect rules
    editor.querySelectorAll('.diamond-rule-row').forEach(row => {
      const pattern = row.querySelector('.diamond-rule-pattern').value.trim();
      const label = row.querySelector('.diamond-rule-label').value.trim();
      const category = row.querySelector('.diamond-rule-category').value;
      if (pattern && label) {
        // Validate regex
        try {
          new RegExp(pattern, 'gi');
          config.rules.push({ pattern, label, category, flags: 'gi', weight: 1 });
        } catch (e) {
          row.querySelector('.diamond-rule-pattern').style.borderColor = '#FF3B30';
        }
      }
    });

    if (config.rules.length === 0) {
      // Highlight rules section
      return;
    }

    if (this._editingModuleId) {
      await this._modulmanager.updateCustomModule(this._editingModuleId, config);
    } else {
      await this._modulmanager.addCustomModule(config);
    }

    this._closeEditor();
    this.renderModuleList();

    // Trigger re-analysis
    document.dispatchEvent(new CustomEvent('diamond-modules-changed'));
  }

  async _deleteModule() {
    if (!this._editingModuleId || !this._modulmanager) return;
    await this._modulmanager.deleteCustomModule(this._editingModuleId);
    this._closeEditor();
    this.renderModuleList();
    document.dispatchEvent(new CustomEvent('diamond-modules-changed'));
  }
}

if (typeof window !== 'undefined') {
  window.DiamondSidebar = DiamondSidebar;
}
