/**
 * DIAMOND – Profiteur-Destillat Engine v1.0
 * "Wer profitiert wirklich?"
 *
 * Identifiziert bis zu 3 Profiteure (direkt, indirekt, verborgen)
 * und destilliert für jeden, WAS er gewinnt.
 *
 * Ergebnis: Ein einziger, verbundener Satz.
 *
 * Architektur:
 *   1. Akteur-Extraktion (erweitert: auch implizite Profiteure)
 *   2. Gain-Mapping: Was gewinnt jeder Akteur? (Macht, Geld, Kontrolle, Ablenkung...)
 *   3. Komposition: Verbundener deutscher Satz
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // GAIN CATEGORIES – Was kann man gewinnen?
  // ═══════════════════════════════════════════════════════

  const GAIN_TYPES = [
    {
      id: 'ERPRESSUNG', label: 'geopolitische Erpressungsmacht',
      patterns: [
        /erpressung/i, /droh\w*\s+mit/i, /vergeltung/i, /eskalation/i,
        /keil\s+(?:in|zwischen)/i, /destabilisier/i, /bedroh/i,
        /blockier/i, /abriegeln/i, /abschneid/i, /unterbind/i,
        /druck\w*\s+(?:auf|gegen)/i, /nötig/i,
      ],
    },
    {
      id: 'ABLENKUNG', label: 'strategische Ablenkung',
      patterns: [
        /ablenk/i, /nebenschauplatz/i, /zweite\s+front/i,
        /gleichzeitig/i, /parallel/i, /gebunden/i, /beschäftigt/i,
        /kräfte\s+binden/i, /aufmerksamkeit\s+(?:von|ab)/i,
        /überlast/i, /überdehnung/i,
      ],
    },
    {
      id: 'MARKT', label: 'Marktdominanz',
      patterns: [
        /marktanteil/i, /monopol/i, /dominan/i, /marktführer/i,
        /wettbewerbsvorteil/i, /anbieter/i, /anbieterwechsel/i,
        /kunden\s+(?:gewinnen|abwerben|übernehmen)/i,
        /abhängigkeit/i, /lock-?in/i, /migrieren/i,
        /alternativ\w*\s+(?:suchen|finden|nutzen)/i,
      ],
    },
    {
      id: 'KONTROLLE', label: 'Kontrolle',
      patterns: [
        /kontroll/i, /zugriff/i, /überwach/i, /steuer\w*(?:ung)?/i,
        /regulier/i, /bestimm/i, /verfüg\w*\s+über/i,
        /monopol/i, /alleini/i, /gateway/i, /nadelöhr/i,
        /daten\w*\s*(?:ström|fluss|verkehr|transfer)/i,
      ],
    },
    {
      id: 'KAPITAL', label: 'Kapitalzufluss',
      patterns: [
        /milliard/i, /million/i, /billion/i, /investit/i,
        /profit/i, /gewinn/i, /umsatz/i, /rendite/i,
        /verdien/i, /einnahm/i, /wachst/i, /kapital/i,
        /subvention/i, /förder(?:ung|mittel)/i, /auftrag/i,
        /ausgaben\w*\s+(?:steig|erhöh|wachs)/i, /budget/i,
      ],
    },
    {
      id: 'MACHTPOSITION', label: 'Machtausbau',
      patterns: [
        /einfluss/i, /machtvakuum/i, /position\w*\s+stärk/i,
        /vormachtstellung/i, /hegemoni/i, /ausdehn/i,
        /strategi/i, /geopoliti/i, /machtanspruch/i,
        /verhandlungsposition/i, /sicherheitsarchitektur/i,
      ],
    },
    {
      id: 'LEGITIMATION', label: 'Legitimation',
      patterns: [
        /legitim/i, /rechtfertig/i, /begründ/i,
        /notwendig/i, /alternativlos/i, /unvermeidlich/i,
        /sicherheit\w*\s+(?:argument|begründ|als)/i,
        /vorwand/i, /anlass/i,
      ],
    },
    {
      id: 'TERRAIN', label: 'Territorialgewinn',
      patterns: [
        /gebiet/i, /territoriu/i, /annex/i, /besetz/i,
        /erobert?/i, /einnehmen/i, /vorrücken/i,
        /pufferzone/i, /sicherheitszone/i, /grenzgebiet/i,
      ],
    },
    {
      id: 'INFRASTRUKTUR', label: 'Infrastrukturkontrolle',
      patterns: [
        /infrastruktur/i, /rechenzent/i, /kabel/i, /pipeline/i,
        /hafen/i, /engstelle/i, /knotenpunkt/i, /nadelöhr/i,
        /netzwerk/i, /versorgungskette/i, /lieferkette/i,
        /daten\w*\s*zentrum/i, /server/i, /cloud/i,
      ],
    },
    {
      id: 'RUESTUNG', label: 'Rüstungsnachfrage',
      patterns: [
        /rüstung/i, /waffenlieferung/i, /verteidigungsausgab/i,
        /militärausgab/i, /aufrüst/i, /nachrüst/i,
        /waffensystem/i, /kampfjet/i, /panzer/i,
        /luftabwehr/i, /munition/i, /drohne/i,
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════
  // PROFITEUR CATEGORIES – Wer profitiert?
  // ═══════════════════════════════════════════════════════

  // Direct actors: Explicitly named in the text
  // Indirect actors: States/orgs that benefit from described dynamics
  // Hidden actors: Industries/sectors that profit from the situation

  const INDIRECT_PROFITEUR_RULES = [
    // Conflict → arms industry profits
    {
      trigger: /(?:krieg|konflikt|angriff|bombardier|eskalation|aufrüst|verteidigungsausgab)/i,
      profiteur: 'Rüstungsindustrie',
      gain: 'steigender Rüstungsnachfrage',
      gainId: 'RUESTUNG',
      type: 'hidden',
    },
    // IT-infrastructure attack → alternative providers profit
    {
      trigger: /(?:rechenzent|cloud|server|datenausfall|it-infrastruktur)\w*\s+(?:angriff|angegriff|brand|zerstör|ausfall)/i,
      profiteur: null, // dynamically determined
      gainId: 'MARKT',
      gain: 'Kundenmigration nach Infrastruktur-Ausfall',
      type: 'hidden',
      dynamicProfiteur: (text) => {
        // If US tech companies mentioned, they might benefit from data migration
        if (/(?:google|microsoft|oracle|starlink)\b/i.test(text)) return 'US-Tech-Konzerne';
        if (/(?:aws|amazon\s+web)/i.test(text)) return 'konkurrierende Cloud-Anbieter';
        return 'alternative Infrastrukturanbieter';
      },
    },
    // Data/cable infrastructure threat → satellite/alternative providers
    {
      trigger: /(?:unterseekabel|seekabel|kabel)\w*\s+(?:bedroht?|beschädig|unterbrech|gefährd|sabotag)/i,
      profiteur: null,
      gainId: 'KONTROLLE',
      gain: 'Kontrolle über alternative Datenrouten',
      type: 'hidden',
      dynamicProfiteur: (text) => {
        if (/starlink|spacex|satellit/i.test(text)) return 'Satelliten-Anbieter (Starlink)';
        if (/usa|us-|amerika/i.test(text)) return 'US-Technologiekonzerne';
        return 'Satelliten-Kommunikationsanbieter';
      },
    },
    // Energy disruption → alternative energy profits
    {
      trigger: /(?:öl|gas|energie)\w*\s+(?:blockad|unterbr|knapp|engpass|ausfall|bedroht)/i,
      profiteur: null,
      gainId: 'KAPITAL',
      gain: 'steigende Energiepreise',
      type: 'hidden',
      dynamicProfiteur: (text) => {
        if (/saudi|opec|golfstaat/i.test(text)) return 'alternative Öllieferanten';
        if (/erneuerbar|solar|wind/i.test(text)) return 'erneuerbare Energiebranche';
        return 'Energiehändler';
      },
    },
    // Military spending increase → arms industry
    {
      trigger: /(?:verteidigungsausgab|militärausgab|rüstungsetat|rüstungsausgab)\w*[\s\w,.]{0,40}(?:steig|erhöh|wach|gestiegen|verdoppel)/i,
      profiteur: 'Rüstungsindustrie',
      gain: 'Milliarden-Aufträge durch Aufrüstungswelle',
      gainId: 'KAPITAL',
      type: 'hidden',
    },
    // Sanctions → sanction-evading intermediaries
    {
      trigger: /(?:sanktion|embargo)\w*\s+(?:gegen|verhängt|beschloss)/i,
      profiteur: null,
      gainId: 'KAPITAL',
      gain: 'Umgehungsgeschäfte und Preisaufschläge',
      type: 'hidden',
      dynamicProfiteur: (text) => {
        if (/china|peking|chinesisch/i.test(text)) return 'China (als Handelsalternative)';
        if (/indien|türkei/i.test(text)) return 'Schwellenländer als Mittler';
        return 'Sanktions-Umgehungsnetzwerke';
      },
    },
    // Health/consumer manipulation → industry profits
    {
      trigger: /(?:nahrungsergänzung|supplement|diät|abnehm|fettblocker|wundermittel)\w*/i,
      profiteur: 'Supplement-Industrie',
      gain: 'Milliardenumsatz mit unbelegten Heilsversprechen',
      gainId: 'KAPITAL',
      type: 'hidden',
    },
    // Data collection → ad industry
    {
      trigger: /(?:nutzerdaten|tracking|datensammlung|datenerhebung|algorithmus)/i,
      profiteur: null,
      gainId: 'KONTROLLE',
      gain: 'Kontrolle über Nutzerdaten und Werbemarkt',
      type: 'hidden',
      dynamicProfiteur: (text) => {
        if (/meta|facebook|instagram/i.test(text)) return 'Meta';
        if (/google|alphabet/i.test(text)) return 'Google';
        return 'Werbe-Plattformen';
      },
    },
    // Surveillance laws → security industry
    {
      trigger: /(?:überwachung|spionage|abhör)\w*\s*(?:gesetz|verordnung|paket|programm)/i,
      profiteur: 'Sicherheitsindustrie',
      gain: 'staatliche Aufträge für Überwachungstechnologie',
      gainId: 'KAPITAL',
      type: 'hidden',
    },
  ];

  // ═══════════════════════════════════════════════════════
  // STATE / ACTOR KNOWLEDGE
  // ═══════════════════════════════════════════════════════

  // Geopolitical interest mappings: Who benefits when X happens?
  const GEO_INTEREST = {
    // If US is distracted/weakened...
    'US-Ablenkung': {
      trigger: /(?:usa|us-|amerika)\w*\s+(?:gebunden|beschäftigt|überlast|fokussiert\s+auf|abgelenkt)/i,
      beneficiaries: [
        { actor: 'Russland', gain: 'strategische Handlungsfreiheit durch US-Ablenkung' },
        { actor: 'China', gain: 'strategische Handlungsfreiheit durch US-Ablenkung' },
      ],
    },
    // Wedge between US and Gulf/Arab allies
    'US-Golf-Spaltung': {
      trigger: /(?:keil|spalten?|partnerschaft\w*\s+(?:zwischen|stören))\w*.*?(?:usa|golf|arab|emirat)/i,
      beneficiaries: [
        { actor: 'Iran', gain: 'geopolitische Erpressungsmacht' },
      ],
    },
    // Iran attack / Iran conflict
    'Iran-Konflikt': {
      trigger: /iran\w*\s+(?:angriff|drohne|attacke|bombardier|vergelt|schlag)/i,
      beneficiaries: [
        { actor: 'Iran', gain: 'geopolitische Erpressungsmacht' },
      ],
    },
    // Ukraine conflict / European rearmament
    'Europa-Aufrüstung': {
      trigger: /(?:europäisch|nato)\w*[\s\w-]{0,30}(?:aufrüst|verteidigungsausgab|militärausgab)/i,
      beneficiaries: [
        { actor: 'US-Rüstungskonzerne', gain: 'Milliarden-Aufträge aus Europa' },
      ],
    },
  };

  // ═══════════════════════════════════════════════════════
  // VERB TEMPLATES – How actors profit
  // ═══════════════════════════════════════════════════════

  const GAIN_VERBS = {
    'ERPRESSUNG':     ['gewinnt', 'sichert sich'],
    'ABLENKUNG':      ['profitiert von', 'nutzt'],
    'MARKT':          ['gewinnt', 'sichert sich'],
    'KONTROLLE':      ['gewinnt', 'übernimmt'],
    'KAPITAL':        ['profitiert durch', 'kassiert durch'],
    'MACHTPOSITION':  ['gewinnt', 'stärkt'],
    'LEGITIMATION':   ['gewinnt', 'erhält'],
    'TERRAIN':        ['sichert sich', 'gewinnt'],
    'INFRASTRUKTUR':  ['gewinnt Kontrolle über', 'übernimmt'],
    'RUESTUNG':       ['profitiert von', 'kassiert durch'],
  };

  // ═══════════════════════════════════════════════════════
  // ENGINE CLASS
  // ═══════════════════════════════════════════════════════

  class DiamondProfiteur {

    /**
     * Main: text → { text, profiteers: [{ actor, gain, type }], toString() }
     */
    extract(text) {
      if (!text || text.length < 80) {
        return { text: '', profiteers: [], toString() { return ''; } };
      }

      // Step 1: Find all actors in the text
      const actors = this._findActors(text);

      // Step 2: Score each actor's gain potential
      const gainScores = this._scoreGains(text);

      // Step 3: Find direct profiteers (actors who DO something and gain)
      const directProfiteers = this._findDirectProfiteers(text, actors, gainScores);

      // Step 4: Find indirect/geopolitical profiteers
      const indirectProfiteers = this._findIndirectProfiteers(text, actors);

      // Step 5: Find hidden/industry profiteers
      const hiddenProfiteers = this._findHiddenProfiteers(text, actors);

      // Step 6: Deduplicate and rank (max 3 profiteers)
      const allProfiteers = this._rankAndDeduplicate(directProfiteers, indirectProfiteers, hiddenProfiteers);

      // Step 7: Compose the sentence
      const result = this._compose(allProfiteers, text);

      return {
        text: result,
        profiteers: allProfiteers,
        toString() { return this.text; },
      };
    }

    // ─── ACTOR EXTRACTION ───

    _findActors(text) {
      // Reuse Gefrierpunkt's actor patterns but simplified
      const found = [];
      const seen = new Set();

      // State actors via regex
      const STATE_RE = /\b(Israel|Iran|USA|Russland|Ukraine|China|Deutschland|Frankreich|Türkei|Syrien|Irak|Saudi[- ]?Arabien|Nordkorea|Japan|Indien|Pakistan|Großbritannien|Ungarn|Polen|Georgien|Libanon|Jemen|Bahrain|Kuwait|Oman)\b/gi;
      const ORG_RE = /\b(NATO|EU|UNO|IAEA|Hisbollah|Hamas|OPEC)\b/gi;

      for (const re of [STATE_RE, ORG_RE]) {
        let m;
        const rx = new RegExp(re.source, re.flags);
        while ((m = rx.exec(text)) !== null) {
          const name = m[1] || m[0];
          if (!seen.has(name.toUpperCase())) {
            found.push({ name, type: 'state' });
            seen.add(name.toUpperCase());
          }
        }
      }

      // Multi-word actors
      const MULTI_ACTORS = {
        'Vereinigte Arabische Emirate': 'VAE',
        'Golfstaaten': 'Golfstaaten',
        'Golf-Staaten': 'Golfstaaten',
      };
      for (const [phrase, short] of Object.entries(MULTI_ACTORS)) {
        if (text.includes(phrase) && !seen.has(short.toUpperCase())) {
          found.push({ name: short, type: 'state' });
          seen.add(short.toUpperCase());
        }
      }

      // Adjective-based actors
      const ADJ_MAP = {
        'russisch': 'Russland', 'amerikanisch': 'USA', 'chinesisch': 'China',
        'iranisch': 'Iran', 'israelisch': 'Israel', 'ukrainisch': 'Ukraine',
        'europäisch': 'EU', 'arabisch': 'Arabische Staaten',
      };
      const lower = text.toLowerCase();
      for (const [adj, state] of Object.entries(ADJ_MAP)) {
        if (lower.includes(adj) && !seen.has(state.toUpperCase())) {
          found.push({ name: state, type: 'state' });
          seen.add(state.toUpperCase());
        }
      }

      // Leaders → states
      const LEADER_MAP = {
        'trump': 'USA', 'biden': 'USA', 'putin': 'Russland',
        'selenskyj': 'Ukraine', 'netanjahu': 'Israel',
        'chamenei': 'Iran', 'khamenei': 'Iran',
        'xi': 'China', 'macron': 'Frankreich', 'scholz': 'Deutschland',
        'erdogan': 'Türkei', 'orbán': 'Ungarn',
      };
      for (const [leader, state] of Object.entries(LEADER_MAP)) {
        if (lower.includes(leader) && !seen.has(state.toUpperCase())) {
          found.push({ name: state, type: 'state' });
          seen.add(state.toUpperCase());
        }
      }

      // Industry / institutional actors
      const INDUSTRY_ACTORS = [
        { re: /\bRüstungsindustrie\b/i, name: 'Rüstungsindustrie', type: 'industry' },
        { re: /\b(?:Tech-?(?:Konzerne?|Firmen|Unternehmen|Industrie))\b/i, name: 'Tech-Konzerne', type: 'industry' },
        { re: /\b(?:Google|Microsoft|Apple|Amazon|Meta|Facebook|OpenAI|Starlink|SpaceX)\b/i, name: null, type: 'company' },
        { re: /\bPharma(?:industrie|konzern)?\b/i, name: 'Pharma-Industrie', type: 'industry' },
        { re: /\bÖlindustrie\b/i, name: 'Ölindustrie', type: 'industry' },
        { re: /\bFinanzsektor\b/i, name: 'Finanzsektor', type: 'industry' },
        { re: /\bSicherheits(?:industrie|behörden|dienstleister)\b/i, name: 'Sicherheitsindustrie', type: 'industry' },
        { re: /\bVersicherung\w*\b/i, name: 'Versicherungsbranche', type: 'industry' },
        { re: /\bSupplement-?(?:Industrie|Hersteller|Branche)\b/i, name: 'Supplement-Industrie', type: 'industry' },
      ];

      for (const ia of INDUSTRY_ACTORS) {
        const m = text.match(ia.re);
        if (m) {
          const name = ia.name || m[0];
          if (!seen.has(name.toUpperCase())) {
            found.push({ name, type: ia.type });
            seen.add(name.toUpperCase());
          }
        }
      }

      // Named US tech companies → group as "US-Technologiekonzerne" or keep individual
      const techCompanyMatches = text.match(/\b(Google|Microsoft|Amazon|Meta|OpenAI|Apple)\b/gi);
      if (techCompanyMatches && techCompanyMatches.length >= 2) {
        if (!seen.has('US-TECHNOLOGIEKONZERNE')) {
          found.push({ name: 'US-Technologiekonzerne', type: 'industry' });
          seen.add('US-TECHNOLOGIEKONZERNE');
        }
      }

      // Family Trump / personal investments
      if (/familie\s+(?:von\s+)?(?:us-)?präsident|trump\w*\s+(?:selbst|persönlich|familie)/i.test(text)) {
        if (!seen.has('TRUMP-FAMILIE')) {
          found.push({ name: 'Trump-Netzwerk', type: 'personal' });
          seen.add('TRUMP-FAMILIE');
        }
      }

      return found;
    }

    // ─── GAIN SCORING ───

    _scoreGains(text) {
      const scores = {};
      const lower = text.toLowerCase();

      for (const gt of GAIN_TYPES) {
        let score = 0;
        for (const pat of gt.patterns) {
          const matches = lower.match(new RegExp(pat.source, 'gi'));
          if (matches) score += matches.length;
        }
        if (score > 0) scores[gt.id] = { score, label: gt.label };
      }

      return scores;
    }

    // ─── DIRECT PROFITEERS ───

    _findDirectProfiteers(text, actors, gainScores) {
      const profiteers = [];
      const lower = text.toLowerCase();

      // Look for explicit "profitiert" patterns
      const profitPatterns = [
        { re: /([\w\u00C0-\u024F][\w\u00C0-\u024F\s-]{2,30})\s+profitiert?\s+(?:erheblich\s+)?(?:von|durch|an)\s+(?:de[rnms]?\s+)?(.{5,80})/gi, actorGrp: 1, gainGrp: 2 },
        { re: /(?:profiteur|gewinner|nutznießer)\w*\s+(?:ist|sind|wäre)\s+(.{5,80})/gi, actorGrp: 1, gainGrp: 0 },
        { re: /([\w\u00C0-\u024F][\w\u00C0-\u024F\s-]{2,30})\s+verdient?\s+(?:\w+\s+)?(?:an|mit|durch)\s+(.{5,80})/gi, actorGrp: 1, gainGrp: 2 },
      ];

      for (const pat of profitPatterns) {
        let m;
        const rx = new RegExp(pat.re.source, pat.re.flags);
        while ((m = rx.exec(text)) !== null) {
          const actorText = (m[pat.actorGrp] || '').trim();
          // Try to match to a known actor
          const matchedActor = this._matchToActor(actorText, actors);
          if (matchedActor) {
            // Determine the gain type from context
            const gainContext = m[pat.gainGrp] || m[0];
            const gain = this._classifyGain(gainContext, gainScores);
            profiteers.push({
              actor: matchedActor.name,
              gain: gain.label,
              gainId: gain.id,
              type: 'direct',
              score: 10,
            });
          }
        }
      }

      // Also check: who has AGENCY (verbs) + stands to gain from the main gain type?
      const topGain = Object.entries(gainScores).sort((a, b) => b[1].score - a[1].score)[0];
      if (topGain) {
        const AGENCY_RE = /\b(?:hat|haben|beschloss|verhängt?|fordert?|steigert?|investiert?|setzt|plant?|beschließ|stärkt|baut\s+aus)\b/i;
        for (const actor of actors) {
          const idx = lower.indexOf(actor.name.toLowerCase());
          if (idx === -1) continue;
          const after = text.substring(idx, Math.min(idx + actor.name.length + 100, text.length));
          if (AGENCY_RE.test(after)) {
            // This actor IS doing something — likely the initiator, not the profiteer
            // Skip unless they're explicitly profiting
          }
        }
      }

      return profiteers;
    }

    // ─── INDIRECT / GEOPOLITICAL PROFITEERS ───

    _findIndirectProfiteers(text, actors) {
      const profiteers = [];

      for (const [, geoRule] of Object.entries(GEO_INTEREST)) {
        if (geoRule.trigger.test(text)) {
          for (const ben of geoRule.beneficiaries) {
            profiteers.push({
              actor: ben.actor,
              gain: ben.gain,
              gainId: 'MACHTPOSITION',
              type: 'indirect',
              score: 6,
            });
          }
        }
      }

      // Goal-based indirect: "Ziel des Iran ist..." / "will...einen Keil treiben"
      const goalPatterns = [
        { re: /Ziel\s+(?:des|der|von)\s+([\w-]+)\s+ist\s+(?:es\s*,?\s*)?(.{10,100})/i, actorGroup: 1, gainGroup: 2 },
        { re: /([\w-]+)\s+will\s+(?:damit\s+)?(.{10,80})/i, actorGroup: 1, gainGroup: 2 },
      ];

      for (const gp of goalPatterns) {
        const m = text.match(gp.re);
        if (m) {
          const actorName = m[gp.actorGroup];
          const gainText = m[gp.gainGroup];
          const matchedActor = this._matchToActor(actorName, actors);
          if (matchedActor) {
            const gain = this._classifyGainFromText(gainText);
            profiteers.push({
              actor: matchedActor.name,
              gain: gain,
              gainId: 'MACHTPOSITION',
              type: 'indirect',
              score: 8,
            });
          }
        }
      }

      return profiteers;
    }

    // ─── HIDDEN / INDUSTRY PROFITEERS ───

    _findHiddenProfiteers(text, actors) {
      const profiteers = [];

      for (const rule of INDIRECT_PROFITEUR_RULES) {
        if (rule.trigger.test(text)) {
          let profiteurName = rule.profiteur;
          if (!profiteurName && rule.dynamicProfiteur) {
            profiteurName = rule.dynamicProfiteur(text);
          }
          if (profiteurName) {
            profiteers.push({
              actor: profiteurName,
              gain: rule.gain,
              gainId: rule.gainId,
              type: rule.type || 'hidden',
              score: 4,
            });
          }
        }
      }

      // Tech companies invested in region + that region attacked → those companies face risk
      // but ALTERNATIVE providers profit
      if (/(?:rechenzent|cloud|aws|amazon\s+web)\w*.*(?:brand|zerstör|angegriff|ausfall)/i.test(text)) {
        // Look for mentions of invested companies
        const investedCompanies = text.match(/\b(Google|Microsoft|OpenAI|Amazon|AWS)\b/gi);
        if (investedCompanies && investedCompanies.length > 0) {
          const uniqueCompanies = [...new Set(investedCompanies.map(c => c.replace(/aws/i, 'Amazon')))];
          // These are LOSERS, but their non-Gulf infrastructure gains
          // US-based alternatives profit
          const existing = profiteers.find(p => p.actor.includes('US-Tech') || p.actor.includes('Cloud'));
          if (!existing) {
            profiteers.push({
              actor: 'US-Sicherheitstechnologie-Konzerne',
              gain: 'Kontrolle über zurückfließende globale Datenströme',
              gainId: 'KONTROLLE',
              type: 'hidden',
              score: 5,
            });
          }
        }
      }

      // Look for "90 Prozent des Internetverkehrs" or similar critical infrastructure stats
      if (/(?:\d+)\s+Prozent\s+(?:des\s+)?(?:Internet|Daten|Netz)\w*\s+(?:durch|über|via)/i.test(text)) {
        const existing = profiteers.find(p => p.gainId === 'INFRASTRUKTUR' || p.gainId === 'KONTROLLE');
        if (!existing) {
          profiteers.push({
            actor: 'Betreiber alternativer Datenrouten',
            gain: 'Infrastrukturkontrolle durch Datenumleitung',
            gainId: 'INFRASTRUKTUR',
            type: 'hidden',
            score: 3,
          });
        }
      }

      return profiteers;
    }

    // ─── RANKING & DEDUPLICATION ───

    _rankAndDeduplicate(direct, indirect, hidden) {
      const all = [...direct, ...indirect, ...hidden];

      // Deduplicate by actor name (keep highest score)
      const byActor = {};
      for (const p of all) {
        const key = p.actor.toLowerCase();
        if (!byActor[key] || p.score > byActor[key].score) {
          byActor[key] = p;
        }
      }

      // Sort by: type priority (direct > indirect > hidden) then score
      const TYPE_PRIORITY = { direct: 3, indirect: 2, hidden: 1 };
      const ranked = Object.values(byActor).sort((a, b) => {
        const typeDiff = (TYPE_PRIORITY[b.type] || 0) - (TYPE_PRIORITY[a.type] || 0);
        if (typeDiff !== 0) return typeDiff;
        return b.score - a.score;
      });

      return ranked.slice(0, 3); // Max 3 profiteers
    }

    // ─── COMPOSITION ───

    _compose(profiteers, text) {
      if (profiteers.length === 0) return '';

      const parts = profiteers.map((p) => {
        const verb = this._selectVerb(p.gainId, p.actor);
        return `${p.actor} ${verb} ${p.gain}`;
      });

      // Join with German conjunction style
      if (parts.length === 1) {
        return parts[0] + '.';
      }
      if (parts.length === 2) {
        return parts[0] + ', und ' + parts[1] + '.';
      }
      // 3 parts
      return parts[0] + ', ' + parts[1] + ', und ' + parts[2] + '.';
    }

    _selectVerb(gainId, actorName) {
      // Determine if the actor name is plural (for verb conjugation)
      const isPlural = /(?:Konzerne|Staaten|Länder|Firmen|Unternehmen|Anbieter|Händler)$/i.test(actorName)
        || /(?:USA|VAE|NATO|EU|Golfstaaten)$/i.test(actorName);

      const verbPairs = GAIN_VERBS[gainId] || ['profitiert durch'];
      const verb = verbPairs[0]; // always use first verb for consistency

      // Conjugate: singular "gewinnt" → plural "gewinnen"
      if (isPlural) {
        if (/^gewinnt$/i.test(verb)) return 'gewinnen';
        if (/^sichert sich$/i.test(verb)) return 'sichern sich';
        if (/^profitiert von$/i.test(verb)) return 'profitieren von';
        if (/^profitiert durch$/i.test(verb)) return 'profitieren durch';
        if (/^kassiert durch$/i.test(verb)) return 'kassieren durch';
        if (/^übernimmt$/i.test(verb)) return 'übernehmen';
        if (/^nutzt$/i.test(verb)) return 'nutzen';
        if (/^stärkt$/i.test(verb)) return 'stärken';
        if (/^erhält$/i.test(verb)) return 'erhalten';
        if (/^gewinnt Kontrolle über$/i.test(verb)) return 'gewinnen Kontrolle über';
      }

      return verb;
    }

    // ─── HELPERS ───

    _matchToActor(text, actors) {
      const lower = text.toLowerCase().trim();
      for (const actor of actors) {
        if (lower.includes(actor.name.toLowerCase()) || actor.name.toLowerCase().includes(lower)) {
          return actor;
        }
      }
      // Fuzzy: try partial match
      for (const actor of actors) {
        if (lower.length > 3 && actor.name.toLowerCase().startsWith(lower.substring(0, 4))) {
          return actor;
        }
      }
      return null;
    }

    _classifyGain(text, gainScores) {
      // Match the gain text against gain types
      const lower = (text || '').toLowerCase();
      let bestId = null;
      let bestScore = 0;

      for (const gt of GAIN_TYPES) {
        let score = 0;
        for (const pat of gt.patterns) {
          if (pat.test(lower)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          bestId = gt.id;
        }
      }

      if (bestId) {
        const gt = GAIN_TYPES.find(g => g.id === bestId);
        return { id: bestId, label: gt.label };
      }

      // Fallback: use the overall top gain
      const top = Object.entries(gainScores).sort((a, b) => b[1].score - a[1].score)[0];
      return top ? { id: top[0], label: top[1].label } : { id: 'KAPITAL', label: 'Kapitalzufluss' };
    }

    _classifyGainFromText(text) {
      const lower = (text || '').toLowerCase();
      // Try to compress the gain text into a short phrase
      if (/keil|spalten?|partnerschaft/i.test(lower)) return 'Spaltung feindlicher Allianzen';
      if (/erpressung|droh|vergeltung/i.test(lower)) return 'geopolitische Erpressungsmacht';
      if (/kontroll|zugriff|überwach/i.test(lower)) return 'strategische Kontrolle';
      if (/ablenk|binden|überlast/i.test(lower)) return 'strategische Ablenkung des Gegners';
      if (/profit|verdien|gewinn|geld/i.test(lower)) return 'Kapitalzufluss';
      if (/macht|einfluss|position/i.test(lower)) return 'Machtausbau';
      if (/gebiet|territoriu/i.test(lower)) return 'Territorialgewinn';
      // Fallback: try to shorten the text
      let compressed = text.replace(/\b(?:der|die|das|den|dem|des|ein\w*|zu|in|mit|von|für|auf|und)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
      if (compressed.length > 40) compressed = compressed.substring(0, 40).replace(/\s\S*$/, '');
      return compressed || 'strategischen Vorteil';
    }
  }

  // ═══════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════

  window.DiamondProfiteur = DiamondProfiteur;

})();
