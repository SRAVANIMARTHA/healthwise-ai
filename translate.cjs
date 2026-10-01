const fs = require('fs');

const TARGET_LANGS = ['hi','te','ta','bn','kn','ml','mr','gu','pa','ur','or','es','fr','de','ar','pt','ru','ja','ko','zh-CN','zh-TW'];

async function translateText(text, targetLang) {
    // A quick hack using google translate web API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.error("Error translating:", text, e);
        return text;
    }
}

async function run() {
    const data = JSON.parse(fs.readFileSync('en.json', 'utf8'));
    
    for (const lang of TARGET_LANGS) {
        const out_file = `src/services/i18n/locales/${lang}.ts`;
        console.log(`Translating for ${lang}...`);
        
        let translated_data = {};
        for (const section in data) {
            translated_data[section] = {};
            for (const key in data[section]) {
                const text = data[section][key];
                if (typeof text === 'string' && text.length > 0) {
                    translated_data[section][key] = await translateText(text, lang);
                    await new Promise(r => setTimeout(r, 150)); // rate limit
                } else {
                    translated_data[section][key] = text;
                }
            }
        }
        
        const ts_content = `import { TranslationDictionary } from '../translations';\n\nexport const ${lang.replace('-', '_')}: TranslationDictionary = ${JSON.stringify(translated_data, null, 2)};\n`;
        fs.writeFileSync(out_file, ts_content, 'utf8');
        console.log(`Saved ${out_file}`);
    }
}

run();
