const axios = require('axios');
const { diff } = require('deep-diff');
const ExcelJS = require('exceljs');

// Function to fetch JSON data from a URL
async function fetchJson(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

// Function to remove ignored keys from the JSON data
function removeIgnoredKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => removeIgnoredKeys(item));
    } else if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (key !== 'id' && key !== 'lagoon.updatedAt' && key !== 'lagoon.updatedBy') {
                newObj[key] = removeIgnoredKeys(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

// Function to categorize differences and add color
function categorizeDifferences(oldData, newData) {
    const differences = diff(oldData, newData);
    const categorized = {};

    if (!differences) return categorized;

    differences.forEach((change) => {
        // Skip changes within the 'smartling' parent key
        if (change.path && change.path[0] === 'smartling') {
            return;
        }

        const parentKey = change.path ? change.path[0] : 'root';

        if (!categorized[parentKey]) {
            categorized[parentKey] = { new: [], updated: [], deleted: [] };
        }

        if (change.kind === 'N') {
            categorized[parentKey].new.push(change);
        } else if (change.kind === 'E') {
            categorized[parentKey].updated.push(change);
        } else if (change.kind === 'D') {
            categorized[parentKey].deleted.push(change);
        }
    });

    return categorized;
}

// Function to export differences to an Excel file
async function exportToExcel(categorizedDifferences, outputPath) {
    const workbook = new ExcelJS.Workbook();

    // Define color styles
    const styles = {
        new: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } } }, // Green
        updated: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' } } }, // Yellow
        deleted: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } } } // Red
    };

    for (const [parentKey, changes] of Object.entries(categorizedDifferences)) {
        const sheet = workbook.addWorksheet(parentKey);

        // Add headers
        sheet.columns = [
            { header: 'Path', key: 'path', width: 30 },
            { header: 'Old Value', key: 'oldValue', width: 30 },
            { header: 'New Value', key: 'newValue', width: 30 }
        ];

        // Add rows based on the type of change
        ['new', 'updated', 'deleted'].forEach(type => {
            changes[type].forEach(change => {
                const row = {
                    path: change.path ? change.path.slice(1).join('.') : '',
                    oldValue: change.lhs !== undefined ? JSON.stringify(change.lhs) : '',
                    newValue: change.rhs !== undefined ? JSON.stringify(change.rhs) : ''
                };
                const addedRow = sheet.addRow(row);
                addedRow.eachCell(cell => {
                    cell.style = styles[type];
                });
            });
        });
    }

    // Write the workbook to a file
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Differences exported to ${outputPath}`);
}

// Main function to perform the comparison and export
async function main() {
    const oldUrl = 'https://example.com/old.json'; // Replace with actual URL
    const newUrl = 'https://example.com/new.json'; // Replace with actual URL
    const outputPath = 'json_differences.xlsx';

    // Fetch JSON data from the URLs
    const oldDataRaw = await fetchJson(oldUrl);
    const newDataRaw = await fetchJson(newUrl);

    // Remove ignored keys
    const oldData = removeIgnoredKeys(oldDataRaw);
    const newData = removeIgnoredKeys(newDataRaw);

    // Categorize differences
    const categorizedDifferences = categorizeDifferences(oldData, newData);

    // Export differences to Excel
    await exportToExcel(categorizedDifferences, outputPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));