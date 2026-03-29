/**
 * DIAMOND – Prism of Light
 * Text Analysis Engine v2.0 – SHARP MODE
 *
 * Analyzes text nodes in the DOM and identifies manipulation patterns.
 * Works entirely locally – no data leaves the browser.
 *
 * Key improvement: German compound word handling.
 * German creates compounds like "Drohnenbekämpfung", "Waffenpartnerschaft",
 * "Milliardenkredits" – the analyzer now catches patterns WITHIN compounds.
 */

class DiamondAnalyzer {
  constructor(patterns) {
    this.patterns = patterns;
    this.results = {};
    this.totalMatches = 0;
    this.channelCounts = {};

    // Initialize channel counts
    Object.keys(patterns).forEach(channel => {
      this.channelCounts[channel] = 0;
    });

    // Pre-compile compound-aware pattern lists
    this._compilePatterns();
  }

  /**
   * Pre-compile patterns into optimized structures.
   * Separates "exact word" patterns from "compound-friendly" patterns.
   */
  _compilePatterns() {
    this._compiledPatterns = {};

    // Patterns that should ALSO match inside German compound words
    // (these are typically nouns/roots)
    const COMPOUND_FRIENDLY = new Set([
      // German military roots
      'krieg', 'kriegs', 'kriege', 'kampf', 'kämpfe', 'waffe', 'waffen',
      'rakete', 'raketen', 'panzer', 'drohne', 'drohnen', 'bombe', 'bomben',
      'munition', 'artillerie', 'torpedo', 'mine', 'gewehr',
      'abwehr', 'angriff', 'angriffe', 'beschuss', 'einmarsch',
      'flugabwehr', 'raketenabwehr', 'luftabwehr',
      'militär', 'armee', 'truppen', 'soldaten',
      'marine', 'flotte', 'brigade', 'division',
      'einsatz', 'operation', 'manöver', 'offensive',
      'vernichtung', 'zerstörung', 'verwüstung',
      'terror', 'massaker', 'opfer', 'flucht',
      'bedrohung', 'gefahr', 'eskalation', 'krise', 'krisen',
      'katastrophe', 'notstand', 'kollaps',
      // Arms trade roots
      'rüstung', 'bewaffnung', 'aufrüstung',
      'lieferung', 'lieferungen', 'export', 'exporte',
      'partnerschaft', 'investition', 'kredit', 'kredite',
      'milliarden', 'millionen', 'finanzierung',
      'sanktionen', 'embargo',
      'expertise', 'kooperation',
      // English military
      'war', 'warfare', 'weapon', 'weapons', 'missile', 'missiles',
      'drone', 'drones', 'bomb', 'bombs', 'tank', 'tanks',
      'military', 'troops', 'attack', 'attacks', 'strike', 'strikes',
      'defense', 'combat', 'ammunition',
      'billion', 'billions', 'million', 'millions',
      'sanctions', 'embargo',
      // Moral/framing roots
      'regime', 'diktator', 'despot', 'tyrann', 'aggressor',
      'solidarität', 'stärkung', 'verstärkung', 'ertüchtigung',
      'blockade', 'sabotage',
      'dictator', 'tyrant', 'aggressor'
    ]);

    Object.entries(this.patterns).forEach(([channelId, channel]) => {
      this._compiledPatterns[channelId] = {
        exact: { de: [], en: [] },
        compound: { de: [], en: [] }
      };

      ['de', 'en'].forEach(lang => {
        if (!channel.patterns[lang]) return;

        channel.patterns[lang].forEach(pattern => {
          const lower = pattern.toLowerCase();
          // Single words or known roots → compound-friendly
          const isSingleWord = !lower.includes(' ');
          if (isSingleWord && COMPOUND_FRIENDLY.has(lower)) {
            this._compiledPatterns[channelId].compound[lang].push(lower);
          } else {
            this._compiledPatterns[channelId].exact[lang].push(lower);
          }
        });
      });
    });
  }

