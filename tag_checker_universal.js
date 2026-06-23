const fs = require('fs');
const content = fs.readFileSync('WantokWorkforce.js', 'utf8');

const stack = [];
const tagRegex = /<(View|ScrollView|TouchableOpacity|Text|TextInput|LinearGradient|SafeAreaView|StatusBar|Image|FlatList|Modal)\b([\s\S]*?)(\/?)>|<\/(View|ScrollView|TouchableOpacity|Text|TextInput|LinearGradient|SafeAreaView|StatusBar|Image|FlatList|Modal)>/g;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    if (match[0].startsWith('</')) {
        const name = match[4];
        if (stack.length === 0) {
            console.log(`Unexpected closing tag </${name}> at line ${line}`);
            continue;
        }
        const last = stack.pop();
        if (last.name !== name) {
            console.log(`Mismatch at line ${line}: opened <${last.name}> at line ${last.line}, closed with </${name}>`);
            // To find the exact orphaned tag, we don't push it back, just report.
        }
    } else {
        const name = match[1];
        const isSelfClosing = match[3] === '/' || name === 'TextInput' || name === 'Image' || name === 'StatusBar';
        if (!isSelfClosing) {
            stack.push({ name, line });
        }
    }
}
if (stack.length > 0) {
    console.log('Unclosed tags:', stack);
} else {
    console.log('All tags balanced!');
}
