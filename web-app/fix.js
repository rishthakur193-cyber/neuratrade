const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace \`Bearer \${token}\` with `Bearer ${token}`
    content = content.replace(/\\`Bearer \\\$\{token\}\\`/g, '`Bearer ${token}`');

    // Replace \` with `
    content = content.replace(/\\`/g, '`');

    // Replace \${ with ${
    content = content.replace(/\\\$\{/g, '${');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
console.log('Done');
