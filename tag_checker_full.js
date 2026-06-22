const fs = require('fs');
const content = fs.readFileSync('WantokWorkforce.js', 'utf8');

const tags = [];
const tagRegex = /<(View|ScrollView|TouchableOpacity|Text|TextInput)\b([\s\S]*?)(\/?)>|<\/(View|ScrollView|TouchableOpacity|Text|TextInput)>/g;
let match;

function getLineInfo(index) {
    const lines = content.substring(0, index).split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

while ((match = tagRegex.exec(content)) !== null) {
    const info = getLineInfo(match.index);

    if (match[0].startsWith('</')) {
        const tagName = match[4];
        if (tags.length === 0) {
            console.log(`Unexpected closing tag </${tagName}> at line ${info.line}`);
            continue;
        }
        const last = tags.pop();
        if (last.name !== tagName) {
            console.log(`Mismatched tag: opened <${last.name}> at line ${last.info.line}, but closed with </${tagName}> at line ${info.line}`);
        }
    } else {
        const tagName = match[1];
        const isSelfClosing = match[3] === '/' || tagName === 'TextInput';
        if (!isSelfClosing) {
            tags.push({ name: tagName, info: info });
        }
    }
}

if (tags.length > 0) {
    console.log('Unclosed tags at end of file:');
    tags.forEach(t => console.log(`  <${t.name}> at line ${t.info.line}`));
} else {
    console.log('All tags balanced!');
}
