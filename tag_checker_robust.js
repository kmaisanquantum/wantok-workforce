const fs = require('fs');

function checkTags(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');

    let stack = [];
    let lineNum = 0;

    for (let line of lines) {
        lineNum++;

        // Remove strings to avoid matching tags inside strings
        let cleanLine = line.replace(/`[^`]*`/g, '""').replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");

        // Find all tags in the line
        // This regex matches <TagName ...> but not <TagName ... />
        const tagRegex = /<(\/?)([a-zA-Z0-9]+)([^>]*?)>/g;
        let match;

        while ((match = tagRegex.exec(cleanLine)) !== null) {
            const isClosing = match[1] === '/';
            const tagName = match[2];
            const attributes = match[3];
            const isSelfClosing = attributes.trim().endsWith('/');

            if (isSelfClosing) continue;

            if (isClosing) {
                if (stack.length === 0) {
                    console.log(`Error: Unmatched closing tag </${tagName}> at line ${lineNum}`);
                } else {
                    const last = stack.pop();
                    if (last.tag !== tagName) {
                        console.log(`Error: Mismatched tag. Expected </${last.tag}> (from line ${last.line}), found </${tagName}> at line ${lineNum}`);
                        // Push it back to try to recover? No, let's just log.
                    }
                }
            } else {
                stack.push({ tag: tagName, line: lineNum });
            }
        }
    }

    if (stack.length > 0) {
        console.log(`Error: Unclosed tags at end of file:`);
        stack.forEach(s => console.log(`  <${s.tag}> from line ${s.line}`));
    } else {
        console.log("All tags balanced!");
    }
}

checkTags('WantokWorkforce.js');
