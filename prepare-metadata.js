const fs = require('fs');
const path = require('path');


/**
 * Copies a file if it exists.
 */
function copyIfExists(source, targetDir, dryRun) {
    if (fs.existsSync(source)) {
        const fileName = path.basename(source);
        const target = path.join(targetDir, fileName);

        if (dryRun) {
            console.log(`📄 [DRY RUN] File copied: ${fileName}`);
        } else {
            fs.copyFileSync(source, target);
            console.log(`📄 File copied: ${fileName}`);
        }
    }
}

/**
 * Cleans a package.json and copies the necessary files into the dist folder.
 */
function prepareMetadata(source, targetDir, keysToRemove = ['scripts', 'devDependencies'], dryRun = false) {
    const raw = fs.readFileSync(source, 'utf-8');
    const pkg = JSON.parse(raw);

    console.log(`📦 Reading ${source}`);
    console.log(`🧹 Removing keys : ${keysToRemove.join(', ')}\n`);

    keysToRemove.forEach(key => {
        if (pkg[key]) {
            delete pkg[key];
            console.log(`🗑️  Removed key : ${key}`);
        }
    });

    if (dryRun) {
        console.log(`\n🔍 [DRY RUN] Cleaned package.json  :\n`);
        console.log(JSON.stringify(pkg, null, 2));
        console.log(`\n💡 No files written (dry run enabled).\n`);
        return;
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, {recursive: true});
    }

    const target = path.join(targetDir, 'package.json');
    fs.writeFileSync(target, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`✅ package.json cleaned and copied to ${targetDir}\n`);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const ROOT = __dirname;
const SOURCE = path.join(ROOT, 'package.json');
const TARGET = path.join(ROOT, 'dist');

const KEYS_TO_REMOVE = [
    'scripts',
    'devDependencies',
];

const FILES_TO_COPY = ['README.md', 'LICENSE', 'NOTICE'];

prepareMetadata(SOURCE, TARGET, KEYS_TO_REMOVE, dryRun);

FILES_TO_COPY.forEach(file =>
    copyIfExists(path.join(ROOT, file), TARGET, dryRun)
);
