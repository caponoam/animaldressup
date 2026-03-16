import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Starting Quality Verification (Text Parsing)...');

let errors = 0;
let warnings = 0;

// 1. Verify app.json vs package.json version
try {
    const appJsonPath = path.resolve(__dirname, '../app.json');
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    if (fs.existsSync(appJsonPath) && fs.existsSync(packageJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (appJson.expo.version !== packageJson.version) {
            console.error(`❌ Error: Version mismatch! app.json (${appJson.expo.version}) vs package.json (${packageJson.version})`);
            errors++;
        } else {
            console.log(`✅ Version check passed: ${packageJson.version}`);
        }
    }
} catch (e) {
    console.error('❌ Error verifying versions:', e.message);
    errors++;
}

// 2. Scan data/animals.js for missing assets using Regex
try {
    const animalsJsPath = path.resolve(__dirname, '../data/animals.js');
    if (fs.existsSync(animalsJsPath)) {
        const content = fs.readFileSync(animalsJsPath, 'utf8');
        // Look for: id: 'bear',
        const idRegex = /id:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = idRegex.exec(content)) !== null) {
            const animalId = match[1];
            const assetPath = path.resolve(__dirname, '../assets/animals/', `${animalId}.png`);
            if (!fs.existsSync(assetPath)) {
                console.error(`❌ Error: Missing asset for animal "${animalId}" at ${assetPath}`);
                errors++;
            }
        }
    }
} catch (e) {
    console.error('❌ Error scanning animals.js:', e.message);
    errors++;
}

// 3. Scan data/assets.js for COMPOSITES
try {
    const assetsJsPath = path.resolve(__dirname, '../data/assets.js');
    if (fs.existsSync(assetsJsPath)) {
        const content = fs.readFileSync(assetsJsPath, 'utf8');
        // Look for keys in COMPOSITES: 'bear_red_shirt':
        const compositeRegex = /'([^']+)':\s*require/g;
        let match;
        while ((match = compositeRegex.exec(content)) !== null) {
            const compositeKey = match[1];
            const assetPath = path.resolve(__dirname, '../assets/clothes/tops/', `${compositeKey}_composite.png`);
            if (!fs.existsSync(assetPath)) {
                console.error(`❌ Error: Missing composite asset for "${compositeKey}" at ${assetPath}`);
                errors++;
            }
        }
    }
} catch (e) {
    console.error('❌ Error scanning assets.js:', e.message);
    errors++;
}

console.log(`\nVerification complete: ${errors} Errors, ${warnings} Warnings`);

if (errors > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
