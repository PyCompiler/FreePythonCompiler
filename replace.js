const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    if (dir.includes('.git')) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkDir(filepath);
        } else {
            const ext = path.extname(filepath);
            if (['.html', '.js', '.css', '.md', '.json', '.xml', '.txt', '.toml'].includes(ext)) {
                let content = fs.readFileSync(filepath, 'utf8');
                if (content.includes('FreePythonCompiler')) {
                    fs.writeFileSync(filepath, content.replace(/FreePythonCompiler/g, 'FreePythonCompiler'), 'utf8');
                }
            }
        }
    }
}

walkDir('c:/Users/Hp/FreePythonCompiler');
console.log('Done');
