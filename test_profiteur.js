/**
 * Test Suite for DIAMOND Profiteur-Destillat Engine
 */

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/profiteur.js', 'utf8');
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);

const ProfiteurClass = ctx.window.DiamondProfiteur;
if (!ProfiteurClass) {
  console.error('ERROR: DiamondProfiteur class not found');
  process.exit(1);
}
const engine = new ProfiteurClass();

let pass = 0, fail = 0;

function test(name, text, checks) {
  const result = engine.extract(text);
  const errors = [];

  if (checks.minProfiteers && result.profiteers.length < checks.minProfiteers) {
    errors.push(`  Expected at least ${checks.minProfiteers} profiteers, got ${result.profiteers.length}`);
  }
  if (checks.textContains) {
    const terms = Array.isArray(checks.textContains) ? checks.textContains : [checks.textContains];
    for (const term of terms) {
      if (!result.text.includes(term)) {
        errors.push(`  text should contain "${term}"`);
      }
    }
  }
  if (checks.textNotContains) {
    const terms = Array.isArray(checks.textNotContains) ? checks.textNotContains : [checks.textNotContains];
    for (const term of terms) {
      if (result.text.includes(term)) {
        errors.push(`  text should NOT contain "${term}"`);
      }
    }
  }
  if (checks.hasActor) {
    const actors = Array.isArray(checks.hasActor) ? checks.hasActor : [checks.hasActor];
    for (const actor of actors) {
      if (!result.profiteers.some(p => p.actor.includes(actor))) {
        errors.push(`  should have profiteer containing "${actor}" but got: ${result.profiteers.map(p=>p.actor).join(', ')}`);
      }
    }
  }

  if (errors.length > 0) {
    fail++;
    console.log(`\u274C ${name}`);
    console.log(`   Output: "${result.text}"`);
    console.log(`   Profiteers: ${result.profiteers.map(p => `${p.actor} (${p.type}: ${p.gain})`).join(' | ')}`);
    for (const e of errors) console.log(e);
  } else {
    pass++;
    console.log(`\u2705 ${name}`);
    console.log(`   "${result.text}"`);
    console.log(`   [${result.profiteers.map(p => `${p.actor}(${p.type})`).join(', ')}]`);
  }
}

console.log('═══════════════════════════════════════');
console.log('  Profiteur-Destillat Test Suite');
console.log('═══════════════════════════════════════\n');

// ─── TEST 1: IT-Infrastruktur als Angriffsziel ───
test('IT-Infrastruktur Golf (Iran-Angriffe)',
  `Am 1. März am frühen Morgen, also unmittelbar nach dem ersten Angriff der USA und Israels, haben iranische Drohnen zwei Rechenzentren von Amazon Web Services (AWS) in den Vereinigten Arabischen Emiraten und in Bahrain in Brand gesetzt. Die Folge war einer der größten Datenausfälle in der Region – viele Menschen in den beiden Ländern konnten nicht mehr auf ihr Bankkonto zugreifen, Essen bestellen oder ein Taxi rufen. Gerade die Golfstaaten haben in den letzten Jahren stark auf IT und Services gesetzt, auch als Alternative zum Ölgeschäft. In der Region sind viele Rechenzentren ausländischer Firmen entstanden. Große US-amerikanische Tech-Firmen wie Google, Microsoft und OpenAI, aber auch die Familie von US-Präsident Donald Trump selbst, haben in diesen Ländern viel Geld investiert. Man schätzt, dass circa 90 Prozent des Internetverkehrs zwischen Europa und Asien durch die Straße von Hormus durchmüssen. Ziel des Irans ist es, mit diesen Angriffen, einen Keil in die Partnerschaft zwischen den USA und den Ländern auf der Arabischen Halbinsel zu treiben.`,
  {
    minProfiteers: 2,
    hasActor: ['Iran'],
    textContains: ['Iran'],
  }
);

// ─── TEST 2: NATO Verteidigungsausgaben ───
test('NATO Verteidigungsausgaben',
  `Die NATO-Mitglieder haben ihre Verteidigungsausgaben auf 1,63 Billionen Dollar gesteigert. Erstmals erreichen 23 der 32 Bündnispartner das Zwei-Prozent-Ziel beim Anteil der Verteidigungsausgaben am Bruttoinlandsprodukt. Die europäischen NATO-Staaten und Kanada steigerten ihre Verteidigungsausgaben im Jahresvergleich um 17,1 Prozent. Zuvor hatte US-Präsident Trump massiv auf eine stärkere Aufrüstung der europäischen Bündnispartner gedrängt. Polen ist mit 4,7 Prozent des BIP Spitzenreiter bei den Verteidigungsausgaben. Die Rüstungsindustrie profitiert erheblich von der Ausgabensteigerung.`,
  {
    minProfiteers: 2,
    hasActor: ['Rüstungsindustrie'],
  }
);

// ─── TEST 3: EU-Sanktionen ───
test('EU-Sanktionen gegen Russland',
  `Die EU hat neue Sanktionen gegen Russland verhängt. Europäische Banken dürfen keine Kredite mehr an russische Unternehmen vergeben. Das Einfrieren russischer Vermögenswerte im Wert von 300 Milliarden Euro wurde beschlossen. Die Maßnahmen zielen auf den Finanzsektor und die Energiebranche. Russland droht mit Vergeltungsmaßnahmen. China positioniert sich als Handelsalternative für russische Exportgüter.`,
  {
    minProfiteers: 1,
  }
);

// ─── TEST 4: Abnehmtipps / Gesundheit ───
test('Abnehmtipps / Gesundheit',
  `Fettblocker wie Formoline L112 versprechen einfaches Abnehmen ohne Verzicht. Die Nahrungsergänzungsmittel sollen Fett im Darm binden und die Kalorienaufnahme reduzieren. Experten warnen: Die Wirkung sei wissenschaftlich nicht nachgewiesen. Hersteller bewerben die Produkte trotzdem als Wundermittel. Die Diätindustrie verdient Milliarden an solchen Versprechen.`,
  {
    minProfiteers: 1,
    hasActor: ['Supplement'],
  }
);

// ─── TEST 5: Überwachungsgesetz ───
test('Überwachungsgesetz',
  `Die Regierung plant ein neues Gesetz zur digitalen Überwachung. Das Überwachungspaket erlaubt den Zugriff auf verschlüsselte Nachrichten. Bürgerrechtler warnen vor einem Eingriff in die Privatsphäre. Das Innenministerium rechtfertigt die Maßnahme mit der Terrorbekämpfung. Sicherheitsunternehmen profitieren von den staatlichen Aufträgen für Überwachungstechnologie.`,
  {
    minProfiteers: 1,
    textContains: ['Überwachung'],
  }
);

// ─── TEST 6: Israel-Iran Konflikt ───
test('Israel-Iran Konflikt',
  `Israel hat den iranischen Hafen Bandar Abbas mit einer Großoffensive angegriffen. Israelische Kampfjets bombardierten Hafenanlagen und Ölterminale. Nach Angaben iranischer Behörden wurden mindestens 15 Zivilisten getötet. Die USA warnen vor einer Eskalation des Konflikts. Experten befürchten eine Gefahr für die gesamte Region.`,
  {
    minProfiteers: 1,
  }
);

// ─── SUMMARY ───
console.log('\n═══════════════════════════════════════');
console.log(`  Results: ${pass} passed, ${fail} failed (${pass + fail} total)`);
console.log('═══════════════════════════════════════');

if (fail > 0) process.exit(1);
