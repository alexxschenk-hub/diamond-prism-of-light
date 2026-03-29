/**
 * DIAMOND – Modulmanager v1.0
 * "Dein Prisma, deine Regeln."
 *
 * Registry für alle Analyse-Module (Destillate).
 * Ermöglicht:
 *   - Überblick über eingebaute Module
 *   - Ein-/Ausschalten von Modulen
 *   - Erstellen eigener benutzerdefinierter Destillate
 *   - Persistenz via chrome.storage.local
 *
 * Architektur:
 *   Built-in Module werden als statische Einträge registriert.
 *   Benutzerdefinierte Module sind regelbasiert:
 *     Regeln = [ { pattern: "RegExp-String", label: "Was es bedeutet", category: "gain|loss|risk" } ]
 *     Template = "{{actor}} {{verb}} {{label}} durch {{pattern_context}}"
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // BUILT-IN MODULE REGISTRY
  // ═══════════════════════════════════════════════════════

  const BUILTIN_MODULES = [
    {
      id: 'spektrum',
      name: 'Spektralanalyse',
      icon: '\u{1F308}',
      color: '#AF52DE',
      description: 'Spaltet Nachrichten in 6 Manipulations-Farbkan\u00e4le auf: Angst, Dringlichkeit, Profit, Gruppenbildung, Autorit\u00e4t, Ethik.',
      details: [
        '\u{1F534} Infrarot \u2013 Angst & Bedrohung',
        '\u{1F7E0} Orange \u2013 K\u00fcnstliche Dringlichkeit',
        '\u{1F7E1} Gelb \u2013 Interessen & Profit',
        '\u{1F7E2} Gr\u00fcn \u2013 Wir gegen Die',
        '\u{1F535} Blau \u2013 K\u00fcnstliche Autorit\u00e4t',
        '\u{1F7E3} Ultraviolett \u2013 Ethische \u00dcberh\u00f6hung',
      ],
      builtin: true,
      enabled: true,
      version: '1.0',
    },
    {
      id: 'gefrierpunkt',
      name: 'Gefrierpunkt',
      icon: '\u2744',
      color: '#78C8FF',
      description: 'Destilliert die nackte Machtmechanik: Wer will was von wem mit welchem Hebel? Max. 15 W\u00f6rter.',
      details: [
        'Schnitt 1: Ressource \u2013 Was ist der reale Einsatz?',
        'Schnitt 2: Profiteur \u2013 Wer profitiert?',
        'Schnitt 3: Mechanik \u2013 Welcher psychologische Hebel?',
        '7 Kategorien: Geopolitik, Innenpolitik, Wirtschaft, Gesundheit, Digital, Klima, Gesellschaft',
        '12+ Ressourcentypen (Geld, Waffen, Leben, Territorium, ...)',
        '12+ Mechanismen (Angst, Druck, Feindbild, Hoffnung, ...)',
      ],
      builtin: true,
      enabled: true,
      version: '2.0',
    },
    {
      id: 'profiteure',
      name: 'Profiteure',
      icon: '\u{1F4B0}',
      color: '#FFB932',
      description: 'Identifiziert bis zu 3 Profiteure auf 3 Ebenen: Direkte, indirekte und verborgene Gewinner.',
      details: [
        '\u{1F3AF} Direkt \u2013 Explizit im Text genannte Profiteure',
        '\u{1F310} Indirekt \u2013 Geopolitische/strategische Gewinner',
        '\u{1F441} Verborgen \u2013 Industrien/Sektoren die implizit profitieren',
        '10 Gain-Typen: Erpressung, Ablenkung, Markt, Kontrolle, Kapital, ...',
        'Geopolitische Interessen-Matrix',
        'Automatische Industrie-Erkennung',
      ],
      builtin: true,
      enabled: true,
      version: '1.0',
    },
  ];

  // ═══════════════════════════════════════════════════════
  // CUSTOM DESTILLAT ENGINE
  // Rule-based pattern matching for user-created modules
  // ═══════════════════════════════════════════════════════

  class CustomDestillat {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.icon = config.icon || '\u{1F52C}';
      this.color = config.color || '#8E8E93';
      this.description = config.description || '';
      this.rules = (config.rules || []).map(r => ({
        pattern: new RegExp(r.pattern, r.flags || 'gi'),
        patternStr: r.pattern,
        flags: r.flags || 'gi',
        label: r.label,
        category: r.category || 'neutral', // gain, loss, risk, neutral
        weight: r.weight || 1,
      }));
      this.template = config.template || '{{matches}}';
    }

    extract(text) {
      if (!text || text.length < 50) {
        return { text: '', matches: [], toString() { return ''; } };
      }

      const matches = [];
      const lower = text.toLowerCase();

      for (const rule of this.rules) {
        const rx = new RegExp(rule.patternStr, rule.flags);
        let m;
        let count = 0;
        while ((m = rx.exec(text)) !== null) {
          count++;
          if (count === 1) {
            matches.push({
              label: rule.label,
              category: rule.category,
              weight: rule.weight,
              context: m[0],
              index: m.index,
            });
          }
        }
        // Add count to last match
        if (count > 0) {
          matches[matches.length - 1].count = count;
        }
      }

      // Sort by position in text
      matches.sort((a, b) => a.index - b.index);

      // Compose result
      const resultText = this._compose(matches, text);

      return {
        text: resultText,
        matches,
        toString() { return this.text; },
      };
    }

    _compose(matches, text) {
      if (matches.length === 0) return '';

      // Simple template-based composition
      const labels = matches.map(m => m.label);
      const uniqueLabels = [...new Set(labels)];
      const matchSummary = uniqueLabels.slice(0, 4).join(', ');

      // Group by category
      const byCategory = {};
      for (const m of matches) {
        if (!byCategory[m.category]) byCategory[m.category] = [];
        byCategory[m.category].push(m);
      }

      let result = this.template
        .replace('{{matches}}', matchSummary)
        .replace('{{count}}', String(matches.length))
        .replace('{{gains}}', (byCategory.gain || []).map(m => m.label).join(', ') || 'keine')
        .replace('{{losses}}', (byCategory.loss || []).map(m => m.label).join(', ') || 'keine')
        .replace('{{risks}}', (byCategory.risk || []).map(m => m.label).join(', ') || 'keine');

      return result || matchSummary;
    }

    // Serialize for storage (no RegExp objects)
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        icon: this.icon,
        color: this.color,
        description: this.description,
        rules: this.rules.map(r => ({
          pattern: r.patternStr,
          flags: r.flags,
          label: r.label,
          category: r.category,
          weight: r.weight,
        })),
        template: this.template,
      };
    }
  }

  // ═══════════════════════════════════════════════════════
  // MODULE MANAGER CLASS
  // ═══════════════════════════════════════════════════════

  class DiamondModulmanager {
    constructor() {
      this.builtinModules = BUILTIN_MODULES;
      this.customModules = [];       // CustomDestillat instances
      this.customConfigs = [];       // Raw config for storage
      this.moduleStates = {};        // { moduleId: boolean }
      this._loaded = false;
    }

    /**
     * Load saved state from chrome.storage
     */
    async load() {
      if (this._loaded) return;
      try {
        const data = await this._storageGet(['diamond_modules_state', 'diamond_custom_modules']);
        this.moduleStates = data.diamond_modules_state || {};
        this.customConfigs = data.diamond_custom_modules || [];

        // Apply saved states to builtins
        for (const mod of this.builtinModules) {
          if (this.moduleStates[mod.id] !== undefined) {
            mod.enabled = this.moduleStates[mod.id];
          }
        }

        // Instantiate custom modules
        this.customModules = this.customConfigs.map(c => new CustomDestillat(c));
      } catch (e) {
        console.warn('[DIAMOND] Modulmanager: storage load failed', e);
      }
      this._loaded = true;
    }

    /**
     * Save state to chrome.storage
     */
    async save() {
      try {
        await this._storageSet({
          diamond_modules_state: this.moduleStates,
          diamond_custom_modules: this.customConfigs,
        });
      } catch (e) {
        console.warn('[DIAMOND] Modulmanager: storage save failed', e);
      }
    }

    /**
     * Get all modules (builtin + custom)
     */
    getAllModules() {
      const customs = this.customConfigs.map((c, i) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '\u{1F52C}',
        color: c.color || '#8E8E93',
        description: c.description || '',
        details: (c.rules || []).map(r => `${r.label} (/${r.pattern}/)`),
        builtin: false,
        enabled: this.moduleStates[c.id] !== false,
        version: 'custom',
        ruleCount: (c.rules || []).length,
      }));
      return [...this.builtinModules, ...customs];
    }

    /**
     * Toggle a module on/off
     */
    async toggleModule(moduleId) {
      const mod = this.builtinModules.find(m => m.id === moduleId);
      if (mod) {
        mod.enabled = !mod.enabled;
        this.moduleStates[moduleId] = mod.enabled;
      } else {
        // Custom module
        const currentState = this.moduleStates[moduleId] !== false;
        this.moduleStates[moduleId] = !currentState;
      }
      await this.save();
      return this.moduleStates[moduleId] !== false;
    }

    /**
     * Check if a module is enabled
     */
    isEnabled(moduleId) {
      if (this.moduleStates[moduleId] !== undefined) return this.moduleStates[moduleId];
      const mod = this.builtinModules.find(m => m.id === moduleId);
      return mod ? mod.enabled : true;
    }

    /**
     * Add a new custom module
     */
    async addCustomModule(config) {
      // Generate ID from name
      config.id = config.id || 'custom_' + config.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
      this.customConfigs.push(config);
      this.customModules.push(new CustomDestillat(config));
      this.moduleStates[config.id] = true;
      await this.save();
      return config.id;
    }

    /**
     * Update an existing custom module
     */
    async updateCustomModule(moduleId, config) {
      const idx = this.customConfigs.findIndex(c => c.id === moduleId);
      if (idx === -1) return false;
      config.id = moduleId;
      this.customConfigs[idx] = config;
      this.customModules[idx] = new CustomDestillat(config);
      await this.save();
      return true;
    }

    /**
     * Delete a custom module
     */
    async deleteCustomModule(moduleId) {
      const idx = this.customConfigs.findIndex(c => c.id === moduleId);
      if (idx === -1) return false;
      this.customConfigs.splice(idx, 1);
      this.customModules.splice(idx, 1);
      delete this.moduleStates[moduleId];
      await this.save();
      return true;
    }

    /**
     * Run a custom module on text
     */
    runCustomModule(moduleId, text) {
      const mod = this.customModules.find(m => m.id === moduleId);
      if (!mod) return { text: '', matches: [] };
      return mod.extract(text);
    }

    /**
     * Run ALL enabled custom modules and return combined results
     */
    runAllCustomModules(text) {
      const results = {};
      for (const mod of this.customModules) {
        if (this.isEnabled(mod.id)) {
          results[mod.id] = mod.extract(text);
        }
      }
      return results;
    }

    /**
     * Get a custom module's config for editing
     */
    getCustomConfig(moduleId) {
      return this.customConfigs.find(c => c.id === moduleId) || null;
    }

    // ─── STORAGE HELPERS ───

    _storageGet(keys) {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(keys, resolve);
        } else {
          // Fallback for testing
          resolve({});
        }
      });
    }

    _storageSet(data) {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set(data, resolve);
        } else {
          resolve();
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════

  window.DiamondModulmanager = DiamondModulmanager;

})();
