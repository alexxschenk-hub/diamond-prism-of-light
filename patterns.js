/**
 * DIAMOND – Prism of Light
 * Pattern Database for Spectral Analysis – v2.0 SHARP
 *
 * Each "color channel" represents a manipulation technique.
 * Patterns in German (DE) and English (EN).
 *
 * DESIGN PRINCIPLE: Cast a WIDE net. It's better to flag something
 * and let the user decide than to let manipulation slip through.
 * Short, atomic patterns that catch compound words via substring matching.
 */

const DIAMOND_PATTERNS = {

  // ═══════════════════════════════════════════════════════════════
  // INFRAROT – Angst & Bedrohung / Fear & Threat
  // Military language, war framing, violence, threat scenarios
  // ═══════════════════════════════════════════════════════════════
  infrared: {
    id: 'infrared',
    label: { de: 'Infrarot – Angst & Bedrohung', en: 'Infrared – Fear & Threat' },
    color: '#FF3B30',
    colorLight: 'rgba(255, 59, 48, 0.15)',
    icon: '🔴',
    description: {
      de: 'Militär- und Bedrohungssprache, die Angst auslösen soll',
      en: 'Military and threat language designed to trigger fear'
    },
    patterns: {
      de: [
        // === WAR & CONFLICT (single words that catch compounds) ===
        'krieg', 'kriegs', 'kriege', 'kriegen',
        'kampf', 'kämpfe', 'kämpfen', 'bekämpfung',
        'konflikt', 'konflikte',
        'gefecht', 'gefechte', 'schlacht',
        'front', 'frontlinie', 'frontverlauf',
        'offensive', 'gegenoffensive', 'angriff', 'angriffe',
        'vergeltung', 'vergeltungsschlag', 'gegenschlag',
        'bombardierung', 'bombardement', 'luftangriff', 'luftangriffe',
        'beschuss', 'raketenbeschuss', 'artilleriebeschuss',
        'einmarsch', 'invasion', 'besatzung', 'besetzung',
        'belagerung', 'einkesselung', 'blockade',

        // === WEAPONS (critical for your ORF example!) ===
        'waffe', 'waffen', 'bewaffnung', 'bewaffnet',
        'rakete', 'raketen', 'marschflugkörper', 'flugkörper',
        'panzer', 'kampfpanzer', 'schützenpanzer',
        'drohne', 'drohnen', 'kampfdrohne', 'kampfdrohnen',
        'munition', 'streumunition', 'geschoss', 'geschosse',
        'bombe', 'bomben', 'sprengkopf', 'gefechtskopf',
        'flugabwehr', 'raketenabwehr', 'luftabwehr', 'luftverteidigung',
        'patriot', 'iris-t', 'himars', 'gepard',
        'gewehr', 'maschinengewehr', 'artillerie', 'haubitze',
        'torpedo', 'mine', 'landmine', 'sprengstoff',
        'atomwaffe', 'nuklearwaffe', 'chemiewaffe', 'biowaffe',

        // === MILITARY ENTITIES ===
        'militär', 'armee', 'streitkräfte', 'truppen', 'soldaten',
        'brigade', 'bataillon', 'regiment', 'division',
        'spezialeinheit', 'spezialeinheiten', 'spezialkräfte',
        'marine', 'luftwaffe', 'heer', 'flotte', 'kriegsschiff',
        'kampfjet', 'kampfflugzeug', 'bomber', 'abfangjäger',
        'nato', 'pentagon',

        // === MILITARY OPERATIONS ===
        'einsatz', 'militäreinsatz', 'kampfeinsatz', 'kriegseinsatz',
        'operation', 'militäroperation', 'bodenoperation',
        'intervention', 'militärintervention',
        'manöver', 'truppenaufmarsch', 'mobilmachung', 'mobilisierung',
        'stationierung', 'truppenstationierung',
        'abschreckung', 'abwehr', 'verteidigung',

        // === VIOLENCE & DESTRUCTION ===
        'vernichtung', 'zerstörung', 'verwüstung', 'auslöschung',
        'massaker', 'blutbad', 'gemetzel',
        'barbarisch', 'grausam', 'brutal', 'bestialisch',
        'opfer', 'todesopfer', 'zivilopfer', 'gefallene', 'verwundete',
        'tote', 'getötet', 'getötete', 'hingerichtet',
        'verletzte', 'verschleppt', 'entführt', 'gefoltert',
        'flucht', 'vertreibung', 'flüchtlinge', 'vertriebene',

        // === THREAT & DANGER ===
        'bedrohung', 'bedroht', 'gefahr', 'gefährlich', 'gefährdet',
        'eskalation', 'eskaliert', 'zuspitzung',
        'terror', 'terroristen', 'terrorismus', 'terroranschlag',
        'katastrophe', 'katastrophal', 'desaster',
        'notstand', 'ausnahmezustand', 'alarmstufe',
        'krise', 'krisen',

        // === EMOTIONAL AMPLIFIERS ===
        'dramatisch', 'schockierend', 'erschütternd', 'verheerend',
        'beispiellos', 'nie dagewesen', 'historisch',
        'apokalypse', 'apokalyptisch', 'untergang',
        'zusammenbruch', 'kollaps', 'panik',

        // === NUCLEAR ===
        'atomar', 'nuklear', 'atomkrieg', 'nuklearkrieg',
        'atomwaffen', 'nuklearwaffen', 'atombombe',
        'weltkrieg', 'dritter weltkrieg'
      ],
      en: [
        // War & conflict
        'war', 'warfare', 'wars', 'combat', 'battle', 'battles',
        'fighting', 'fight', 'conflict', 'conflicts',
        'frontline', 'front line', 'offensive', 'counter-offensive',
        'attack', 'attacks', 'strike', 'strikes', 'airstrike', 'airstrikes',
        'bombardment', 'bombing', 'shelling', 'barrage',
        'invasion', 'occupation', 'siege', 'blockade', 'encirclement',
        'retaliation', 'retaliatory strike', 'counterattack',

        // Weapons
        'weapon', 'weapons', 'arms', 'armed', 'armament',
        'missile', 'missiles', 'cruise missile', 'ballistic missile',
        'rocket', 'rockets', 'warhead',
        'tank', 'tanks', 'armored vehicle',
        'drone', 'drones', 'combat drone', 'uav',
        'ammunition', 'cluster munition', 'shell', 'shells',
        'bomb', 'bombs', 'explosive',
        'air defense', 'missile defense', 'anti-aircraft',
        'artillery', 'howitzer', 'torpedo', 'landmine',
        'nuclear weapon', 'chemical weapon', 'biological weapon',

        // Military entities
        'military', 'army', 'armed forces', 'troops', 'soldiers',
        'brigade', 'battalion', 'regiment', 'division',
        'special forces', 'navy', 'air force', 'fleet', 'warship',
        'fighter jet', 'bomber', 'interceptor',
        'nato', 'pentagon',

        // Military operations
        'deployment', 'military operation', 'ground operation',
        'intervention', 'military intervention',
        'mobilization', 'troop buildup', 'deterrence',

        // Violence & destruction
        'annihilation', 'destruction', 'devastation',
        'massacre', 'bloodbath', 'carnage', 'slaughter',
        'barbaric', 'brutal', 'savage', 'atrocity', 'atrocities',
        'casualties', 'killed', 'wounded', 'dead',
        'refugees', 'displaced', 'abducted', 'tortured',

        // Threat & danger
        'threat', 'threatened', 'danger', 'dangerous', 'endangered',
        'escalation', 'escalating',
        'terror', 'terrorists', 'terrorism', 'terrorist attack',
        'catastrophe', 'catastrophic', 'disaster',
        'emergency', 'crisis',

        // Emotional amplifiers
        'dramatic', 'shocking', 'devastating', 'horrifying',
        'unprecedented', 'historic', 'apocalyptic',
        'collapse', 'panic',

        // Nuclear
        'nuclear', 'atomic', 'nuclear war', 'world war'
      ]
    },
    regexPatterns: {
      de: [
        /(?:droht?|bedroht?)\s+(?:mit\s+)?(?:krieg|vernichtung|zerstörung|vergeltung|eskalation|angriff)/gi,
        /(?:tausende|hunderte|millionen|dutzende|unzählige)\s+(?:tote|opfer|verletzte|verwundete|gefallene|getötete|menschen)/gi,
        /(?:gegen|auf)\s+(?:russland|ukraine|iran|china|israel|hamas|hisbollah|isis)/gi,
        /(?:raketen?|drohnen?|bomben?|geschosse?)\s+(?:auf|gegen|über|abgefeuert|eingeschlagen|abgeschossen)/gi,
        /(?:krieg|kampf|konflikt)\s+(?:gegen|mit|in|um|zwischen)/gi,
        /(?:abwehr|bekämpfung|vernichtung|zerstörung)\s+(?:von|der|des|gegen)/gi
      ],
      en: [
        /(?:threatens?|threatened)\s+(?:to\s+)?(?:war|destruction|retaliation|attack|strike)/gi,
        /(?:thousands|hundreds|millions|dozens|countless)\s+(?:dead|killed|wounded|casualties|victims)/gi,
        /(?:against|on)\s+(?:russia|ukraine|iran|china|israel|hamas|hezbollah|isis)/gi,
        /(?:missiles?|drones?|bombs?|shells?)\s+(?:on|against|over|fired|hit|struck|launched)/gi,
        /(?:war|combat|conflict|fight)\s+(?:against|with|in|over|between)/gi
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GELB – Interessen & Profit / Interests & Profit
  // Arms deals, financial interests, trade in war
  // ═══════════════════════════════════════════════════════════════
  yellow: {
    id: 'yellow',
    label: { de: 'Gelb – Interessen & Profit', en: 'Yellow – Interests & Profit' },
    color: '#FFB800',
    colorLight: 'rgba(255, 184, 0, 0.15)',
    icon: '🟡',
    description: {
      de: 'Finanzielle Interessen und Waffenhandel hinter der Nachricht',
      en: 'Financial interests and arms trade behind the narrative'
    },
    patterns: {
      de: [
        // === ARMS TRADE & DEALS ===
        'waffenlieferung', 'waffenlieferungen', 'waffenpartnerschaft',
        'waffenexport', 'waffenexporte', 'waffenhandel', 'waffendeal',
        'rüstungsexport', 'rüstungsexporte', 'rüstungsdeal',
        'rüstungshilfe', 'militärhilfe', 'waffenhilfe',
        'lieferung', 'lieferungen', // in military context caught by regex
        'hilfspaket', 'militärpaket', 'waffenpaket',
        'partnerschaft', // caught by regex in military context

        // === MILITARY INDUSTRY ===
        'rüstung', 'rüstungsindustrie', 'rüstungskonzern', 'rüstungsgüter',
        'rüstungsausgaben', 'rüstungsetat', 'rüstungsbudget',
        'verteidigungshaushalt', 'verteidigungsausgaben', 'verteidigungsbudget',
        'verteidigungsetat', 'sondervermögen',
        'aufrüstung', 'nachrüstung', 'hochrüstung',
        'modernisierung', 'beschaffung', 'anschaffung',
        'zwei-prozent-ziel', '2-prozent-ziel', 'nato-ziel',

        // === MONEY & ECONOMICS ===
        'milliarden', 'millionen', 'milliardenschwer',
        'kredit', 'kredite', 'hilfskredit', 'milliardenkredits',
        'gegenleistung', 'tauschhandel', 'kompensation',
        'investition', 'investitionen',
        'finanzierung', 'finanzmittel', 'finanzhilfe',
        'kosten', 'ausgaben', 'budget', 'etat',
        'steuergelder', 'steuergeld', 'steuerzahler',

        // === COMMERCIAL EUPHEMISMS FOR WAR ===
        'expertise', 'know-how', 'technologie-transfer',
        'vorteilhaft', 'vorteilhafte', 'für beide seiten vorteilhaft',
        'gegenseitig', 'beiderseitig', 'win-win',

        // === SPECIFIC COMPANIES ===
        'rheinmetall', 'krauss-maffei', 'thyssen', 'hensoldt', 'diehl defence',
        'lockheed martin', 'raytheon', 'boeing', 'northrop grumman',
        'general dynamics', 'bae systems', 'l3harris',
        'leonardo', 'thales', 'airbus defence', 'saab',
        'elbit', 'rafael', 'iai',

        // === STRATEGIC INTERESTS ===
        'strategische interessen', 'wirtschaftliche interessen',
        'geopolitische interessen', 'machtinteressen',
        'einflusszone', 'einflusssphäre', 'interessensphäre',
        'rohstoffe', 'energiesicherheit', 'versorgungssicherheit',
        'handelswege', 'seeweg', 'seewege',
        'sanktionen', 'wirtschaftssanktionen', 'handelsembargo',
        'öl', 'erdöl', 'erdgas', 'gas', 'pipeline'
      ],
      en: [
        // Arms trade
        'arms deal', 'arms deals', 'weapons deal',
        'arms export', 'weapons export', 'arms trade',
        'weapons delivery', 'weapons deliveries', 'arms delivery',
        'military aid', 'military assistance', 'weapons partnership',
        'aid package', 'military package', 'weapons package',

        // Military industry
        'defense industry', 'defense contractor', 'arms manufacturer',
        'defense spending', 'defense budget', 'military spending',
        'military budget', 'special fund', 'procurement',
        'rearmament', 'modernization', 'acquisition',

        // Money
        'billion', 'billions', 'million', 'millions',
        'loan', 'loans', 'credit',
        'in return', 'quid pro quo', 'compensation',
        'investment', 'investments', 'funding',
        'taxpayer money', 'taxpayer dollars',

        // Commercial euphemisms for war
        'expertise', 'know-how', 'technology transfer',
        'mutually beneficial', 'win-win', 'partnership',

        // Companies
        'lockheed martin', 'raytheon', 'boeing', 'northrop grumman',
        'general dynamics', 'bae systems', 'l3harris',
        'rheinmetall', 'thales', 'airbus defence', 'saab',
        'elbit', 'rafael',

        // Strategic interests
        'strategic interests', 'economic interests',
        'geopolitical interests', 'sphere of influence',
        'resources', 'energy security', 'supply chain',
        'trade routes', 'sea lanes',
        'sanctions', 'embargo',
        'oil', 'petroleum', 'natural gas', 'pipeline'
      ]
    },
    regexPatterns: {
      de: [
        /\d+[\s,\.]*(?:milliarden?|millionen?|mrd\.?|mio\.?)\s*(?:euro|dollar|us-dollar|\$|€|usd)/gi,
        /(?:milliarden|millionen)\s*(?:schwer|paket|kredit|hilfe|programm)/gi,
        /(?:partnerschaft|kooperation|zusammenarbeit|deal)\s+(?:bei|im\s+bereich|für|zur)\s+(?:waffen|rüstung|verteidigung|militär|drohnen|abwehr)/gi,
        /(?:lieferung|export|handel|geschäft)\s+(?:von|mit|der)\s+(?:waffen|raketen|panzer|munition|drohnen|rüstungsgütern)/gi,
        /(?:geld|gelder|mittel|finanzen|kredit)\s+(?:für|zur|zum)\s+(?:krieg|verteidigung|abwehr|rüstung|aufrüstung|militär)/gi,
        /(?:als|im)\s+gegenleistung/gi,
        /(?:stärken|unterstützen|helfen)\s+.*(?:die\s+uns|können)/gi
      ],
      en: [
        /\$?\d+[\s,\.]*(?:billion|million|bn|mn|trillion)\s*(?:in|for|of|worth)?\s*(?:aid|military|defense|weapons|arms)?/gi,
        /(?:partnership|cooperation|deal)\s+(?:in|for|on)\s+(?:weapons|defense|military|drones|arms)/gi,
        /(?:delivery|export|trade|sale)\s+(?:of|in)\s+(?:weapons|missiles|tanks|ammunition|drones|arms)/gi,
        /(?:money|funds?|financing|loan)\s+(?:for|to\s+fund)\s+(?:war|defense|military|arms)/gi
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // BLAU – Künstliche Autorität / Artificial Authority
  // Vague sources, attribution tricks, authority claims
  // ═══════════════════════════════════════════════════════════════
  blue: {
    id: 'blue',
    label: { de: 'Blau – Künstliche Autorität', en: 'Blue – Artificial Authority' },
    color: '#007AFF',
    colorLight: 'rgba(0, 122, 255, 0.15)',
    icon: '🔵',
    description: {
      de: 'Vage Quellen, Autoritätsargumente, unprüfbare Behauptungen',
      en: 'Vague sources, authority arguments, unverifiable claims'
    },
    patterns: {
      de: [
        // === VAGUE SOURCING ===
        'nach angaben', 'angaben nach', 'seinen angaben nach', 'ihren angaben nach',
        'laut angaben', 'nach aussage', 'nach aussagen',
        'nach einschätzung', 'nach ansicht', 'nach auffassung',
        'nach informationen', 'nach erkenntnissen',
        'experten sagen', 'experten warnen', 'experten zufolge', 'laut experten',
        'analysten sagen', 'beobachter sagen', 'kenner sagen',
        'geheimdienstkreise', 'sicherheitskreise', 'regierungskreise',
        'informierte kreise', 'diplomatische kreise',
        'aus kreisen', 'wie aus kreisen verlautet',
        'gut informierte quellen', 'aus sicherheitskreisen',

        // === HEDGING & VAGUE ATTRIBUTION ===
        'es heißt', 'es wird berichtet', 'es gilt als',
        'man geht davon aus', 'es wird vermutet', 'es wird angenommen',
        'berichten zufolge', 'medienberichten zufolge',
        'offenbar', 'angeblich', 'mutmaßlich', 'vermutlich',
        'nach unbestätigten berichten', 'unbestätigten angaben',
        'quellen berichten', 'insider berichten',

        // === SPEECH ACT VERBS (how politicians' words get elevated) ===
        'sagte er', 'sagte sie', 'erklärte er', 'erklärte sie',
        'betonte er', 'betonte sie', 'unterstrich er', 'unterstrich sie',
        'machte deutlich', 'machte klar', 'stellte klar', 'stellte fest',
        'warnte er', 'warnte sie', 'forderte er', 'forderte sie',
        'bekräftigte', 'versicherte', 'versprach',

        // === AUTHORITY APPEALS ===
        'unbestritten', 'außer frage', 'kein zweifel',
        'zweifellos', 'unbestreitbar', 'allgemein anerkannt',
        'wissenschaftlicher konsens', 'die wissenschaft ist sich einig',
        'alle experten', 'einhellig', 'einstimmig'
      ],
      en: [
        // Vague sourcing
        'according to', 'sources say', 'sources familiar with',
        'intelligence sources', 'security sources', 'government sources',
        'informed sources', 'well-placed sources', 'senior officials',
        'experts say', 'experts warn', 'analysts say', 'observers say',
        'a person familiar with', 'people briefed on',
        'officials speaking on condition of anonymity',

        // Hedging
        'it is reported', 'reportedly', 'allegedly', 'supposedly',
        'it is believed', 'it is understood', 'it is thought',
        'unconfirmed reports', 'insiders report',

        // Speech act verbs
        'he said', 'she said', 'he stated', 'she stated',
        'he emphasized', 'she emphasized', 'he stressed', 'she stressed',
        'he made clear', 'she made clear', 'he warned', 'she warned',
        'he demanded', 'she demanded', 'he urged', 'she urged',
        'he insisted', 'she insisted', 'he vowed', 'she vowed',

        // Authority appeals
        'undisputed', 'beyond question', 'without doubt',
        'undeniable', 'widely accepted', 'scientific consensus',
        'experts agree', 'unanimously'
      ]
    },
    regexPatterns: {
      de: [
        /(?:laut|nach|gemäß)\s+(?:angaben|aussage[n]?|einschätzung|ansicht|auffassung|informationen|erkenntnissen)\s+(?:von|des|der|ihres?|seines?)/gi,
        /(?:sagte|erklärte|betonte|unterstrich|warnte|forderte|machte\s+deutlich)\s+(?:er|sie|der|die|das)\s+/gi,
        /(?:wie|als)\s+.*\s+(?:bekannt\s+wurde|erfuhr|verlautete|berichtet\s+wird)/gi,
        /(?:seinen|ihren|den)\s+angaben\s+(?:nach|zufolge|gemäß)/gi,
        /in\s+(?:seiner|ihrer)\s+(?:abendlichen|täglichen|wöchentlichen)?\s*(?:videobotschaft|ansprache|rede|erklärung|pressekonferenz)/gi,
        /(?:hochrangige[rn]?|anonyme[rn]?)\s+(?:beamte[rn]?|offizielle[rn]?|vertreter[n]?|diplomaten?)/gi
      ],
      en: [
        /(?:according\s+to)\s+(?:unnamed|anonymous|undisclosed|senior|intelligence|security|government|western|US|military)\s+(?:sources?|officials?|figures?|diplomats?)/gi,
        /(?:speaking|talked?)\s+(?:on\s+)?(?:condition\s+of\s+)?(?:anonymity|background|the\s+record)/gi,
        /(?:said|stated|emphasized|stressed|warned|urged|insisted|vowed)\s+(?:in|during)\s+(?:his|her|a|an|the)\s+(?:address|speech|statement|briefing|video\s+message)/gi
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ULTRAVIOLETT – Ethische Überhöhung & Framing / Moral Elevation
  // Moral superiority, euphemisms, noble framing of war
  // ═══════════════════════════════════════════════════════════════
  ultraviolet: {
    id: 'ultraviolet',
    label: { de: 'Ultraviolett – Framing & Moral', en: 'Ultraviolet – Framing & Moral' },
    color: '#AF52DE',
    colorLight: 'rgba(175, 82, 222, 0.15)',
    icon: '🟣',
    description: {
      de: 'Moralische Überhöhung, Euphemismen, edles Framing von Krieg',
      en: 'Moral elevation, euphemisms, noble framing of war'
    },
    patterns: {
      de: [
        // === VALUE-BASED FRAMING ===
        'wertegemeinschaft', 'westliche werte', 'unsere werte',
        'europäische werte', 'freiheitliche werte', 'demokratische werte',
        'zivilisierte welt', 'freie welt', 'regelbasierte ordnung',
        'wertebasierte außenpolitik',
        'auf der richtigen seite', 'auf der falschen seite',

        // === EUPHEMISMS FOR WAR ===
        'richtige perspektive', 'echte chance',
        'stärkung', 'verstärkung', 'ertüchtigung',
        'sicherheitsarchitektur', 'sicherheitsordnung',
        'friedenssicherung', 'friedenserzwingung', 'friedensmission',
        'stabilisierung', 'stabilisierungseinsatz',
        'humanitärer einsatz', 'humanitäre intervention',
        'schutzverantwortung', 'schutzmacht',

        // === POSITIVE SPIN ON MILITARY ===
        'stärken', 'verstärken', 'ertüchtigen',
        'unterstützen', 'unterstützung', 'beistand',
        'hilfe leisten', 'zur seite stehen',
        'solidarität', 'bündnistreue', 'bündnispflicht',
        'zusammenarbeit', 'kooperation', 'partnerschaft',

        // === MORAL OBLIGATION ===
        'historische verantwortung', 'moralische pflicht', 'moralische verantwortung',
        'humanitäre pflicht', 'nie wieder',
        'historische lehre', 'aus der geschichte gelernt',
        'solidarität zeigen', 'zusammenstehen', 'geschlossen auftreten',
        'sich behaupten', 'standhaft', 'entschlossen', 'entschlossenheit',

        // === ENEMY FRAMING ===
        'regime', 'diktator', 'despot', 'tyrann', 'autokrat',
        'schurkenstaat', 'achse des bösen', 'aggressor', 'aggressoren',
        'feind der freiheit', 'feind der demokratie',
        'bedrohung für die demokratie',
        'expansionismus', 'imperialismus', 'hegemoniestreben',

        // === SILENCING DISSENT ===
        'wer jetzt schweigt', 'in dieser stunde',
        'jetzt ist nicht die zeit für', 'keine neutralität möglich',
        'wer nicht für uns ist', 'man muss sich entscheiden',
        'unverantwortlich', 'fahrlässig', 'naiv', 'realitätsfern',
        'putinversteher', 'antiamerikanisch', 'antiwestlich',
        'appeasement', 'beschwichtigung'
      ],
      en: [
        // Value-based framing
        'our values', 'western values', 'european values',
        'democratic values', 'civilized world', 'free world',
        'rules-based order', 'values-based foreign policy',
        'right side of history', 'wrong side of history',

        // Euphemisms
        'real opportunity', 'real chance', 'right perspective',
        'strengthening', 'reinforcement', 'empowerment',
        'security architecture', 'peacekeeping', 'peace enforcement',
        'stabilization', 'humanitarian intervention',
        'responsibility to protect',

        // Positive spin
        'strengthen', 'reinforce', 'support', 'assistance',
        'solidarity', 'alliance commitment', 'partnership',
        'cooperation', 'standing by', 'back up',

        // Moral obligation
        'moral obligation', 'moral duty', 'moral responsibility',
        'humanitarian duty', 'never again', 'lessons of history',
        'show solidarity', 'stand together', 'united front',
        'resolute', 'determined', 'decisive',

        // Enemy framing
        'regime', 'dictator', 'despot', 'tyrant', 'autocrat',
        'rogue state', 'axis of evil', 'aggressor',
        'enemy of freedom', 'threat to democracy',
        'expansionism', 'imperialism',

        // Silencing dissent
        'who remains silent now', 'now is not the time',
        'no neutrality possible', 'you must choose a side',
        'irresponsible', 'reckless', 'naive', 'out of touch',
        'apologist', 'useful idiot', 'appeasement'
      ]
    },
    regexPatterns: {
      de: [
        /(?:für\s+beide\s+seiten|beiderseitig|gegenseitig)\s+(?:vorteilhaft|nützlich|gewinnbringend)/gi,
        /(?:die|eine)\s+(?:richtige|echte|wahre|einzige|historische)\s+(?:perspektive|chance|möglichkeit|gelegenheit|antwort)/gi,
        /(?:uns?|einander|gegenseitig)\s+(?:stärken|verstärken|unterstützen|ertüchtigen|helfen)/gi,
        /(?:kampf|einsatz|verteidigung|engagement)\s+(?:für|der|um)\s+(?:freiheit|demokratie|menschenrechte|frieden|sicherheit)/gi,
        /(?:diejenigen|jene|die),?\s+die\s+uns\s+(?:stärken|unterstützen|helfen)/gi,
        /(?:wir\s+können|ukraine\s+(?:kann|schlägt|bietet))\s+.*(?:stärken|verstärken|unterstützen|helfen)/gi,
        /abwehrkrieg\s+(?:gegen|mit|in)/gi
      ],
      en: [
        /(?:mutually|reciprocally)\s+(?:beneficial|advantageous|rewarding)/gi,
        /(?:the|a)\s+(?:right|real|true|only|historic)\s+(?:perspective|opportunity|chance|path|answer)/gi,
        /(?:us|each\s+other|one\s+another)\s+(?:strengthen|reinforce|support|empower|help)/gi,
        /(?:fight|battle|defense|struggle|engagement)\s+(?:for|of)\s+(?:freedom|democracy|human\s+rights|peace|security)/gi,
        /(?:those|the\s+ones)\s+who\s+(?:can\s+)?(?:strengthen|support|help)\s+us/gi
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GRÜN – "Wir gegen Die" / Us vs. Them
  // Artificial group identity, enemy construction, othering
  // ═══════════════════════════════════════════════════════════════
  green: {
    id: 'green',
    label: { de: 'Grün – Wir gegen Die', en: 'Green – Us vs. Them' },
    color: '#34C759',
    colorLight: 'rgba(52, 199, 89, 0.15)',
    icon: '🟢',
    description: {
      de: 'Gruppenbildung, Feindbilder, künstliches "Wir"',
      en: 'Group construction, enemy images, artificial "us"'
    },
    patterns: {
      de: [
        // === ARTIFICIAL "WE" ===
        'wir als europäer', 'wir als deutsche', 'wir als österreicher',
        'wir als gesellschaft', 'wir als westen',
        'wir alle', 'wir gemeinsam', 'wir zusammen',
        'unser land', 'unsere nation', 'unsere heimat',
        'unsere sicherheit', 'unsere zukunft', 'unsere kinder',
        'unsere freiheit', 'unsere demokratie', 'unsere werte',
        'aus unserer sicht', 'für uns', 'uns zu verstärken',
        'uns stärken', 'unsere seite',

        // === OBLIGATION FRAMING ===
        'wir müssen', 'wir dürfen nicht', 'wir können nicht zulassen',
        'wir sind es schuldig', 'es ist unsere pflicht',
        'jeder muss seinen beitrag', 'daher müsse',
        'gemeinsam gegen', 'geschlossen gegen', 'vereint gegen',

        // === NATION/ENTITY AS ACTOR ===
        'die ukraine', 'russland', 'moskau', 'der kreml',
        'washington', 'peking', 'teheran', 'jerusalem', 'kiew',
        'die usa', 'amerika', 'china', 'iran', 'israel',
        'der westen', 'europa', 'die eu',

        // === ENEMY CONSTRUCTION ===
        'die russen', 'die chinesen', 'die iraner',
        'die anderen', 'der feind', 'die gegner', 'die aggressoren',
        'die bedrohung aus dem osten', 'auf der anderen seite',
        'blockadehaltung', 'obstruktion', 'verweigerung', 'sabotage',
        'verhindert', 'blockiert', 'verweigert',

        // === LOYALTY TESTS ===
        'in schwierigen zeiten', 'jetzt zusammenhalten',
        'geschlossenheit zeigen', 'einigkeit demonstrieren',
        'seite an seite', 'schulter an schulter',
        'bündnispartner', 'verbündete', 'alliierte'
      ],
      en: [
        // Artificial "we"
        'we as europeans', 'we as americans', 'we as a society',
        'we the people', 'all of us', 'together we',
        'our country', 'our nation', 'our homeland',
        'our security', 'our future', 'our children',
        'our freedom', 'our democracy', 'our values',
        'from our perspective', 'on our side',

        // Obligation
        'we must', 'we cannot allow', 'we cannot stand by',
        'we owe it to', 'it is our duty', 'everyone must contribute',
        'together against', 'united against',

        // Nations as actors
        'ukraine', 'russia', 'moscow', 'the kremlin',
        'washington', 'beijing', 'tehran', 'jerusalem', 'kyiv',
        'the west', 'europe', 'the eu', 'the us',

        // Enemy construction
        'the russians', 'the chinese', 'the iranians',
        'the enemy', 'the aggressors', 'the other side',
        'obstruction', 'sabotage', 'blocking',
        'prevented', 'blocked', 'refused',

        // Loyalty tests
        'in difficult times', 'stand together now',
        'show unity', 'demonstrate solidarity',
        'side by side', 'shoulder to shoulder',
        'ally', 'allies', 'allied'
      ]
    },
    regexPatterns: {
      de: [
        /die\s+ukraine\s+(?:schlägt|bietet|will|kann|soll|muss|braucht|fordert|verhandelt|sucht)/gi,
        /(?:kiew|selenskyj|ukraine)\s+(?:an|mit|gegen|für|über|bei)\s+(?:die|den|dem|der)/gi,
        /(?:wir|uns|unsere[rn]?)\s+(?:müssen|können|sollen|dürfen|brauchen|wollen)\s/gi,
        /(?:gegen|mit|zwischen)\s+(?:russland|iran|china|dem\s+westen|der\s+ukraine|der\s+nato|der\s+eu)/gi,
        /(?:die|eine|ungarn[s]?)\s+(?:blockade|blockadehaltung|verweigerung|obstruktion)/gi,
        /(?:weitere|neue|andere)\s+(?:möglichkeiten|wege|optionen|partner|verbündete)\s+(?:zur|für|zu|suchen)/gi,
        /(?:aus\s+unserer\s+sicht|für\s+uns|auf\s+unserer\s+seite)/gi
      ],
      en: [
        /(?:ukraine|kyiv|zelensky|zelenskyy)\s+(?:offers|proposes|wants|needs|demands|seeks|negotiates)/gi,
        /(?:we|us|our)\s+(?:must|can|should|need\s+to|have\s+to|want\s+to)\s/gi,
        /(?:against|with|between)\s+(?:russia|iran|china|the\s+west|ukraine|nato|the\s+eu)/gi,
        /(?:further|new|other|additional)\s+(?:options|ways|paths|partners|allies)\s+(?:to|for)/gi
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ORANGE – Künstliche Dringlichkeit / Artificial Urgency
  // Time pressure, forced choices, no-alternative framing
  // ═══════════════════════════════════════════════════════════════
  orange: {
    id: 'orange',
    label: { de: 'Orange – Künstliche Dringlichkeit', en: 'Orange – Artificial Urgency' },
    color: '#FF9500',
    colorLight: 'rgba(255, 149, 0, 0.15)',
    icon: '🟠',
    description: {
      de: 'Zeitdruck, Alternativlosigkeit, erzwungene Entscheidungen',
      en: 'Time pressure, no alternatives, forced decisions'
    },
    patterns: {
      de: [
        // === TIME PRESSURE ===
        'das zeitfenster schließt sich', 'die zeit drängt', 'die zeit läuft',
        'jetzt oder nie', 'letzte chance', 'in letzter sekunde',
        'sofortiges handeln', 'unverzüglich', 'umgehend',
        'keine zeit zu verlieren', 'dringend', 'höchste eile',
        'so schnell wie möglich', 'nicht länger warten',
        'bevor es zu spät ist', 'fünf vor zwölf', 'letzte warnung',
        'countdown', 'die uhr tickt',

        // === NO-ALTERNATIVE FRAMING ===
        'alternativlos', 'es gibt keine alternative', 'keine andere wahl',
        'einzige option', 'einziger weg', 'der einzige ausweg',
        'muss', 'müsse', 'müssen', // caught by regex for stronger context
        'daher müsse', 'deshalb müsse', 'deswegen müsse',
        'gezwungen', 'keine wahl', 'zwangsläufig',
        'unausweichlich', 'unvermeidlich', 'unvermeidbar',

        // === FORCED NECESSITY ===
        'notwendig', 'erforderlich', 'unerlässlich', 'unabdingbar',
        'zwingend', 'zwingend notwendig', 'dringend erforderlich',
        'überlebensnotwendig', 'existenznotwendig',

        // === HISTORIC MOMENT FRAMING ===
        'historischer moment', 'entscheidende stunde', 'wendepunkt',
        'jetzt entscheidet sich', 'schicksalsstunde',
        'an einem scheideweg', 'vor einer zeitenwende', 'zeitenwende',
        'neues zeitalter', 'neue ära', 'neue realität',

        // === CONSEQUENCE FRAMING ===
        'wenn nicht jetzt', 'andernfalls', 'sonst',
        'die konsequenzen wären', 'die folgen wären'
      ],
      en: [
        // Time pressure
        'window is closing', 'time is running out', 'running out of time',
        'now or never', 'last chance', 'at the last second',
        'immediate action', 'without delay', 'act immediately',
        'no time to lose', 'urgently', 'utmost urgency',
        'as soon as possible', 'cannot wait any longer',
        'before it is too late', 'eleventh hour', 'final warning',
        'the clock is ticking',

        // No-alternative
        'no alternative', 'there is no alternative', 'no other choice',
        'only option', 'only way', 'the only way out',
        'forced to', 'no choice', 'inevitably',
        'unavoidable', 'inevitable',

        // Forced necessity
        'necessary', 'essential', 'indispensable', 'imperative',
        'critically needed', 'vital', 'crucial',

        // Historic moment
        'historic moment', 'decisive hour', 'turning point',
        'this decides', 'fateful hour', 'point of no return',
        'watershed moment', 'new era', 'new reality',

        // Consequence
        'if not now', 'otherwise', 'the consequences would be'
      ]
    },
    regexPatterns: {
      de: [
        /(?:jetzt|sofort|unverzüglich|umgehend|rasch|schnell)\s+(?:muss|müssen|müsse|handeln|entscheiden|reagieren)/gi,
        /(?:daher|deshalb|deswegen|folglich|also|somit)\s+müsse?\s/gi,
        /(?:letzte[rn]?|einzige[rn]?|allerletzte[rn]?)\s+(?:chance|möglichkeit|gelegenheit|ausweg|option)/gi,
        /(?:noch|nur\s+noch)\s+(?:wenige|einige|ein\s+paar)\s+(?:tage|stunden|wochen|monate)/gi,
        /(?:es\s+gibt|es\s+bleibt|es\s+besteht)\s+keine\s+(?:alternative|andere\s+(?:möglichkeit|wahl|option))/gi,
        /weitere\s+möglichkeiten\s+(?:zur|zu|für)\s+(?:eigenen?\s+)?stärkung\s+suchen/gi
      ],
      en: [
        /(?:must|need\s+to|have\s+to)\s+(?:act|decide|respond)\s+(?:now|immediately|at\s+once|quickly)/gi,
        /(?:therefore|consequently|thus|hence)\s+(?:must|need\s+to|have\s+to)\s/gi,
        /(?:last|final|only|sole)\s+(?:chance|opportunity|option|window|resort)/gi,
        /(?:only|just)\s+(?:a\s+few|days?|hours?|weeks?|months?)\s+(?:left|remaining|before|away)/gi
      ]
    }
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.DIAMOND_PATTERNS = DIAMOND_PATTERNS;
}
