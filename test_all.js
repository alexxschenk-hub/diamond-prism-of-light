/**
 * Comprehensive Test Suite for DIAMOND Gefrierpunkt Engine
 * Tests all article categories and edge cases
 */

// Load gefrierpunkt.js in Node context
const fs = require('fs');
const vm = require('vm');

// Load the engine source
const src = fs.readFileSync(__dirname + '/gefrierpunkt.js', 'utf8');

// Create a mock window context
const context = { window: {}, console };
vm.createContext(context);
vm.runInContext(src, context);

const GfpClass = context.window.DiamondGefrierpunkt;
if (!GfpClass) {
  console.error('ERROR: DiamondGefrierpunkt class not found on window');
  process.exit(1);
}
const gfp = new GfpClass();

let pass = 0, fail = 0;

function test(name, text, checks) {
  const result = gfp.extract(text, null);
  const errors = [];

  for (const [key, check] of Object.entries(checks)) {
    if (typeof check === 'function') {
      if (!check(result)) {
        errors.push(`  ${key}: FAILED (got: ${JSON.stringify(result[key] || result.text)})`);
      }
    } else if (key === 'textContains') {
      const terms = Array.isArray(check) ? check : [check];
      for (const term of terms) {
        if (!result.text.includes(term)) {
          errors.push(`  text should contain "${term}" but got: "${result.text}"`);
        }
      }
    } else if (key === 'textNotContains') {
      const terms = Array.isArray(check) ? check : [check];
      for (const term of terms) {
        if (result.text.includes(term)) {
          errors.push(`  text should NOT contain "${term}" but got: "${result.text}"`);
        }
      }
    } else if (key === 'categoryId') {
      if (!result.category || result.category.id !== check) {
        errors.push(`  category: expected "${check}" got "${result.category ? result.category.id : 'null'}"`);
      }
    }
  }

  if (errors.length > 0) {
    fail++;
    console.log(`❌ ${name}`);
    console.log(`   Output: "${result.text}"`);
    console.log(`   Category: ${result.category ? result.category.id : 'null'} | Resource: ${result.resource ? result.resource.id : 'null'} | Mechanism: ${result.mechanism ? result.mechanism.id : 'null'} | Strategy: ${result.strategy}`);
    for (const e of errors) console.log(e);
  } else {
    pass++;
    console.log(`✅ ${name}`);
    console.log(`   "${result.text}" [${result.category ? result.category.id : '?'}]`);
  }
}

console.log('═══════════════════════════════════════');
console.log('  DIAMOND Gefrierpunkt Test Suite');
console.log('═══════════════════════════════════════\n');

// ─── TEST 1: Israel-Iran Conflict ───
test('Israel-Iran Konflikt',
  `Israel hat den iranischen Hafen Bandar Abbas mit einer Großoffensive angegriffen. Israelische Kampfjets bombardierten Hafenanlagen und Ölterminale. Nach Angaben iranischer Behörden wurden mindestens 15 Zivilisten getötet. Die USA warnen vor einer Eskalation des Konflikts. Experten befürchten eine Gefahr für die gesamte Region.`,
  {
    textContains: ['Israel'],
    textNotContains: ['Gesetzgebung'],
    categoryId: 'GEOPOLITIK',
  }
);

// ─── TEST 2: Ukraine-Golf Tausch ───
test('Ukraine-Golfstaaten Tauschhandel',
  `Die Ukraine bietet den Golfstaaten Drohnenexpertise und militärisches Know-how an. Im Gegenzug erhofft sich Kiew Finanzhilfen und Luftabwehrsysteme. Der Deal könnte die westliche Hilfsblockade teilweise kompensieren. Das Angebot umfasst auch die Ausbildung von Militärpersonal.`,
  {
    textContains: ['Ukraine'],
    categoryId: 'GEOPOLITIK',
  }
);

// ─── TEST 3: EU-Sanktionen ───
test('EU-Sanktionen gegen Russland',
  `Die EU hat neue Sanktionen gegen Russland verhängt. Europäische Banken dürfen keine Kredite mehr an russische Unternehmen vergeben. Das Einfrieren russischer Vermögenswerte im Wert von 300 Milliarden Euro wurde beschlossen. Die Maßnahmen zielen auf den Finanzsektor und die Energiebranche. Russland droht mit Vergeltungsmaßnahmen.`,
  {
    textContains: ['Sanktion'],
    categoryId: (r) => r.category && ['GEOPOLITIK','WIRTSCHAFT'].includes(r.category.id),
  }
);

// ─── TEST 4: Hilfsgelder/Finanzhilfe ───
test('Milliarden-Hilfspaket',
  `Deutschland hat ein Hilfspaket von 2 Milliarden Euro für die Ukraine beschlossen. Die Finanzhilfe umfasst militärische Ausrüstung und humanitäre Unterstützung. Kanzler Scholz betonte die Notwendigkeit der Solidarität. Die Hilfsgelder sollen vor allem für Luftabwehrsysteme verwendet werden.`,
  {
    textContains: ['Deutschland'],
    categoryId: 'GEOPOLITIK',
  }
);

// ─── TEST 5: Blockade ───
test('Orbáns EU-Blockade',
  `Ungarns Premierminister Orbán blockiert erneut die EU-Hilfen für die Ukraine. Ungarn fordert die Freigabe von eingefrorenen EU-Geldern als Gegenleistung. Die anderen EU-Staaten verurteilen die Obstruktion. Orbán verweigert seine Zustimmung zum 50-Milliarden-Euro-Paket.`,
  {
    textContains: ['Blockade'],
    categoryId: (r) => r.category && ['GEOPOLITIK','WIRTSCHAFT'].includes(r.category.id),
  }
);

