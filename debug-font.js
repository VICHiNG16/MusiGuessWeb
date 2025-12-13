const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dist/expo/static/js/web');
const files = fs.readdirSync(dir);
const jsFile = files.find(f => f.startsWith('entry-'));

if (jsFile) {
    const content = fs.readFileSync(path.join(dir, jsFile), 'utf8');
    const index = content.indexOf('Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf');

    if (index !== -1) {
        // Print 100 chars before and after
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + 150);
        console.log("FOUND MATCH:");
        console.log(content.substring(start, end));
    } else {
        console.log("NOT FOUND");
    }
}
