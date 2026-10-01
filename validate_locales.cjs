import * as fs from 'fs';
import * as path from 'path';

// Using ts-node or similar to parse if possible, or just string regex.
// We can just read the JSON files we generated, but wait, we generated TS files.
// Let's write a python script or just read the english JSON.

const en = JSON.parse(fs.readFileSync('en.json', 'utf8'));

const localesDir = path.join(__dirname, 'src/services/i18n/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

let allPassed = true;

for (const file of files) {
    const lang = file.replace('.ts', '');
    const content = fs.readFileSync(path.join(localesDir, file), 'utf8');
    
    // Quick regex to extract JSON
    const match = content.match(/export const \w+: TranslationDictionary = (\{[\s\S]+\});/);
    if (!match) {
        console.error(`❌ ${file}: Could not parse dictionary object`);
        allPassed = false;
        continue;
    }
    
    try {
        const dict = JSON.parse(match[1]);
        
        let missingKeys = 0;
        for (const [section, keys] of Object.entries(en)) {
            if (!dict[section]) {
                console.error(`❌ ${file}: Missing section '${section}'`);
                missingKeys++;
                allPassed = false;
                continue;
            }
            
            for (const key of Object.keys(keys)) {
                if (dict[section][key] === undefined) {
                    console.error(`❌ ${file}: Missing key '${section}.${key}'`);
                    missingKeys++;
                    allPassed = false;
                }
            }
        }
        
        if (missingKeys === 0) {
            console.log(`✅ ${file} is 100% complete.`);
        }
    } catch (e) {
        console.error(`❌ ${file}: Invalid JSON format in TS file.`, e.message);
        allPassed = false;
    }
}

if (allPassed) {
    console.log('\n🌟 ALL LANGUAGES PASSED: 100% Key Coverage Confirmed.');
    process.exit(0);
} else {
    console.log('\n⚠️ SOME LANGUAGES FAILED VALIDATION.');
    process.exit(1);
}
