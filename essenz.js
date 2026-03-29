/**
 * DIAMOND – Prism of Light
 * Essenz Engine – Extracts the factual core from manipulative text
 *
 * Takes an article, strips all manipulation patterns found by Diamond,
 * and condenses it to a single factual sentence.
 *
 * Works 100% locally – no API calls.
 */

class DiamondEssenz {
  constructor() {
    // === STRIPPABLE PATTERNS ===

    // Attribution phrases to remove ("sagte er", "nach Angaben", etc.)
    this.attributionPatterns = [
      // German
      /,?\s*(?:sagte|erklärte|betonte|unterstrich|warnte|forderte|bekräftigte|versicherte|versprach)\s+(?:er|sie|der\s+\w+|die\s+\w+)\s*(?:gestern|heute|am\s+\w+)?\s*(?:in\s+(?:seiner|ihrer)\s+(?:\w+\s+)?(?:videobotschaft|ansprache|rede|erklärung|pressekonferenz))?\.?/gi,
      /nach\s+angaben\s+(?:ihres?|seines?|des|der)\s+(?:präsident(?:en|in)?|minister(?:s|in)?|sprecher(?:s|in)?)\s+\w+(?:\s+\w+)?/gi,
      /seinen?\s+angaben\s+(?:nach|zufolge|gemäß)/gi,
      /(?:laut|nach|gemäß)\s+(?:angaben|aussage[n]?|einschätzung)\s+(?:von|des|der)\s+\w+/gi,
      /(?:,\s*)?machte\s+(?:er|sie)\s+deutlich/gi,
      /(?:,\s*)?(?:so|wie)\s+(?:er|sie)\s+(?:sagte|erklärte|betonte)/gi,
      // English
      /,?\s*(?:he|she)\s+(?:said|stated|emphasized|stressed|warned|urged|insisted|vowed)\s*(?:yesterday|today|on\s+\w+)?\s*(?:in\s+(?:his|her)\s+(?:\w+\s+)?(?:address|speech|statement|briefing))?\.?/gi,
      /according\s+to\s+(?:his|her|the)\s+(?:president|minister|spokesperson)\s+\w+(?:\s+\w+)?/gi,
    ];

    // Filler/emotional words to strip
    this.fillerPatterns = [
      // German emotional/manipulative adjectives
      /\b(?:größtes?|neuerlich(?:es?)?|abendlich(?:en?)?|vorteilhaft(?:e[rns]?)?|eigen(?:en?)?|richt?ig(?:e[rns]?)?|echt(?:e[rns]?)?|wahr(?:e[rns]?)?)\b\s*/gi,
      // Quotation marks around political speech
      /[„"»«›‹]/g,
      // "deutlich" as emphasis
      /\bdeutlich\b\s*/gi,
    ];

    // Causal connectors to keep (important for WHY)
    this.causalWords = /\b(?:da|weil|wegen|aufgrund|deshalb|daher|denn|nachdem|infolge|because|since|due\s+to|as\s+a\s+result)\b/i;

    // Sentence-ending punctuation
    this.sentenceEnd = /[.!?]+/;
  }

  /**
   * Main method: Extract the factual essence of an article.
   * Returns a single sentence.
   */
  extract(text, matches) {
    if (!text || text.trim().length < 20) return '';

    // Step 1: Split into sentences
    const sentences = this._splitSentences(text);
    if (sentences.length === 0) return '';

    // Step 2: Score each sentence for factual density
    const scored = sentences.map((s, i) => ({
      text: s.trim(),
      index: i,
      score: this._scoreSentence(s, i, sentences.length, matches)
    }));

    // Step 3: Select top sentences (up to 4, biased toward beginning)
    scored.sort((a, b) => b.score - a.score);
    const topSentences = scored.slice(0, 4);
    topSentences.sort((a, b) => a.index - b.index);

    // Step 4: Strip manipulation from each
    const cleanedSentences = topSentences.map(s => this._stripManipulation(s.text));

    // Step 5: MERGE into one sentence
    let essenz = this._mergeIntoOneSentence(cleanedSentences);

    // Step 6: Final compression
    essenz = this._compress(essenz);

    // Step 7: Ensure it ends properly
    essenz = essenz.trim();
    if (essenz && !this.sentenceEnd.test(essenz.slice(-1))) {
      essenz += '.';
    }

    // Step 8: Hard cap at ~350 chars (one long compound sentence is fine)
    if (essenz.length > 350) {
      // Find last comma or clause boundary before 320
      let cutPoint = essenz.lastIndexOf(',', 320);
      if (cutPoint < 100) cutPoint = essenz.lastIndexOf(' ', 320);
      if (cutPoint > 80) {
        essenz = essenz.substring(0, cutPoint) + '.';
      }
    }

    return essenz;
  }

  /**
   * Split text into sentences, handling German/English punctuation
   */
  _splitSentences(text) {
    // Split on sentence boundaries but not on abbreviations
    const raw = text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"])/);
    return raw
      .map(s => s.trim())
      .filter(s => s.length > 15); // Skip very short fragments
  }

  /**
   * Score a sentence for factual value.
   * Higher score = more suitable for essence.
   */
  _scoreSentence(sentence, index, totalSentences, matches) {
    let score = 0;
    const lower = sentence.toLowerCase();

    // === POSITION BONUS (journalism inverted pyramid) ===
    // First sentences usually contain the core facts
    if (index === 0) score += 30;
    else if (index === 1) score += 20;
    else if (index === 2) score += 10;
    // Last sentence often has conclusion/context
    if (index === totalSentences - 1 && totalSentences > 2) score += 5;

    // === FACTUAL INDICATORS (bonus) ===
    // Contains numbers/data
    if (/\d+/.test(sentence)) score += 8;
    // Contains named entities (capitalized words that aren't sentence starts)
    const namedEntities = sentence.match(/\s[A-ZÄÖÜ][a-zäöüß]+/g);
    if (namedEntities) score += namedEntities.length * 3;
    // Contains concrete actions (verbs)
    if (/\b(?:verhandelt|bietet|fordert|liefert|plant|beschließt|vereinbart|anbietet|sucht)/i.test(lower)) score += 10;
    if (/\b(?:negotiat|offer|demand|deliver|plan|decid|agree|seek|propos)/i.test(lower)) score += 10;
    // Contains causal connectors (WHY) – critical for "da/weil" clauses
    if (this.causalWords.test(lower)) score += 12;
    // "zusammen" clauses often contain the hidden reason
    if (/zusammen|hintergrund|hängt.*mit/i.test(lower)) score += 15;
    // Contains geographic/political entities
    if (/\b(?:ukraine|russland|iran|eu|nato|usa|china|israel|golfstaat|golf|naher?\s+osten|washington|moskau|kiew|teheran)/i.test(lower)) score += 5;

    // === MANIPULATION PENALTY ===
    // Count how many Diamond matches fall within this sentence
    if (matches) {
      // Sentences heavy with emotional language get penalized
      const emotionalHits = matches.filter(m =>
        (m.channel === 'infrared' || m.channel === 'ultraviolet' || m.channel === 'orange') &&
        lower.includes(m.text.toLowerCase())
      );
      score -= emotionalHits.length * 3;
    }

    // === QUOTATION PENALTY ===
    // Direct quotes are usually framing, not facts
    if (/[„"»]/.test(sentence)) score -= 8;

    // === LENGTH BONUS ===
    // Prefer medium-length sentences (not too short, not too long)
    if (sentence.length > 40 && sentence.length < 200) score += 5;
    if (sentence.length > 200) score -= 5;

    return score;
  }

  /**
   * Strip manipulation patterns from a sentence
   */
  _stripManipulation(sentence) {
    let cleaned = sentence;

    // Remove attribution phrases
    this.attributionPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove filler words
    this.fillerPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove speech-act sentence starters
    cleaned = cleaned.replace(/^(?:die ukraine schlägt.*?vor:\s*)/i, '');

    // Clean up artifacts
    cleaned = cleaned
      .replace(/\s*,\s*,/g, ',')        // double commas
      .replace(/\s{2,}/g, ' ')           // double spaces
      .replace(/^\s*[,;:]\s*/, '')       // leading punctuation
      .replace(/,\s*\./g, '.')           // comma before period
      .replace(/\(\s*\)/g, '')           // empty parens
      .trim();

    return cleaned;
  }

  /**
   * Merge multiple cleaned sentences into one compound sentence.
   * Uses subordinate clause connectors (", um", ", da", ", wobei").
   */
  _mergeIntoOneSentence(sentences) {
    if (sentences.length === 0) return '';
    if (sentences.length === 1) return sentences[0];

    // Take the first sentence as the base
    let base = sentences[0].replace(/\.\s*$/, '');

    // Classify remaining sentences by their role
    for (let i = 1; i < sentences.length; i++) {
      let clause = sentences[i].replace(/\.\s*$/, '').trim();
      if (clause.length < 10) continue;

      // Remove sentence-initial capitalization for subordination
      const lowerStart = clause.charAt(0).toLowerCase() + clause.slice(1);

      // Detect clause type and connect appropriately
      if (/^(?:als|im)\s+gegenleistung/i.test(clause) ||
          /gegenleistung|im\s+gegenzug|dafür|dabei/i.test(clause)) {
        // PURPOSE/EXCHANGE clause → ", um ..."
        const simplified = clause
          .replace(/^als\s+gegenleistung\s+(?:sei|ist|war)\s+\w+\s+an\s+/i, '')
          .replace(/\s+interessiert.*$/, '');
        if (simplified.length > 10) {
          base += `, um im Gegenzug ${simplified} zu erhalten`;
        }
      } else if (/^(?:daher|deshalb|deswegen|folglich)/i.test(clause)) {
        // CONSEQUENCE → drop it (usually adds urgency, not facts)
        // But extract the core action if it's factual
        const action = clause.replace(/^(?:daher|deshalb|deswegen|folglich)\s+müsse?\s+\w+\s+/i, '');
        // Skip – usually urgency framing
      } else if (/(?:hängt|steht|liegt|basiert).*(?:zusammen|grund|ursache)/i.test(clause) ||
                 /zusammen/i.test(clause) ||
                 /hintergrund|grund\s+(?:ist|dafür|hierfür)|ursache/i.test(clause)) {
        // CAUSAL clause → ", da ..."
        // Extract: "hängt ... mit der X zusammen, das Y" → "X Y"
        let causalCore = '';
        const zusammenMatch = clause.match(/(?:mit\s+(?:der\s+|dem\s+|den\s+)?)((?:Blockade|Verweigerung|Obstruktion)\w*\s+\w+)\s*zusammen,?\s*(?:das|die|der|was)\s+(.+)/i);
        if (zusammenMatch) {
          causalCore = `${zusammenMatch[1]} ${zusammenMatch[2]}`.replace(/\.\s*$/, '');
        } else {
          const simpleMatch = clause.match(/(?:mit\s+der\s+|auch\s+mit\s+der\s+|weil\s+|da\s+)(.+)/i);
          if (simpleMatch) {
            causalCore = simpleMatch[1].replace(/\.\s*$/, '').replace(/\s+zusammen.*$/, '');
          }
        }
        if (causalCore && causalCore.length > 10) {
          // Keep proper nouns capitalized, only lowercase generic words
          const startsWithProperNoun = /^[A-ZÄÖÜ]/.test(causalCore) &&
            /^(?:Blockade|Verweigerung|Ungarn|EU|USA|NATO|Russland|Ukraine|Iran|China)/i.test(causalCore);
          const connector = startsWithProperNoun ? causalCore : causalCore.charAt(0).toLowerCase() + causalCore.slice(1);
          base += `, da ${connector}`;
        } else {
          base += `, da ${lowerStart}`;
        }
      } else if (/(?:wegen|aufgrund|infolge)/i.test(clause)) {
        // REASON clause
        base += `, ${lowerStart}`;
      } else if (i === 1 && clause.length < 120) {
        // Second sentence → often elaboration, connect with comma
        base += `, ${lowerStart}`;
      }
      // Skip remaining sentences if we're already long enough
      if (base.length > 220) break;
    }

    return base;
  }

  /**
   * Compress the essence: merge related clauses, remove redundancy
   */
  _compress(text) {
    let compressed = text;

    // Remove redundant country mentions if they appear multiple times
    // (keep the first, context-setting one)
    const countryMentions = {};
    compressed = compressed.replace(
      /\b(die ukraine|ukraine|russland|iran|kiew)\b/gi,
      (match) => {
        const key = match.toLowerCase();
        if (!countryMentions[key]) {
          countryMentions[key] = true;
          return match;
        }
        return match; // Keep all – let the reader see the actors
      }
    );

    // Clean up double spaces and punctuation
    compressed = compressed
      .replace(/\s{2,}/g, ' ')
      .replace(/\.\s*\./g, '.')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      .trim();

    return compressed;
  }
}

if (typeof window !== 'undefined') {
  window.DiamondEssenz = DiamondEssenz;
}
