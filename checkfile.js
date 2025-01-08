const fs = require('fs');
const path = require('path');

// Set your folder dynamically or take it as input
const folderPath = './'; // Change to your project's root folder or leave it as './' for the current directory

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function extractImports() {
    const allFiles = getAllFiles(folderPath);
    const folderUsage = {};

    allFiles.forEach((file) => {
        // Only process text-based files (like .js, .ts, etc.)
        if (!file.match(/\.(js|ts|jsx|tsx)$/)) return;

        const content = fs.readFileSync(file, 'utf8');

        // Match imports like: import { X } from '@abyss/mobile/...';
        const matches = content.match(/import {[^}]+} from '@abyss\/mobile\/[^']+';/g) || [];
        // Match imports like: import X from '@abyss/mobile/...';
        const defaultMatches = content.match(/import [^ ]+ from '@abyss\/mobile\/[^']+';/g) || [];

        matches.concat(defaultMatches).forEach((match) => {
            const pathMatch = match.match(/from ('|")(@abyss\/mobile\/[^'"]+)('|")/);
            if (pathMatch) {
                const importPath = pathMatch[2]; // e.g., '@abyss/mobile/arc'
                const folder = importPath.split('/').slice(0, 3).join('/'); // Keep the main folder structure

                const components = match.includes('{')
                    ? match
                          .split('{')[1]
                          .split('}')[0]
                          .split(',')
                          .map((comp) => comp.trim())
                    : [match.split(' ')[1].trim()];

                if (!folderUsage[folder]) {
                    folderUsage[folder] = {};
                }

                components.forEach((component) => {
                    if (!folderUsage[folder][component]) {
                        folderUsage[folder][component] = new Set();
                    }
                    folderUsage[folder][component].add(file);
                });
            }
        });
    });

    // Print results grouped by folder and component
    for (const [folder, components] of Object.entries(folderUsage)) {
        console.log(`Folder: ${folder}`);
        for (const [component, files] of Object.entries(components)) {
            console.log(`  Component: ${component}`);
            console.log(`    Files:`);
            console.log([...files].join('\n    '));
        }
        console.log('---');
    }

    // Optional: Save to a CSV file
    const csvContent = 'Folder,Component,Files\n' + Object.entries(folderUsage)
        .flatMap(([folder, components]) =>
            Object.entries(components).map(
                ([component, files]) =>
                    `"${folder}","${component}","${[...files].join('; ')}"`
            )
        )
        .join('\n');

    fs.writeFileSync('folderUsage.csv', csvContent, 'utf8');
    console.log('Folder usage details saved to folderUsage.csv');
}

// Run the extraction
extractImports();