  /**
   * Analyze a text string and return all matches with their positions
   */
  analyzeText(text) {
    if (!text || text.trim().length < 5) return [];

    const matches = [];
    const lowerText = text.toLowerCase();

    Object.entries(this.patterns).forEach(([channelId, channel]) => {

      // ── EXACT PATTERNS (multi-word, need word boundaries) ──
      ['de', 'en'].forEach(lang => {
        const exactPatterns = this._compiledPatterns[channelId].exact[lang];
        if (!exactPatterns) return;

        exactPatterns.forEach(pattern => {
          let startIdx = 0;
          while (true) {
            const idx = lowerText.indexOf(pattern, startIdx);
            if (idx === -1) break;

            const before = idx > 0 ? lowerText[idx - 1] : ' ';
            const after = idx + pattern.length < lowerText.length
              ? lowerText[idx + pattern.length] : ' ';

            if (this._isWordBoundary(before) && this._isWordBoundary(after)) {
              matches.push(this._createMatch(channelId, channel, text, pattern, idx, pattern.length, 'exact'));
            }
            startIdx = idx + 1;
          }
        });
      });

      // ── COMPOUND-FRIENDLY PATTERNS (match inside German compounds) ──
      ['de', 'en'].forEach(lang => {
        const compoundPatterns = this._compiledPatterns[channelId].compound[lang];
        if (!compoundPatterns) return;

        compoundPatterns.forEach(pattern => {
          let startIdx = 0;
          while (true) {
            const idx = lowerText.indexOf(pattern, startIdx);
            if (idx === -1) break;

            // For compound matching: the pattern can be inside a word,
            // but we highlight the ENTIRE word it's part of
            const wordBounds = this._getWordBounds(lowerText, idx, idx + pattern.length);

            matches.push(this._createMatch(
              channelId, channel, text, pattern,
              wordBounds.start, wordBounds.end - wordBounds.start,
              'compound'
            ));

            startIdx = idx + pattern.length;
          }
        });
      });

      // ── REGEX PATTERNS ──
      ['de', 'en'].forEach(lang => {
        if (!channel.regexPatterns || !channel.regexPatterns[lang]) return;

        channel.regexPatterns[lang].forEach(regex => {
          const re = new RegExp(regex.source, regex.flags);
          let match;
          while ((match = re.exec(text)) !== null) {
            matches.push(this._createMatch(
              channelId, channel, text, match[0],
              match.index, match[0].length, 'regex'
            ));
            // Prevent infinite loops on zero-length matches
            if (match[0].length === 0) re.lastIndex++;
          }
        });
      });
    });

    return this.deduplicateMatches(matches);
  }

  _isWordBoundary(c) {
    return /[\s.,;:!?()[\]{}"'\/\-–—„"»«›‹\n\r\t]/.test(c) || c === undefined;
  }

  /**
   * Get the boundaries of the word containing positions start..end
   */
  _getWordBounds(text, matchStart, matchEnd) {
    let start = matchStart;
    let end = matchEnd;

    // Expand left to word boundary
    while (start > 0 && !this._isWordBoundary(text[start - 1])) {
      start--;
    }

    // Expand right to word boundary
    while (end < text.length && !this._isWordBoundary(text[end])) {
      end++;
    }

    return { start, end };
  }

  _createMatch(channelId, channel, fullText, pattern, index, length, type) {
    return {
      channel: channelId,
      color: channel.color,
      colorLight: channel.colorLight,
      label: channel.label,
      icon: channel.icon,
      description: channel.description,
      text: fullText.substring(index, index + length),
      originalPattern: pattern,
      index: index,
      length: length,
      type: type
    };
  }

  /**
   * Remove overlapping matches, keeping the longer/more specific one
   */
  deduplicateMatches(matches) {
    if (matches.length <= 1) return matches;

    // Sort by position, then by length (longer first)
    matches.sort((a, b) => a.index - b.index || b.length - a.length);

    const result = [];
    let lastEnd = -1;

    for (const match of matches) {
      if (match.index >= lastEnd) {
        result.push(match);
        lastEnd = match.index + match.length;
      }
    }

    return result;
  }

