/**
 * DIAMOND – Gefrierpunkt Engine v2.0
 * "Der Gefrierpunkt der Information"
 *
 * Totale Dekonstruktion von gesellschaftlichem, politischem
 * und wirtschaftlichem Framing durch 3 Schnitte:
 *
 *   1. SCHNITT (Die Ressource):  Was ist der reale Einsatz?
 *   2. SCHNITT (Der Tausch):     Wer profitiert, wenn der Leser glaubt?
 *   3. SCHNITT (Die Mechanik):   Welcher psychologische Hebel wird genutzt?
 *
 * Regeln:
 *   – Eliminiere alle moralisierenden Adjektive.
 *   – Ersetze Passiv durch Aktiv: „Akteur X fordert Y für Ziel Z".
 *   – Ergebnis: eiskalter, mechanischer Satz (max. 15 Wörter).
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // NOISE STRIPPING
  // ═══════════════════════════════════════════════════════

  const STRIP_PATTERNS = [
    // Attribution
    /(?:eigenen\s+)?Angaben\s+(?:von\s+|des\s+|der\s+)?(?:zufolge)?/gi,
    /(?:wie|so)\s+[\w]+\s+(?:berichtete|erklärte|mitteilte|sagte|meldete)/gi,
    /[\w]+\s+(?:sagte|erklärte|betonte|unterstrich|fügte\s+hinzu|gab\s+bekannt)/gi,
    /nach\s+(?:Angaben|Aussage|Darstellung|Einschätzung)\s+(?:von|des|der)\s+[\w\s]{2,20}/gi,
    /Medienberichten\s+zufolge/gi,
    /laut\s+(?:einem?\s+)?(?:Bericht|Sprecher|Angaben|Medien)\w*/gi,
    // Hedging
    /möglicherweise|offenbar|angeblich|vermutlich|anscheinend|mutmaßlich/gi,
    // Moral adjectives
    /\b(?:gut|böse|gerecht|ungerecht|historisch|notwendig|wichtig|bedeutend)\w{0,3}\b/gi,
    /\b(?:großangelegt|umfassend|weitreichend|massiv|brutal|dramatisch|katastrophal|verheerend)\w{0,3}\b/gi,
    /\b(?:beispiellos|einmalig|entscheidend|sogenannt)\w{0,3}\b/gi,
    // Filler
    /\b(?:auch|zudem|außerdem|darüber\s+hinaus|ferner|indes|unterdessen|derweil|bereits|nunmehr)\b/gi,
    // Quotes
    /[„""»«‹›]/g,
  ];

  // ═══════════════════════════════════════════════════════
  // SCHNITT 1: RESSOURCE
  // Was ist der reale Einsatz?
  // ═══════════════════════════════════════════════════════

  const RESOURCES = [
    {
      id: 'GELD',
      label: 'Kapital',
      shortLabels: ['Kapital', 'Finanzmittel', 'Gelder', 'Kredit'],
      patterns: [
        /milliard/i, /million/i, /billion/i, /kredit/i, /schuld/i, /steuer/i,
        /budget/i, /invest/i, /finanzi?\w*/i, /kosten/i, /subvention/i,
        /\beur(?:o|os)?\b/i, /dollar/i, /haushalt/i, /hilfsgelder/i,
        /wirtschaft/i, /kapital/i, /geld/i, /vermögen/i,
        /ausgaben/i, /\bbip\b/i, /bruttoinlandsprodukt/i, /etat/i,
        /prozent\w*\s+(?:des|ihres|für)/i,
      ],
    },
    {
      id: 'LEBEN',
      label: 'Menschenleben',
      shortLabels: ['Menschenleben', 'Zivilistenleben', 'Soldatenleben'],
      patterns: [
        /\btot[e]?\b/i, /\bopfer/i, /verletzt/i, /getötet/i,
        /zivil/i, /sterben/i, /überleb/i, /flüchtling/i,
        /evakuier/i, /humanitär/i, /bevölkerung/i, /einwohner/i,
      ],
    },
    {
      id: 'WAFFEN',
      label: 'Militärkapazität',
      shortLabels: ['Waffensysteme', 'Militärkapazität', 'Rüstung', 'Kriegsmaterial'],
      patterns: [
        /rakete/i, /drohne/i, /waffen/i, /rüstung/i, /munition/i,
        /bombe/i, /panzer/i, /kampfjet/i, /luftabwehr/i, /flugabwehr/i,
        /produktion\w*\s+(?:für\s+)?(?:raketen|drohnen|waffen)/i,
        /militär(?!isch)/i, /armee/i, /streitkräft/i,
        /verteidig/i, /aufrüst/i, /nachrüst/i, /cybersicherheit/i,
      ],
    },
    {
      id: 'TERRITORIUM',
      label: 'Territorium',
      shortLabels: ['Territorium', 'Gebiete', 'Land'],
      patterns: [
        /gebiet/i, /grenz/i, /annex/i, /besetz/i, /territoriu/i,
        /souveränität/i, /siedlung/i, /landnahme/i,
      ],
    },
    {
      id: 'MACHT',
      label: 'Machtposition',
      shortLabels: ['Machtposition', 'Einfluss', 'Kontrolle', 'Hegemonie'],
      patterns: [
        /einfluss/i, /kontroll/i, /herrschaft/i, /dominan/i,
        /\bmacht\b/i, /hegemoni/i, /vorherrschaft/i, /vormachtstellung/i,
      ],
    },
    {
      id: 'FREIHEIT',
      label: 'Grundrechte',
      shortLabels: ['Grundrechte', 'Bürgerrechte', 'Freiheitsrechte'],
      patterns: [
        /grundrecht/i, /freiheit/i, /bürgerrecht/i, /pressefreiheit/i,
        /meinungsfreiheit/i, /versammlungsfreiheit/i, /datenschutz/i,
        /privatsphäre/i, /eingriff/i, /unverletzlich/i,
      ],
    },
    {
      id: 'DATEN',
      label: 'Daten',
      shortLabels: ['Daten', 'Nutzerdaten', 'Überwachungsdaten'],
      patterns: [
        /daten\b/i, /überwach/i, /algorithm/i,
        /\bki\b/i, /künstliche.{0,5}intellig/i, /tracking/i,
        /datenerhebung/i, /datensammlung/i, /datensatz/i, /personalisier/i,
      ],
    },
    {
      id: 'ENERGIE',
      label: 'Energieressourcen',
      shortLabels: ['Energie', 'Rohstoffe', 'Öl', 'Gas'],
      patterns: [
        /\böl\b/i, /\bgas\b/i, /energi/i, /rohstoff/i, /pipeline/i,
        /atomkraft/i, /kohle\b/i, /lithium/i, /seltene\s+erde/i,
      ],
    },
    {
      id: 'GESUNDHEIT',
      label: 'Gesundheit',
      shortLabels: ['Gesundheit', 'Körper', 'Wohlbefinden'],
      patterns: [
        /gesundheit/i, /abnehm/i, /diät/i, /gewicht/i, /körper/i,
        /kalorien/i, /ernährung/i, /nahrungsergänzung/i, /vitamin/i,
        /heilung/i, /therapie/i, /medikament/i, /wirkstoff/i,
        /pille/i, /präparat/i, /supplement/i, /impf/i,
        /krankheit/i, /symptom/i, /diagnose/i, /behandlung/i,
        /fitness/i, /sport/i, /training/i, /wellness/i,
        /fettblocker/i, /wundermittel/i, /superfood/i,
      ],
    },
    {
      id: 'AUFMERKSAMKEIT',
      label: 'öffentliche Aufmerksamkeit',
      shortLabels: ['Aufmerksamkeit', 'Narrativ', 'öffentliche Meinung'],
      patterns: [
        /debatte/i, /diskussion/i, /öffentlich/i, /narrativ/i,
        /wahlkampf/i, /stimmung/i, /umfrage/i, /image/i,
      ],
    },
    {
      id: 'EXPERTISE',
      label: 'Expertise',
      shortLabels: ['Expertise', 'Know-how', 'Technologietransfer'],
      patterns: [
        /expertise/i, /know-?how/i, /technolog/i, /wissen/i, /fachkräft/i,
      ],
    },
    {
      id: 'ZEIT',
      label: 'Zeitfenster',
      shortLabels: ['Zeitfenster', 'Frist', 'Verhandlungszeit'],
      patterns: [
        /\bfrist/i, /deadline/i, /ultimat/i, /zeitdruck/i, /bevorstehend/i,
        /waffenruhe/i, /waffenstillstand/i, /feuerpause/i,
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════
  // SCHNITT 2: TAUSCH / PROFITEUR
  // Wer profitiert, wenn der Leser die Nachricht glaubt?
  // ═══════════════════════════════════════════════════════

  // Actor name simplification
  const ACTOR_SIMPLIFY = {
    'die israelische armee': 'Israel', 'das israelische militär': 'Israel',
    'israelische streitkräfte': 'Israel', 'die idf': 'Israel',
    'die russische armee': 'Russland', 'russische streitkräfte': 'Russland',
    'moskau': 'Russland', 'der kreml': 'Russland',
    'die ukrainische armee': 'Ukraine', 'ukrainische streitkräfte': 'Ukraine',
    'kiew': 'Ukraine',
    'die us-armee': 'USA', 'das us-militär': 'USA', 'das pentagon': 'USA',
    'washington': 'USA', 'das weiße haus': 'USA',
    'die bundesregierung': 'Deutschland', 'die bundeswehr': 'Deutschland', 'berlin': 'Deutschland',
    'die iranische armee': 'Iran', 'teheran': 'Iran', 'das iranische regime': 'Iran',
    'die chinesische regierung': 'China', 'peking': 'China',
    'die eu-kommission': 'EU', 'brüssel': 'EU',
    'die nato': 'NATO', 'die vereinten nationen': 'UNO',
    'die vereinigten arabischen emirate': 'VAE',
  };

  const ACTOR_REGEX = [
    /\b(Israel|Iran|USA|Russland|Ukraine|China|Deutschland|Frankreich|Türkei|Syrien|Irak|Ägypten|Saudi[- ]?Arabien|Nordkorea|Südkorea|Japan|Indien|Pakistan|Großbritannien|Ungarn|Polen|Georgien|Moldau|Libanon|Libyen|Jemen|Qatar|Katar|Bahrain|Kuwait|Oman)\b/gi,
    /\b(Golfstaaten|Golf-Staaten|Emirate)\b/gi,
    /\b(NATO|EU|UNO|IAEA|Hisbollah|Hamas|Centcom)\b/gi,
  ];

  const LEADER_TO_STATE = {
    'trump': 'USA', 'biden': 'USA', 'putin': 'Russland',
    'selenskyj': 'Ukraine', 'selenski': 'Ukraine',
    'netanjahu': 'Israel', 'netanyahu': 'Israel',
    'chamenei': 'Iran', 'khamenei': 'Iran',
    'xi': 'China', 'macron': 'Frankreich', 'scholz': 'Deutschland',
    'erdoğan': 'Türkei', 'erdogan': 'Türkei',
    'orbán': 'Ungarn', 'orban': 'Ungarn', 'cooper': 'USA',
  };

  // Leader title pattern – supports accented chars (á, é, ğ, etc.)
  const LEADER_RE = /(?:US-)?(?:Präsident|Premier(?:minister)?|Kanzler(?:in)?|König|Admiral|General|Befehlshaber)\s+([\p{Lu}][\p{L}]+(?:\s+[\p{Lu}][\p{L}]+)?)/gu;

  // Generic institutional actors (when no state name is found)
  const GENERIC_ACTORS = [
    { re: /\b(?:der\s+)?Bundeskanzler(?:in)?\b/i, short: 'Regierung' },
    { re: /\b(?:die\s+)?Bundesregierung\b/i, short: 'Regierung' },
    { re: /\b(?:die\s+)?Regierung\b/i, short: 'Regierung' },
    { re: /\b(?:die\s+)?Industrie\b/i, short: 'Industrie' },
    { re: /\b(?:die\s+)?Wirtschaft\b/i, short: 'Wirtschaft' },
    { re: /\b(?:die\s+)?Opposition\b/i, short: 'Opposition' },
    { re: /\b(?:das\s+)?Innenministerium\b/i, short: 'Innenministerium' },
    { re: /\b(?:das\s+)?(?:Verteidigungs|Außen|Finanz|Wirtschafts|Gesundheits|Umwelt)ministerium\b/i, short: 'Ministerium' },
    { re: /\bSicherheitsbehörden\b/i, short: 'Sicherheitsbehörden' },
    { re: /\bBürgerrechtler\b/i, short: 'Bürgerrechtler' },
    { re: /\bExperten\b/i, short: 'Experten' },
    { re: /\b(?:die\s+)?Gewerkschaft\w*\b/i, short: 'Gewerkschaften' },
    { re: /\b(?:die\s+)?Pharma(?:industrie|konzerne|branche)?\b/i, short: 'Pharma' },
    { re: /\b(?:die\s+)?Tech-?(?:konzerne|industrie|branche)?\b/i, short: 'Tech-Konzerne' },
    { re: /\b(?:die\s+)?Banken\b/i, short: 'Finanzsektor' },
    { re: /\b(?:die\s+)?Rüstungsindustrie\b/i, short: 'Rüstungsindustrie' },
    // Consumer / health / commercial actors
    { re: /\bHersteller\w*\b/i, short: 'Hersteller' },
    { re: /\bNahrungsergänzungsmittel(?:industrie|hersteller|branche)?\b/i, short: 'Supplement-Industrie' },
    { re: /\b(?:die\s+)?Lebensmittelindustrie\b/i, short: 'Lebensmittelindustrie' },
    { re: /\b(?:die\s+)?Diät(?:industrie|branche)\b/i, short: 'Diätindustrie' },
    { re: /\bAnbieter\w*\b/i, short: 'Anbieter' },
    { re: /\bKonzern\w*\b/i, short: 'Konzerne' },
    { re: /\bLobby(?:isten|ist|gruppe|verband)?\b/i, short: 'Lobby' },
    { re: /\bInfluencer\w*\b/i, short: 'Influencer' },
    { re: /\bWerbe(?:industrie|branche|treibende)\b/i, short: 'Werbeindustrie' },
    { re: /\bVersicherung\w*\b/i, short: 'Versicherungen' },
  ];

  // Patterns that indicate AGENCY (this actor is DOING something)
  const AGENCY_VERBS = /\b(?:hat|haben|beschloss|beschließ|verhängt?|sanktioniert?|blockiert?|stellt|liefert?|bietet|verweigert?|fordert?|verstärkt?|verschärft?|greift|attackiert?|zerstört?|angreift?|bombardiert?|drängt?|führt?|nutzt|setzt|mobilisiert?|werbe|kündigte?|plant?|ankündig\w*|verabschied\w*|beschied\w*|erließ|erlässt|genehmigt?|warnt?)\b/i;

  // Patterns that indicate TARGET role
  const TARGET_MARKERS = /(?:gegen|auf|für|an)\s+(?:d(?:ie|en|as|er|em)\s+)?/i;

  // ═══════════════════════════════════════════════════════
  // SCHNITT 3: MECHANIK
  // Welcher psychologische Hebel wird genutzt?
  // ═══════════════════════════════════════════════════════

  const MECHANISMS = [
    {
      id: 'ANGST',
      label: 'Angstverstärkung',
      shortLabel: 'Angst',
      patterns: [
        /gefahr/i, /bedroh/i, /risiko/i, /alarm/i, /warnung/i,
        /krise/i, /droht/i, /eskalation/i, /zusammenbruch/i,
        /chaos/i, /terror/i, /anschlag/i, /panik/i, /unsicherheit/i,
      ],
    },
    {
      id: 'ZEITDRUCK',
      label: 'Zeitdruck',
      shortLabel: 'Zeitdruck',
      patterns: [
        /dringend/i, /sofort/i, /schnell\s+handeln/i, /daher\s+müsse/i,
        /\bfrist/i, /ultimat/i, /bevorstehend/i, /unverzüglich/i,
        /alternativlos/i, /schnellstmöglich/i, /muss\s+jetzt/i,
        /vor\s+dem\s+hintergrund/i,
      ],
    },
    {
      id: 'AUTORITAET',
      label: 'Autoritätsargument',
      shortLabel: 'Autorität',
      patterns: [
        /expert\w*/i, /wissenschaft\w*/i, /studie\w*/i, /analyse\w*/i,
        /nach\s+angaben/i, /behörd/i, /ministerium/i,
      ],
    },
    {
      id: 'DRUCK',
      label: 'Politischer Druck',
      shortLabel: 'politischer Druck',
      patterns: [
        /auf\s+druck/i, /unter\s+druck/i, /druck\s+(?:von|des|der|aus)/i,
        /nötig\w*\s+(?:von|durch)/i, /erpressung/i,
        /(?:zwing|gezwungen|genötigt)/i, /nachgeben/i,
        /(?:dräng|gedrängt)\w*/i, /massiv\s+auf\s+/i,
      ],
    },
    {
      id: 'FEINDBILD',
      label: 'Feindbildkonstruktion',
      shortLabel: 'Feindbild',
      patterns: [
        /regime/i, /terrorist/i, /extremist/i, /aggressor/i,
        /\bfeind/i, /diktator/i, /despot/i, /propaganda/i,
        /radikali/i, /fanatik/i, /islamist/i, /populist/i,
      ],
    },
    {
      id: 'GRUPPENDRUCK',
      label: 'Gruppenbildung',
      shortLabel: 'Gruppendruck',
      patterns: [
        /gemeinsam/i, /solidarität/i, /verbündet/i, /alliiert/i,
        /geschlossen/i, /bündnis/i, /partnerschaft/i, /koalition/i,
        /zusammenstehen/i, /wertegemeinschaft/i,
      ],
    },
    {
      id: 'HOFFNUNG',
      label: 'Hoffnungsnarrativ',
      shortLabel: 'Hoffnung',
      patterns: [
        /chance/i, /hoffnung/i, /lösung/i, /fortschritt/i,
        /reform/i, /wandel/i, /zukunft/i, /aufbau/i, /innovation/i,
        /wiederaufbau/i, /entwicklung/i,
        // Consumer / health promises
        /versprechen/i, /wundermittel/i, /wunderwaffe/i, /geheimtipp/i,
        /durchbruch/i, /revolution(?:är)?/i, /sensation/i,
        /einfache\s+lösung/i, /ohne\s+verzicht/i, /ganz\s+einfach/i,
        /schon\s+(?:nach|in)\s+(?:wenigen|kurzer)/i,
      ],
    },
    {
      id: 'TAEUSCHUNG',
      label: 'Falschversprechen',
      shortLabel: 'Falschversprechen',
      patterns: [
        /wirkungslos/i, /unwirksam/i, /nicht\s+(?:nach)?gewiesen/i, /kein\s+(?:nachweis|beleg|beweis)/i,
        /umstritten/i, /fragwürdig/i, /irreführend/i, /täusch/i,
        /falsch/i, /mythos/i, /märchen/i, /\blüge/i,
        /zu\s+schön.*wahr/i, /keine?\s+wissenschaftliche/i,
        /prüfstand/i, /faktencheck/i, /placebo/i, /scheinwirkung/i,
      ],
    },
    {
      id: 'ALTERNATIVLOSIGKEIT',
      label: 'Alternativlosigkeit',
      shortLabel: 'keine Alternative',
      patterns: [
        /alternativlos/i, /keine\s+(?:andere\s+)?(?:wahl|option|möglichkeit)/i,
        /zwingend/i, /unausweichlich/i, /unvermeidlich/i,
        /\bmuss\b/i, /\bmüsse\b/i, /\bmüssen\b/i,
      ],
    },
    {
      id: 'VERKNAPPUNG',
      label: 'Künstliche Verknappung',
      shortLabel: 'Verknappung',
      patterns: [
        /knapp/i, /mangel/i, /begrenzt/i, /engpass/i,
        /nicht\s+(?:mehr\s+)?genug/i, /knappheit/i, /ausverkauft/i,
      ],
    },
    {
      id: 'SCHULDZUWEISUNG',
      label: 'Schuldzuweisung',
      shortLabel: 'Schuldzuweisung',
      patterns: [
        /schuld/i, /verantwort/i, /versagen/i, /versäum/i,
        /verursach/i, /blockade/i, /obstruktion/i, /verweiger/i,
      ],
    },
    {
      id: 'TAUSCHLOGIK',
      label: 'Tauschlogik',
      shortLabel: 'Tauschhandel',
      patterns: [
        /gegenleistung/i, /gegenzug/i, /tausch/i, /bedingung/i,
        /konditional/i, /verpflichtung/i, /deal/i,
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════
  // ACTION NOMINALIZATION
  // Verb-Kontext → Nominalisiertes Machtkonzept
  // ═══════════════════════════════════════════════════════

  const ACTION_NOUNS = [
    // Military SPENDING patterns (MUST come before generic "Angriff")
    { re: /verteidigungsausgaben\w*\s+(?:steiger|erhöh|hochge|wachsen|gestiegen)/i, noun: 'Aufrüstung' },
    { re: /(?:verteidigungsausgaben|militärausgaben|rüstungsausgaben|verteidigungsetat|rüstungsetat|verteidigungshaushalt)/i, noun: 'Aufrüstung' },
    { re: /(?:aufrüst|nachrüst|hochrüst|bewaffn)\w*/i, noun: 'Aufrüstung' },
    { re: /(?:billionen|milliarden)\w*\s+(?:dollar|euro)\w*\s+(?:für\s+)?verteidigung/i, noun: 'Aufrüstung' },
    // War escalation
    { re: /(?:verstärk|verschärf|intensivier|eskalier)\w*\s*(?:die\s+|den\s+|ihre?\s+)?(?:angriff|krieg|kampf|offensive|beschuss)/i, noun: 'Kriegsverschärfung' },
    { re: /angriff\w*\s+(?:im|in|auf|gegen)\s+\w+\s+(?:noch|weiter|erneut)\b/i, noun: 'Kriegsverschärfung' },
    { re: /(?:verstärk|verschärf|intensivier|eskalier)\w*\s*(?:die\s+|den\s+|ihre?\s+)?(?:druck|sanktion|maßnahme)/i, noun: 'Druckverschärfung' },
    { re: /(?:verstärk|verschärf|intensivier|eskalier)\w*/i, noun: 'Eskalation' },
    // Note: "Angriffskrieg" is context (background), not the article's action → exclude compound
    { re: /(?:attacki?er|bombardier|beschoss|beschieß)\w*/i, noun: 'Angriff' },
    { re: /\bangriff(?!skrieg)\w*/i, noun: 'Angriff' },
    { re: /(?:großangelegt|groß)\w*\s+angriff/i, noun: 'Großangriff' },
    { re: /(?:zerstör|vernicht|ausgeschalt|neutralisier)\w*/i, noun: 'Zerstörung' },
    { re: /(?:Fähigkeit|Kapazität)\w*\s+(?:verlor|zerstör|eingebüß)/i, noun: 'Fähigkeitszerstörung' },
    { re: /(?:Produktionsanlag|Infrastruktur)\w*\s+(?:getroffen|zerstört|anvisiert)/i, noun: 'Infrastrukturzerstörung' },
    { re: /(?:blockier|verweiger|obstruier)\w*/i, noun: 'Blockade' },
    { re: /(?:sanktion|embargo|strafmaßnahm)\w*/i, noun: 'Sanktionierung' },
    { re: /einfrieren\w*\s+(?:von\s+)?(?:vermögen|konten|guthaben)/i, noun: 'Vermögenseinfrierung' },
    { re: /(?:kredit|darlehen|finanzhilfe|milliarden\w*kredit)\b/i, noun: 'Kreditvergabe' },
    { re: /(?:militärhilfe|waffenlieferung|rüstungslieferung)\w*/i, noun: 'Waffenlieferung' },
    { re: /(?:hilfsgelder|hilfspaket|finanzhilfe)\w*/i, noun: 'Finanzhilfe' },
    { re: /bietet?\s+(?:\w+\s+)?(?:expertise|know-?how)/i, noun: 'Wissenstransfer' },
    { re: /(?:waffenruhe|waffenstillstand|feuerpause)/i, noun: 'Waffenstillstand' },
    // Domestic / legislative patterns (before generic verbs)
    { re: /(?:Milliarden|Millionen)[- ]?Paket/i, noun: 'Milliarden-Paket' },
    { re: /Paket\w*\s+(?:für|zum|zur)/i, noun: 'Maßnahmenpaket' },
    // SPECIFIC surveillance/security legislation BEFORE generic Gesetzgebung
    { re: /Gesetz\w*\s+(?:zur?|für)\s+(?:\w+\s+)?(?:Überwachung|Kontrolle|Sicherheit)/i, noun: 'Überwachungsgesetz' },
    { re: /(?:überwach|spionier|abhör)\w*\s*(?:gesetz|verordnung|richtlinie|paket|programm)/i, noun: 'Überwachungsgesetz' },
    { re: /(?:Gesetz|Gesetzentwurf|Verordnung)\w*\s+(?:zur?|für|über)/i, noun: 'Gesetzgebung' },
    { re: /(?:überwach|spionier|abhör)\w*/i, noun: 'Überwachungsausbau' },
    { re: /(?:wahlen?|abstimmung|referendum)/i, noun: 'Wahl' },
    { re: /(?:reform|umstrukturier|liberalisier)/i, noun: 'Reform' },
    { re: /(?:stationie|entsen|aufmarsch|mobilisier)\w*/i, noun: 'Truppenmobilisierung' },
    // Consumer / health / commercial patterns
    { re: /(?:daten\w*\s+)?(?:sammel|erheb|erfass)\w*\s+(?:\w+\s+)?(?:daten|nutzer)/i, noun: 'Datensammlung' },
    { re: /(?:sammelt?|erhebt?|erfasst?)\s+(?:\w+\s+)?(?:nutzerdaten|daten)\b/i, noun: 'Datensammlung' },
    { re: /(?:wundermittel|wunderwaffe|wunderpille|wunderdiät)/i, noun: 'Heilsversprechen' },
    { re: /(?:nahrungsergänzungsmittel|supplement|präparat)\w*/i, noun: 'Produktvermarktung' },
    { re: /(?:fettblocker|fatburner|appetitzügler|diätpille)\w*/i, noun: 'Heilsversprechen' },
    { re: /(?:abnehm|diät|schlank)\w*\s*(?:tipp|trick|methode|kur|programm|mittel)/i, noun: 'Heilsversprechen' },
    { re: /versprechen?\s+(?:\w+\s+){0,3}(?:abnehm|gewicht|schlank|gesund|heilung)/i, noun: 'Heilsversprechen' },
    { re: /(?:wirkungslos|unwirksam|nicht\s+nachgewiesen)/i, noun: 'Falschversprechen' },
    { re: /faktencheck/i, noun: 'Faktenprüfung' },
    { re: /(?:vermarkt|bewerb|verkauf)\w*\s+(?:\w+\s+)?(?:produkt|mittel|pille|kur)/i, noun: 'Produktvermarktung' },
    // Generic verb-based (last resort)
    { re: /(?:forder|verlang|dräng)\w*/i, noun: 'Forderung' },
    { re: /(?:verhandl|vereinbar|abkommen)/i, noun: 'Verhandlung' },
    { re: /(?:kündigte?\s+an|ankündig|angekündigt)/i, noun: 'Ankündigung' },
    { re: /\bplant?\s+(?:ein|neue|den|die|das)/i, noun: 'Vorhaben' },
  ];

  // ═══════════════════════════════════════════════════════
  // CONTEXT / PURPOSE EXTRACTION
  // ═══════════════════════════════════════════════════════

  const CONTEXT_RE = [
    { re: /vor\s+dem\s+Hintergrund\s+(?:einer?\s+)?(?:möglicherweise\s+)?(?:bevorstehenden?\s+)?(.{10,100})/i, prep: 'vor' },
    { re: /um\s+(.{10,80}?)\s+zu\s+(\w+)/i, prep: 'um_zu' },
    { re: /als\s+Gegenleistung\s+(?:für\s+)?(.{5,60})/i, prep: 'gegen' },
    { re: /im\s+Gegenzug\s+(?:für\s+)?(.{5,60})/i, prep: 'gegen' },
    { re: /(?:damit|sodass)\s+(.{10,80})/i, prep: 'damit' },
    { re: /(?:weil|da)\s+(.{10,80})/i, prep: 'weil' },
    { re: /(?:europäische|westliche)?\s*(?:Hilfsgelder|Hilfe|Unterstützung)\w*\s+(?:derzeit\s+)?(?:blockiert|eingefroren|ausgesetzt)/i, prep: 'bei_blockade' },
  ];

  // ═══════════════════════════════════════════════════════
  // ENGINE CLASS
  // ═══════════════════════════════════════════════════════

  class DiamondGefrierpunkt {

    /**
     * Main: text → { text, category, resource, mechanism, strategy }
     * For backward compat, toString() returns just the text.
     */
    extract(text, matches) {
      if (!text || text.length < 50) return { text: '', category: null, resource: null, mechanism: null, strategy: null };

      const clean = this._strip(text);

      // Die 3 Schnitte
      const resource    = this._cutResource(text);
      const actors      = this._extractActors(text);
      const beneficiary = this._cutBeneficiary(text, actors);
      const mechanism   = this._cutMechanism(text);

      // Context / purpose
      const context = this._extractContext(text);

      // Nominalized action
      const action = this._extractAction(clean, text);

      // Classify domain/category
      const category = this._classifyDomain(resource, mechanism, actors, action, text);

      // Compose
      const result = this._compose(action, resource, beneficiary, mechanism, context, actors, text);

      return {
        text: result,
        category: category,
        resource: resource.length > 0 ? resource[0] : null,
        mechanism: mechanism.length > 0 ? mechanism[0] : null,
        strategy: this._lastStrategy || null,
        toString() { return this.text; }
      };
    }

    /**
     * Classify the article domain based on detected signals
     */
    _classifyDomain(resources, mechanisms, actors, action, rawText) {
      const resIds = resources.map(r => r.id);
      const mechIds = mechanisms.map(m => m.id);
      const hasStateActors = actors.some(a => !['Regierung', 'Ministerium', 'Innenministerium', 'Sicherheitsbehörden', 'Industrie', 'Wirtschaft', 'Opposition', 'Experten', 'Bürgerrechtler', 'Gewerkschaften', 'Pharma', 'Tech-Konzerne', 'Konzerne', 'Hersteller', 'Anbieter', 'Supplement-Industrie', 'Diätindustrie', 'Influencer', 'Werbeindustrie', 'Lobby', 'Finanzsektor', 'Rüstungsindustrie', 'Versicherungen', 'Lebensmittelindustrie'].includes(a.short));

      // GEOPOLITIK: state actors + military/territorial resources
      if (hasStateActors && (resIds.includes('WAFFEN') || resIds.includes('TERRITORIUM') || resIds.includes('LEBEN'))) {
        return { id: 'GEOPOLITIK', label: 'Geopolitik & Konflikt', icon: '⚔' };
      }

      // INNENPOLITIK: government actors + domestic policy signals
      const govActors = ['Regierung', 'Ministerium', 'Innenministerium', 'Sicherheitsbehörden'];
      const hasGovActor = actors.some(a => govActors.includes(a.short));
      if (hasGovActor && (resIds.includes('FREIHEIT') || resIds.includes('GELD') || resIds.includes('DATEN'))) {
        return { id: 'INNENPOLITIK', label: 'Innenpolitik & Gesetzgebung', icon: '🏛' };
      }

      // WIRTSCHAFT: trade, sanctions, financial flows between states
      if (hasStateActors && (resIds.includes('GELD') || resIds.includes('ENERGIE') || mechIds.includes('TAUSCHLOGIK'))) {
        return { id: 'WIRTSCHAFT', label: 'Wirtschaft & Handel', icon: '💰' };
      }

      // GESUNDHEIT: health resource or health-related actions
      if (resIds.includes('GESUNDHEIT')) {
        return { id: 'GESUNDHEIT', label: 'Gesundheit & Konsum', icon: '💊' };
      }

      // DIGITAL: data, surveillance, tech
      if (resIds.includes('DATEN') || /\b(?:meta|google|facebook|amazon|apple|microsoft|tiktok|algorithmus|plattform)\b/i.test(rawText)) {
        return { id: 'DIGITAL', label: 'Digitales & Datenschutz', icon: '🔒' };
      }

      // KLIMA: energy, climate policy
      if (resIds.includes('ENERGIE') || /klima|umwelt|emission|co2|nachhaltig/i.test(rawText)) {
        return { id: 'KLIMA', label: 'Klima & Energie', icon: '🌍' };
      }

      // GESELLSCHAFT: attention, public opinion, narrative control
      if (resIds.includes('AUFMERKSAMKEIT') || mechIds.includes('GRUPPENDRUCK') || mechIds.includes('FEINDBILD')) {
        return { id: 'GESELLSCHAFT', label: 'Gesellschaft & Narrativ', icon: '📢' };
      }

      // Fallback
      if (hasStateActors) {
        return { id: 'GEOPOLITIK', label: 'Geopolitik & Konflikt', icon: '⚔' };
      }
      if (hasGovActor) {
        return { id: 'INNENPOLITIK', label: 'Innenpolitik & Gesetzgebung', icon: '🏛' };
      }

      return { id: 'ALLGEMEIN', label: 'Allgemein', icon: '◆' };
    }

    // ─── STRIP ───

    _strip(text) {
      let t = text;
      for (const re of STRIP_PATTERNS) {
        t = t.replace(re, ' ');
      }
      return t.replace(/\s{2,}/g, ' ').trim();
    }

    // ─── SCHNITT 1: RESSOURCE ───

    _cutResource(text) {
      const scores = [];
      const lower = text.toLowerCase();

      for (const res of RESOURCES) {
        let score = 0;
        for (const pat of res.patterns) {
          const matches = lower.match(new RegExp(pat.source, 'gi'));
          if (matches) score += matches.length;
        }
        if (score > 0) {
          scores.push({ ...res, score });
        }
      }

      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, 2); // top 2 resources
    }

    // ─── SCHNITT 2: PROFITEUR ───

    _extractActors(text) {
      const found = [];
      const seen = new Set();

      // Named phrases first
      const lower = text.toLowerCase();
      for (const [phrase, short] of Object.entries(ACTOR_SIMPLIFY)) {
        if (lower.includes(phrase) && !seen.has(short)) {
          found.push({ name: phrase, short });
          seen.add(short);
        }
      }

      // Regex country/org names
      for (const re of ACTOR_REGEX) {
        let m;
        const rx = new RegExp(re.source, re.flags);
        while ((m = rx.exec(text)) !== null) {
          const name = m[1] || m[0];
          if (!seen.has(name)) {
            found.push({ name, short: name });
            seen.add(name);
          }
        }
      }

      // Leaders → state
      let lm;
      const lrx = new RegExp(LEADER_RE.source, LEADER_RE.flags);
      while ((lm = lrx.exec(text)) !== null) {
        const fullName = lm[1];
        const parts = fullName.toLowerCase().split(/\s+/);
        for (const part of parts) {
          if (LEADER_TO_STATE[part] && !seen.has(LEADER_TO_STATE[part])) {
            found.push({ name: fullName, short: LEADER_TO_STATE[part] });
            seen.add(LEADER_TO_STATE[part]);
            break;
          }
        }
      }

      // Adjective-based actor detection ("russischen", "amerikanischen", etc.)
      const ADJ_TO_STATE = {
        'russisch': 'Russland', 'amerikanisch': 'USA', 'chinesisch': 'China',
        'iranisch': 'Iran', 'israelisch': 'Israel', 'ukrainisch': 'Ukraine',
        'türkisch': 'Türkei', 'französisch': 'Frankreich', 'britisch': 'Großbritannien',
        'deutsch': 'Deutschland', 'europäisch': 'EU', 'saudisch': 'Saudi-Arabien',
        'nordkoreanisch': 'Nordkorea',
      };
      for (const [adj, state] of Object.entries(ADJ_TO_STATE)) {
        if (lower.includes(adj) && !seen.has(state)) {
          found.push({ name: adj, short: state });
          seen.add(state);
        }
      }

      // Generic institutional actors (fallback when no states found)
      for (const ga of GENERIC_ACTORS) {
        const gm = text.match(ga.re);
        if (gm && !seen.has(ga.short)) {
          found.push({ name: gm[0], short: ga.short });
          seen.add(ga.short);
        }
      }

      return found;
    }

    _cutBeneficiary(text, actors) {
      if (actors.length === 0) return null;

      // Find actor with AGENCY EARLIEST in the text (= likely the main subject)
      let earliest = null;
      let earliestIdx = Infinity;

      for (const actor of actors) {
        const names = [actor.short, actor.name];
        for (const name of names) {
          const idx = text.toLowerCase().indexOf(name.toLowerCase());
          if (idx === -1) continue;
          const after = text.substring(idx, Math.min(idx + name.length + 120, text.length));
          if (AGENCY_VERBS.test(after) && idx < earliestIdx) {
            earliestIdx = idx;
            earliest = actor;
          }
        }
      }

      if (earliest) return { primary: earliest, role: 'initiator' };

      // Fallback: first actor is the initiator
      return { primary: actors[0], role: 'initiator' };
    }

    // ─── SCHNITT 3: MECHANIK ───

    _cutMechanism(text) {
      const scores = [];
      const lower = text.toLowerCase();

      for (const mech of MECHANISMS) {
        let score = 0;
        for (const pat of mech.patterns) {
          const matches = lower.match(new RegExp(pat.source, 'gi'));
          if (matches) score += matches.length;
        }
        if (score > 0) {
          scores.push({ ...mech, score });
        }
      }

      scores.sort((a, b) => b.score - a.score);
      return scores.slice(0, 2); // top 2 mechanisms
    }

    // ─── CONTEXT ───

    _extractContext(text) {
      for (const ctx of CONTEXT_RE) {
        const m = text.match(ctx.re);
        if (m) {
          return { prep: ctx.prep, text: m[1] || m[0] };
        }
      }
      return null;
    }

    // ─── ACTION NOUN ───

    _extractAction(cleanText, rawText) {
      // Try both cleaned and raw text
      // Prefer SPECIFIC patterns (listed earlier in ACTION_NOUNS) over generic ones
      // Among same-specificity, prefer earlier position in text
      const both = cleanText + ' ' + (rawText || '');

      // ACTION_NOUNS is ordered from specific to generic
      // Return the FIRST match from the pattern list (= most specific)
      for (const an of ACTION_NOUNS) {
        if (an.re.test(both)) {
          return an.noun;
        }
      }
      return null;
    }

    // ─── COMPOSE: The frozen sentence ───

    _compose(action, resources, beneficiary, mechanisms, context, actors, rawText) {
      this._lastStrategy = null;
      const parts = [];

      // Primary resource label
      const res = resources.length > 0 ? resources[0] : null;
      // Primary mechanism
      const mech = mechanisms.length > 0 ? mechanisms[0] : null;
      // Primary actor
      const initiator = beneficiary ? beneficiary.primary : null;
      // Second actor (target)
      const target = actors.length >= 2 && initiator
        ? actors.find(a => a.short !== initiator.short) || actors[1]
        : (actors.length >= 2 ? actors[1] : null);

      // Helper to tag strategy before returning
      const out = (strategyName, text) => { this._lastStrategy = strategyName; return this._trim(text); };

      // ── Strategy 1: Action + Mechanism + Context ──
      // Pattern: "{Action} als {Mechanism} vor/für {Context}"
      // Works best for: escalation, sanctions, military
      if (action && mech && context && context.prep === 'vor') {
        const ctxActors = this._extractActors(context.text);
        let deadline = '';

        if (/(?:waffenruhe|waffenstillstand|feuerpause)/i.test(context.text)) {
          const ctxState = ctxActors.length > 0 ? ctxActors[0].short : '';
          const prefix = ctxState === 'USA' ? 'US' : ctxState;
          deadline = prefix ? `${prefix}-Ultimatum` : 'Waffenstillstandsfrist';
        } else {
          deadline = ctxActors.length > 0 ? `${ctxActors[0].short}-Frist` : 'Frist';
        }

        // Determine the "als" label
        let alsLabel = mech.shortLabel;
        if (mech.id === 'ZEITDRUCK' && /(?:erfolge|vorteil|position|verhandl)/i.test(rawText)) {
          alsLabel = 'Verhandlungsmasse';
        }

        return out('Eskalation + Frist', `${action} als ${alsLabel} vor dem ${deadline}.`);
      }

      // ── Strategy 2: Trade/Exchange ──
      // Pattern: "{Actor}-{Resource} als Tauschwert für {Target}-{WantedResource}"
      if (mech && mech.id === 'TAUSCHLOGIK' && actors.length >= 2) {
        const offerer = initiator ? initiator.short : actors[0].short;
        const receiver = target ? target.short : actors[1].short;

        // What's OFFERED (look for "bietet...an", "Expertise", "Know-how")
        let offeredRes = '';
        const offerMatch = rawText.match(/bietet?\s+(.{5,60}?)\s+(?:an|als|zur|für)\b/i);
        if (offerMatch) {
          const offerText = offerMatch[1].toLowerCase();
          if (/drohne/i.test(offerText)) offeredRes = 'Drohnenexpertise';
          else if (/militär/i.test(offerText)) offeredRes = 'Militärexpertise';
          else if (/expertise|know-?how/i.test(offerText)) offeredRes = 'Expertise';
          else offeredRes = this._compressNoun(offerMatch[1]);
        }
        if (!offeredRes && res) offeredRes = this._resourceContextLabel(res, rawText);
        if (!offeredRes) offeredRes = 'Expertise';

        // What's WANTED in return (look for "erhofft sich", "Gegenzug", desired items)
        let wantedRes = '';
        const wantMatch = rawText.match(/(?:Gegenzug|Gegenleistung|erhofft\s+sich)\s+(?:die\s+\w+\s+)?(.{5,80})/i);
        if (wantMatch) {
          const wantText = wantMatch[1].toLowerCase();
          if (/finanz|geld|kapital|milliarden/i.test(wantText)) wantedRes = 'Kapital';
          if (/flugabwehr|luftabwehr|waffensystem/i.test(wantText)) {
            wantedRes = wantedRes ? wantedRes + ' + Waffensysteme' : 'Waffensysteme';
          }
        }
        if (!wantedRes) wantedRes = resources.length > 1 ? resources[1].shortLabels[0] : 'Kapital';

        let result = `${offerer}-${offeredRes} als Tauschwert für ${receiver}-${wantedRes}`;

        // Check for blockade context
        if (context && context.prep === 'bei_blockade') {
          result += ' bei EU-Hilfsstopp';
        }

        return out('Tauschhandel', result + '.');
      }

      // ── Strategy 3: Schuldzuweisung / Blockade ──
      // Pattern: "{Actor}s Blockade als Druckmittel für {Demand}"
      // Trigger on SCHULDZUWEISUNG mechanism OR explicit blockade action
      const hasBlockade = /(?:blockier|verweiger|obstruier)\w*/i.test(rawText);
      if ((mech && mech.id === 'SCHULDZUWEISUNG' || hasBlockade) && initiator) {
        const blockActor = initiator.short;
        const blockTarget = target ? target.short : '';

        // What does the blocker want?
        const fordMatch = rawText.match(/forder\w*\s+(.+?)(?:\.\s|\s*$|,\s)/i);
        const demand = fordMatch ? this._compressNoun(fordMatch[1]) : '';

        let result = action || 'Blockade';
        result += ` durch ${blockActor}`;
        if (blockTarget) result += ` gegen ${blockTarget}`;
        result += ' als Druckmittel';
        if (demand) result += ` für ${demand}`;

        return out('Blockade / Schuldzuweisung', result + '.');
      }

      // ── Strategy 3b: Military Spending / Aufrüstung ──
      // Triggers when: action=Aufrüstung AND GELD+WAFFEN resources AND Rüstungsindustrie present
      // Pattern: "{Actor} transferieren {Amount} {ResLabel} in die Rüstungsindustrie {purpose} unter {Druck}."
      const isAufruestung = action === 'Aufrüstung' && res && res.id === 'GELD';
      const hasRuestungsActor = actors.some(a => a.short === 'Rüstungsindustrie');
      if (isAufruestung && initiator) {
        // Extract amount from text (e.g., "1,63 Billionen Dollar")
        const amountMatch = rawText.match(/(\d[\d,.]*)\s+(Billionen|Milliarden|Millionen)\s+(Dollar|Euro)/i);
        const amount = amountMatch ? `${amountMatch[1]} ${amountMatch[2]} ${amountMatch[3]} ` : '';

        // Resource label — "Steuerkapital" for military spending
        const resLabel = this._resourceContextLabel(res, rawText);

        // Find the pressure source (DRUCK mechanism)
        const hasDruck = mechanisms.some(m => m.id === 'DRUCK');
        // Find who's applying pressure (look for "gedrängt", "Druck von/des")
        let pressureSource = '';
        if (hasDruck) {
          // Look for the state actor closest to the pressure verb
          const druckMatch = rawText.match(/(?:US-Präsident|Präsident)\s+\w+\s+.*?(?:dräng|gedrängt|Druck)/i);
          if (druckMatch) pressureSource = 'US-Druck';
          else {
            const druckActors = actors.filter(a => a.short !== initiator.short && !['Rüstungsindustrie','Experten'].includes(a.short));
            if (druckActors.length > 0) pressureSource = `${druckActors[0].short}-Druck`;
          }
        }

        // Compose: "{Actor} transferieren {Amount}{ResLabel} in Rüstungsindustrie [unter {Druck}]"
        let result = `${initiator.short} transferiert ${amount}${resLabel}`;
        if (hasRuestungsActor) {
          result += ' in die Rüstungsindustrie';
        }
        if (pressureSource) {
          result += ` unter ${pressureSource}`;
        }

        return out('Aufrüstung / Militärausgaben', result + '.');
      }

      // ── Strategy 4: Resource flow (Aid/Sanctions) ──
      // Pattern: "{Action} {Giver}s als {Mechanism} für {Receiver}"
      // Only for inter-state/org flows, NOT for domestic government actions
      const govActorsForS4 = ['Regierung', 'Ministerium', 'Innenministerium', 'Sicherheitsbehörden'];
      const isGovInitiator = initiator && govActorsForS4.includes(initiator.short);
      const isGovTarget = target && govActorsForS4.includes(target.short);
      const isDomesticPolicy = isGovInitiator && (isGovTarget || (target && ['Industrie', 'Wirtschaft', 'Opposition', 'Bürgerrechtler', 'Gewerkschaften', 'Experten'].includes(target.short)));
      if (action && initiator && target && !isDomesticPolicy) {
        let alsLabel = '';

        if (/kredit|hilfe|lieferung|finanzhilfe/i.test(action)) {
          alsLabel = 'Abhängigkeitsinstrument';
        } else if (/sanktion|strangul|einfrierung/i.test(action)) {
          alsLabel = 'Druckmittel';
        } else if (/zerstörung/i.test(action)) {
          alsLabel = mech ? mech.shortLabel : 'Machtdemonstration';
        } else {
          alsLabel = mech ? mech.shortLabel : 'Hebel';
        }

        let result = `${action} ${this._genitive(initiator.short)}`;
        if (/sanktion|strangul|einfrierung|zerstörung|angriff/i.test(action)) {
          result += ` gegen ${target.short}`;
        } else {
          result += ` an ${target.short}`;
        }
        result += ` als ${alsLabel}`;

        return out('Ressourcenfluss', result + '.');
      }

      // ── Strategy 5: Actor + Action + Resource + Mechanism ──
      // Pattern: "{Action} via {Mechanism} – Einsatz: {Resource}"
      // Works for: domestic policy, regulation, reforms
      if (action && initiator && res && mech) {
        // Check if initiator is governmental and there's a counter-actor
        const govActors = ['Regierung', 'Ministerium', 'Innenministerium', 'Sicherheitsbehörden'];
        const isGov = govActors.includes(initiator.short);

        // For government actions: "{Action} via {Mechanism} auf Kosten von {Resource}"
        if (isGov) {
          let mechLabel = mech.shortLabel;
          // Make mechanism more specific if possible
          if (mech.id === 'ANGST' && /terror/i.test(rawText)) mechLabel = 'Terrorangst';
          if (mech.id === 'ANGST' && /klima/i.test(rawText)) mechLabel = 'Klimaangst';
          if (mech.id === 'ZEITDRUCK' && /alternativlos/i.test(rawText)) mechLabel = 'Alternativlosigkeit';

          // Find what's at stake for citizens
          let costRes = res.label;
          if (res.id === 'FREIHEIT' || res.id === 'DATEN') costRes = res.label;
          else if (res.id === 'GELD') costRes = 'Steuergelder';

          return out('Innenpolitik', `${action} via ${mechLabel} auf Kosten ${this._genitive(costRes)}.`);
        }

        if (target) {
          return out('Akteur + Ressource', `${action} ${this._genitive(initiator.short)} via ${mech.shortLabel}. Einsatz: ${res.label}.`);
        }
        return out('Akteur + Ressource', `${action} ${this._genitive(initiator.short)} via ${mech.shortLabel}. Einsatz: ${res.label}.`);
      }

      // ── Strategy 5b: Action + Mechanism ──
      if (action && initiator) {
        let result = `${action} durch ${initiator.short}`;
        if (mech) result += ` via ${mech.shortLabel}`;
        if (res) result += `. Einsatz: ${res.label}`;
        return out('Akteur + Aktion', result + '.');
      }

      // ── Strategy 5c: Consumer/Health/Commercial manipulation ──
      // Pattern: "{Action} via {Mechanism}. Einsatz: {Resource}. Profiteur: {Actor}."
      // Triggers when: health/consumer resource + hope/deception mechanism, OR commercial actor
      const isConsumerDomain = res && ['GESUNDHEIT', 'AUFMERKSAMKEIT'].includes(res.id);
      const isConsumerMech = mech && ['HOFFNUNG', 'TAEUSCHUNG', 'ANGST'].includes(mech.id);
      const commercialActors = ['Konzerne', 'Tech-Konzerne', 'Pharma', 'Supplement-Industrie', 'Diätindustrie', 'Hersteller', 'Anbieter', 'Influencer', 'Werbeindustrie', 'Lebensmittelindustrie', 'Lobby'];
      const isCommercialActor = initiator && commercialActors.includes(initiator.short);
      if (((isConsumerDomain || isConsumerMech) && (action || res)) || (isCommercialActor && isConsumerMech)) {
        let mechLabel = mech ? mech.shortLabel : '';
        // Check if BOTH Hoffnung and Täuschung are present → prefer Täuschung (debunking angle)
        const hasHoffnung = mechanisms.some(m => m.id === 'HOFFNUNG');
        const hasTaeuschung = mechanisms.some(m => m.id === 'TAEUSCHUNG');
        if (hasTaeuschung && /faktencheck|prüfstand/i.test(rawText)) {
          mechLabel = 'unbelegte Wirkversprechen';
        } else if (hasTaeuschung) {
          mechLabel = 'Falschversprechen';
        } else if (mech && mech.id === 'HOFFNUNG' && /versprechen|wundermittel|ohne\s+verzicht/i.test(rawText)) {
          mechLabel = 'Heilsversprechen';
        }

        // Try to identify the profiteer (use commercial actor if available)
        let profiteur = isCommercialActor ? initiator.short : (initiator ? initiator.short : '');
        if (!profiteur) {
          if (/nahrungsergänzung|supplement|formoline|hersteller/i.test(rawText)) profiteur = 'Supplement-Industrie';
          else if (/pharma/i.test(rawText)) profiteur = 'Pharma';
          else if (/diät|abnehm/i.test(rawText)) profiteur = 'Diätindustrie';
          else if (/\b(?:meta|google|facebook|amazon|apple|microsoft|tiktok)\b/i.test(rawText)) profiteur = 'Tech-Konzerne';
          else if (/konzern|unternehmen|plattform/i.test(rawText)) profiteur = 'Konzerne';
          else if (/versicherung/i.test(rawText)) profiteur = 'Versicherungen';
        }

        let result = action || 'Vermarktung';
        // Avoid redundancy: if action == mechLabel, use "via" with resource context instead
        if (mechLabel && mechLabel !== result) {
          result += ` via ${mechLabel}`;
        } else if (mechLabel && mechLabel === result && mech) {
          // Action IS the mechanism — use the raw mechanism label instead
          result += ` via ${mech.shortLabel}`;
        }
        if (res) result += `. Einsatz: ${res.label}`;
        if (profiteur) result += `. Profiteur: ${profiteur}`;

        return out('Konsum / Kommerz', result + '.');
      }

      // ── Strategy 6: Resource + Mechanism (no action/actor) ──
      if (res && mech) {
        let result = `Einsatz: ${res.label}. Hebel: ${mech.shortLabel}`;
        if (initiator) result += `. Profiteur: ${initiator.short}`;
        return out('Ressource + Mechanik', result + '.');
      }

      // ── Fallback: mechanical headline ──
      this._lastStrategy = 'Fallback';
      return this._fallback(rawText, actors, action);
    }

    _fallback(text, actors, action) {
      // Build from whatever we have
      if (action && actors.length > 0) {
        const names = actors.slice(0, 2).map(a => a.short);
        return this._trim(`${action}: ${names.join(' vs. ')}.`);
      }

      // Ultra-fallback: first sentence, stripped
      const first = text.split(/[.!?]/)[0] || '';
      let stripped = first
        .replace(/\b(?:der|die|das|den|dem|des|ein\w*)\b/gi, '')
        .replace(/\b(?:hat|haben|ist|sind|war|wird|werden|wurde|sich|heute|gestern)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (stripped.length > 60) stripped = stripped.substring(0, 60).replace(/\s\S*$/, '');
      return stripped ? stripped + '.' : '';
    }

    // ─── HELPERS ───

    _genitive(name) {
      // German genitive for various noun types
      // Feminine/plural: "der" + name
      const derGenitive = /^(?:Regierung|Industrie|Wirtschaft|Opposition|EU|NATO|UNO|USA|Bevölkerung|Grundrechte|Freiheit|Privatsphäre|Daten|Steuergelder|öffentliche)$/i;
      const desGenitive = /^(?:Innenministerium|Ministerium|Kapital|Territorium|Finanzsektor)$/i;

      if (derGenitive.test(name)) return `der ${name}`;
      if (desGenitive.test(name)) return `des ${name}s`;
      if (/^(?:Sicherheitsbehörden|Experten|Bürgerrechtler|Gewerkschaften|Tech-Konzerne|Konzerne|Versicherungen)$/.test(name)) return `der ${name}`;

      // Country names get -s genitive (no article)
      if (/^[A-ZÄÖÜ]/.test(name)) return `${name}s`;
      return name;
    }

    _trim(text) {
      let t = text.replace(/\s{2,}/g, ' ').replace(/\.+$/, '.').trim();
      // Enforce 15-word max
      const words = t.replace(/\.$/, '').split(/\s+/);
      if (words.length > 15) {
        t = words.slice(0, 15).join(' ') + '.';
      }
      return t;
    }

    _compressNoun(text) {
      return text
        .replace(/\b(?:der|die|das|den|dem|des|ein\w*|kein\w*)\b/gi, '')
        .replace(/\b(?:neue[nrs]?|weitere[nrs]?|bisherige[nrs]?)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    _resourceContextLabel(resource, text) {
      // Make the resource label more specific based on context
      if (resource.id === 'WAFFEN') {
        if (/drohne/i.test(text)) return 'Drohnenexpertise';
        if (/rakete/i.test(text)) return 'Raketenkapazität';
        if (/luftabwehr|flugabwehr/i.test(text)) return 'Luftabwehrexpertise';
        return 'Militärexpertise';
      }
      if (resource.id === 'GELD') {
        if (/verteidigungsausgab|militärausgab|rüstungsausgab/i.test(text)) return 'Steuerkapital';
        if (/kredit/i.test(text)) return 'Kredit';
        if (/hilfsgelder/i.test(text)) return 'Hilfsgelder';
        if (/steuer/i.test(text)) return 'Steuergelder';
        return 'Kapital';
      }
      if (resource.id === 'EXPERTISE') {
        if (/militär/i.test(text)) return 'Militärexpertise';
        if (/drohne/i.test(text)) return 'Drohnenexpertise';
        return 'Expertise';
      }
      return resource.shortLabels[0];
    }
  }

  // ═══════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════

  window.DiamondGefrierpunkt = DiamondGefrierpunkt;

})();
