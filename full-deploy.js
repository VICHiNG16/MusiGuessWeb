const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 Starting Full Deployment Pipeline...");

// 1. Export
console.log("📦 Exporting project...");
try {
    execSync('npm run export', { stdio: 'inherit' });
} catch (e) {
    console.error("❌ Export failed.");
    process.exit(1);
}

const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const expoDir = path.join(distPath, '_expo');
const newExpoDir = path.join(distPath, 'expo');

// 2. Rename _expo -> expo
console.log("📂 Renaming _expo folder...");
if (fs.existsSync(expoDir)) {
    if (fs.existsSync(newExpoDir)) {
        fs.rmSync(newExpoDir, { recursive: true, force: true });
    }
    // Retry loop for Windows EPERM
    let retries = 5;
    while (retries > 0) {
        try {
            fs.renameSync(expoDir, newExpoDir);
            break;
        } catch (e) {
            console.log(`⚠️  Rename failed (EPERM), retrying in 1s... (${retries})`);
            retries--;
            const start = Date.now();
            while (Date.now() - start < 1000) { } // Busy wait 1s
            if (retries === 0) throw e;
        }
    }
}

// 2b. Rename node_modules -> modules (GitHub ignores node_modules)
const nodeModulesDir = path.join(distPath, 'assets', 'node_modules');
const modulesDir = path.join(distPath, 'assets', 'modules');
if (fs.existsSync(nodeModulesDir)) {
    console.log("📂 Renaming node_modules -> modules...");
    fs.renameSync(nodeModulesDir, modulesDir);
}

// 3. Update index.html
console.log("📝 Injecting AdSense and fixing paths...");
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Fix Paths in index.html and ALL JS files
html = html.replaceAll('/_expo/', '/expo/');
html = html.replaceAll('/node_modules/', '/modules/');

// Inject AdSense Script in HTML
const adSenseScript = `
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9555506877953640" crossorigin="anonymous"></script>
`;

if (!html.includes('ca-pub-9555506877953640')) {
    html = html.replace('</head>', `${adSenseScript}</head>`);
}

fs.writeFileSync(indexHtmlPath, html);

// RECURSIVE PATCH: Fix /_expo/ and /node_modules/ in all JS/JSON/CSS files
function patchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            patchFiles(fullPath);
        } else if (/\.(js|json|css|map)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            if (content.includes('/_expo/')) {
                content = content.replaceAll('/_expo/', '/expo/');
                changed = true;
            }
            if (content.includes('/node_modules/')) {
                content = content.replaceAll('/node_modules/', '/modules/');
                changed = true;
            }

            if (changed) {
                console.log(`🔧 Patching ${file}...`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}
patchFiles(distPath);

// 4. Create 404.html (copy index.html)
console.log("📄 Creating 404.html fallback...");
fs.copyFileSync(indexHtmlPath, path.join(distPath, '404.html'));

// 5. Deploy
console.log("🚀 Deploying to GitHub Pages...");
try {
    execSync('npx gh-pages -d dist', { stdio: 'inherit' });
} catch (e) {
    console.error("❌ Deployment failed.");
    process.exit(1);
}

console.log("✅ DONE! Site deployed successfully.");
