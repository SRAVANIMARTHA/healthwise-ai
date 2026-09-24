const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/services/i18n/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts'));

const newKeys = {
  demoAiResponseList1: "Sudden onset high fever (40°C / 104°F)",
  demoAiResponseList2: "Severe headache and pain behind the eyes",
  demoAiResponseList3: "Muscle and joint pains",
  demoAiResponseList4: "Nausea, vomiting, and fatigue",
  quickQuestion2: "How can I prevent diabetes through diet?",
  quickQuestion3: "What vaccines are recommended for adults?",
  quickQuestion4: "When should someone with high blood pressure seek care?",
};

for (const file of files) {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  const insertIndex = content.indexOf('faqBadge:');
  if (insertIndex > -1) {
    let injection = '';
    for (const [k, v] of Object.entries(newKeys)) {
      if (!content.includes(`"${k}":`) && !content.includes(`'${k}':`)) {
        injection += `    "${k}": "${v}",\n`;
      }
    }
    if (injection) {
      content = content.slice(0, insertIndex) + injection + content.slice(insertIndex);
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
}
