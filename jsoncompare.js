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

// Function to categorize differences and add color
function categorizeDifferences(oldData, newData) {
    const differences = diff(oldData, newData);
    const categorized = { new: [], updated: [], deleted: [] };

    differences.forEach((change) => {
        if (change.kind === 'N') {
            categorized.new.push(change);
        } else if (change.kind === 'E') {
            categorized.updated.push(change);
        } else if (change.kind === 'D') {
            categorized.deleted.push(change);
        }
    });

    return categorized;
}

// Function to export differences to an Excel file
async function exportToExcel(differences, outputPath) {
    const workbook = new ExcelJS.Workbook();

    // Define color styles
    const styles = {
        new: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } } }, // Green
        updated: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEB9C' } } }, // Yellow
        deleted: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } } } // Red
    };

    for (const [key, changes] of Object.entries(differences)) {
        const sheet = workbook.addWorksheet(key.charAt(0).toUpperCase() + key.slice(1));

        // Add headers
        sheet.columns = [
            { header: 'Path', key: 'path', width: 30 },
            { header: 'Old Value', key: 'oldValue', width: 30 },
            { header: 'New Value', key: 'newValue', width: 30 }
        ];

        // Add rows based on the type of change
        changes.forEach(change => {
            const row = {
                path: change.path ? change.path.join('.') : '',
                oldValue: change.lhs !== undefined ? JSON.stringify(change.lhs) : '',
                newValue: change.rhs !== undefined ? JSON.stringify(change.rhs) : ''
            };
            const addedRow = sheet.addRow(row);
            addedRow.eachCell(cell => {
                if (key === 'new') cell.style = styles.new;
                else if (key === 'updated') cell.style = styles.updated;
                else if (key === 'deleted') cell.style = styles.deleted;
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
    const oldData = await fetchJson(oldUrl);
    const newData = await fetchJson(newUrl);

    // Categorize differences
    const differences = categorizeDifferences(oldData, newData);

    // Export differences to Excel
    await exportToExcel(differences, outputPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));