  /**
   * Analyze the entire page and return a summary
   */
  analyzePage(textContent) {
    const matches = this.analyzeText(textContent);

    const summary = {
      totalMatches: matches.length,
      channels: {},
      topPatterns: [],
      manipulationScore: 0
    };

    // Count per channel
    Object.entries(this.patterns).forEach(([channelId, channel]) => {
      const channelMatches = matches.filter(m => m.channel === channelId);
      summary.channels[channelId] = {
        count: channelMatches.length,
        label: channel.label,
        color: channel.color,
        icon: channel.icon,
        matches: channelMatches.map(m => m.text)
      };
    });

    // Calculate manipulation score (0-100)
    // More aggressive scoring: count unique pattern types, not just character ratio
    const textLength = textContent.length;
    const matchedChars = matches.reduce((sum, m) => sum + m.length, 0);
    const charRatio = matchedChars / Math.max(textLength, 1);

    // Count how many different channels were triggered
    const triggeredChannels = Object.values(summary.channels).filter(c => c.count > 0).length;

    // Score formula: character ratio × channel diversity
    // Calibrated so typical news = 30-60, heavy propaganda = 70-100, pure info = 0-20
    const density = matches.length / Math.max(1, textLength / 100); // matches per 100 chars
    const rawScore = (density * 12) + (triggeredChannels * 5) + Math.min(30, matches.length * 0.6);
    summary.manipulationScore = Math.min(100, Math.round(rawScore));

    // Top patterns
    const patternCounts = {};
    matches.forEach(m => {
      const key = m.text.toLowerCase();
      patternCounts[key] = (patternCounts[key] || 0) + 1;
    });

    summary.topPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([pattern, count]) => ({ pattern, count }));

    return summary;
  }

  /**
   * Get a "Brillant-Schliff" version of text (stripped of manipulative adjectives)
   */
  getBrilliantCut(text) {
    let cleaned = text;

    const adjectives = [
      // German
      'barbarisch[es]?[rn]?', 'brutal[es]?[rn]?', 'grausam[es]?[rn]?', 'feige[rns]?',
      'heroisch[es]?[rn]?', 'historisch[es]?[rn]?', 'existentiell[es]?[rn]?', 'existenziell[es]?[rn]?',
      'dramatisch[es]?[rn]?', 'katastrophal[es]?[rn]?', 'alternativlos[es]?[rn]?',
      'unverzichtbar[es]?[rn]?', 'beispiellos[es]?[rn]?', 'einzigartig[es]?[rn]?',
      'entschlossen[es]?[rn]?', 'mutig[es]?[rn]?', 'tapfer[es]?[rn]?', 'kühn[es]?[rn]?',
      'erschütternd[es]?[rn]?', 'schockierend[es]?[rn]?', 'verheerend[es]?[rn]?',
      'ungeheuerlich[es]?[rn]?', 'empörend[es]?[rn]?',
      'vorteilhaft[es]?[rn]?', 'entscheidend[es]?[rn]?',
      'notwendig[es]?[rn]?', 'unvermeidlich[es]?[rn]?', 'unausweichlich[es]?[rn]?',
      'richtig[es]?[rn]?', 'echt[es]?[rn]?', 'wahr[es]?[rn]?',
      'größt[es]?[rn]?', 'neuerlich[es]?[rn]?', 'abendlich[es]?[rn]?',
      // English
      'barbaric', 'brutal', 'savage', 'cowardly',
      'heroic', 'historic', 'existential', 'unprecedented',
      'dramatic', 'catastrophic', 'devastating',
      'indispensable', 'unique', 'decisive',
      'courageous', 'brave', 'bold',
      'shocking', 'horrifying', 'outrageous',
      'mutually beneficial', 'necessary', 'inevitable'
    ];

    adjectives.forEach(adj => {
      const regex = new RegExp(`\\b${adj}\\b\\s*`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.DiamondAnalyzer = DiamondAnalyzer;
}