// ─── TEST 6: Klima/Energie ───
test('Klimapolitik',
  `Die Bundesregierung verschärft die Klimaziele. Bis 2030 sollen die CO2-Emissionen um 65 Prozent gesenkt werden. Die Industrie warnt vor den Kosten der Energiewende. Umweltschützer fordern noch strengere Maßnahmen. Der Kohleausstieg wird auf 2030 vorgezogen.`,
  {
    categoryId: (r) => r.category && ['KLIMA','INNENPOLITIK'].includes(r.category.id),
  }
);

// ─── TEST 7: Überwachung ───
test('Überwachungsgesetz',
  `Die Regierung plant ein neues Gesetz zur digitalen Überwachung. Das Überwachungspaket erlaubt den Zugriff auf verschlüsselte Nachrichten. Bürgerrechtler warnen vor einem Eingriff in die Privatsphäre. Das Innenministerium rechtfertigt die Maßnahme mit der Terrorbekämpfung. Die Unverletzlichkeit der persönlichen Kommunikation sei nicht mehr gewährleistet.`,
  {
    textContains: ['Überwachung'],
    textNotContains: ['Iran', 'Israel'],
    categoryId: 'INNENPOLITIK',
  }
);

// ─── TEST 8: Abnehmtipps / Gesundheit ───
test('Abnehmtipps / Gesundheit',
  `Fettblocker wie Formoline L112 versprechen einfaches Abnehmen ohne Verzicht. Die Nahrungsergänzungsmittel sollen Fett im Darm binden und die Kalorienaufnahme reduzieren. Experten warnen: Die Wirkung sei wissenschaftlich nicht nachgewiesen. Hersteller bewerben die Produkte trotzdem als Wundermittel. Die Diätindustrie verdient Milliarden an solchen Versprechen.`,
  {
    textNotContains: ['Iran', 'Israel', 'NATO'],
    categoryId: 'GESUNDHEIT',
  }
);

// ─── TEST 9: Tech / Daten ───
test('Tech-Daten / Digitales',
  `Meta sammelt umfangreiche Nutzerdaten über seine Plattformen Facebook und Instagram. Der Konzern personalisiert Werbung basierend auf Algorithmen und Tracking. Datenschützer kritisieren die Datenerhebung als unverhältnismäßig. Die EU prüft strengere Regulierung der Datensammlung. Nutzer haben kaum Kontrolle über ihre persönlichen Daten.`,
  {
    textNotContains: ['Iran', 'Israel'],
    categoryId: 'DIGITAL',
  }
);

// ─── TEST 10: NATO Verteidigungsausgaben ───
const NATO_TEXT = `Die NATO-Mitglieder haben ihre Verteidigungsausgaben auf 1,63 Billionen Dollar gesteigert. Erstmals erreichen 23 der 32 Bündnispartner das Zwei-Prozent-Ziel beim Anteil der Verteidigungsausgaben am Bruttoinlandsprodukt. Die europäischen NATO-Staaten und Kanada steigerten ihre Verteidigungsausgaben im Jahresvergleich um 17,1 Prozent. Zuvor hatte US-Präsident Trump massiv auf eine stärkere Aufrüstung der europäischen Bündnispartner gedrängt. Polen ist mit 4,7 Prozent des BIP Spitzenreiter bei den Verteidigungsausgaben. Das NATO-Ziel von zwei Prozent des BIP für Verteidigung wird zunehmend als Untergrenze gesehen. Die Rüstungsindustrie profitiert erheblich von der Ausgabensteigerung.`;

test('NATO Verteidigungsausgaben',
  NATO_TEXT,
  {
    textContains: ['Steuerkapital', 'Rüstungsindustrie'],
    textNotContains: ['Angriff', 'Gesetzgebung', 'Iran'],
    categoryId: (r) => r.category && ['GEOPOLITIK','WIRTSCHAFT'].includes(r.category.id),
  }
);

// ─── TEST 11: NATO article - detailed check ───
test('NATO - Resource should be GELD/WAFFEN',
  NATO_TEXT,
  {
    categoryId: (r) => {
      const result = gfp.extract(NATO_TEXT, null);
      const isGeldOrWaffen = result.resource && ['GELD', 'WAFFEN'].includes(result.resource.id);
      if (!isGeldOrWaffen) console.log(`   Resource: ${result.resource ? result.resource.id : 'null'}`);
      return isGeldOrWaffen;
    },
  }
);

// ─── TEST 12: Strafvollzug (no Iran contamination) ───
test('Strafvollzug (kein Iran)',
  `Österreichs Strafvollzug steht vor großen Herausforderungen. Die Justizministerin plant eine Reform des Maßnahmenvollzugs. Die Kosten für den Strafvollzug steigen jährlich. Experten fordern mehr Therapieplätze für psychisch kranke Häftlinge. Die Überbelegung der Gefängnisse ist ein zunehmendes Problem. Bürgerrechtler kritisieren die Haftbedingungen als unmenschlich.`,
  {
    textNotContains: ['Iran', 'Israel', 'NATO', 'Ukraine'],
    categoryId: (r) => r.category && ['INNENPOLITIK','GESELLSCHAFT','ALLGEMEIN'].includes(r.category.id),
  }
);

// ─── SUMMARY ───
console.log('\n═══════════════════════════════════════');
console.log(`  Results: ${pass} passed, ${fail} failed (${pass + fail} total)`);
console.log('═══════════════════════════════════════');

if (fail > 0) process.exit(1);
