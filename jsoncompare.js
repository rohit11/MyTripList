const axios = require('axios');
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

// Remove ignored keys function
function removeIgnoredKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => removeIgnoredKeys(item));
    } else if (obj && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (!['id', 'lagoon.updatedAt', 'lagoon.updatedBy', 'smartling'].includes(key)) {
                newObj[key] = removeIgnoredKeys(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

// Function to categorize entries as "New" or "Not Found"
function categorizeEntries(oldData, newData) {
    const oldMap = new Map(oldData.map(item => [item.key, item]));
    const newMap = new Map(newData.map(item => [item.key, item]));

    const newEntries = [];
    const notFoundEntries = [];

    newMap.forEach((newItem, key) => {
        if (!oldMap.has(key)) {
            newEntries.push(newItem);  // New item in the new data
        }
    });

    oldMap.forEach((oldItem, key) => {
        if (!newMap.has(key)) {
            notFoundEntries.push(oldItem);  // Item in old data but missing in new data
        }
    });

    return { newEntries, notFoundEntries };
}

// Function to export data to a single Excel sheet with sections for each parent key
async function exportToSingleExcelSheet(dataByParentKey, outputPath) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Comparison');

    let currentRow = 1;

    // Define styles
    const headerStyle = { bold: true };
    const newStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } } }; // Green for New
    const notFoundStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } } }; // Red for Not Found

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        // Add parent key title
        sheet.getRow(currentRow).values = [`${parentKey} - Comparison`];
        sheet.getRow(currentRow).font = { bold: true, size: 14 };
        currentRow += 2;

        // Add "New" section if there are new entries
        if (newEntries.length > 0) {
            sheet.getRow(currentRow).values = ['New Entries'];
            sheet.getRow(currentRow).font = headerStyle;
            currentRow++;

            // Add headers for "New Entries" section
            const headers = Object.keys(newEntries[0]);
            sheet.getRow(currentRow).values = [...headers, 'Change Type'];
            sheet.getRow(currentRow).font = headerStyle;
            currentRow++;

            // Add new entries rows
            newEntries.forEach(entry => {
                const rowValues = headers.map(header => entry[header] || '');
                rowValues.push('New');
                const row = sheet.addRow(rowValues);
                row.eachCell(cell => {
                    cell.fill = newStyle;
                });
                currentRow++;
            });
            currentRow++; // Add a blank row after the section
        }

        // Add "Not Found" section if there are not found entries
        if (notFoundEntries.length > 0) {
            sheet.getRow(currentRow).values = ['Not Found Entries'];
            sheet.getRow(currentRow).font = headerStyle;
            currentRow++;

            // Add headers for "Not Found Entries" section
            const headers = Object.keys(notFoundEntries[0]);
            sheet.getRow(currentRow).values = [...headers, 'Change Type'];
            sheet.getRow(currentRow).font = headerStyle;
            currentRow++;

            // Add not found entries rows
            notFoundEntries.forEach(entry => {
                const rowValues = headers.map(header => entry[header] || '');
                rowValues.push('Not Found');
                const row = sheet.addRow(rowValues);
                row.eachCell(cell => {
                    cell.fill = notFoundStyle;
                });
                currentRow++;
            });
            currentRow++; // Add a blank row after the section
        }
        currentRow++; // Extra space between different parent keys
    }

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Differences exported to ${outputPath}`);
}

// Main function
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

    const dataByParentKey = {};

    // Iterate through each parent key in the JSON data
    for (const key of Object.keys(newData)) {
        if (Array.isArray(newData[key]) && Array.isArray(oldData[key])) {
            dataByParentKey[key] = categorizeEntries(oldData[key], newData[key]);
        }
    }

    // Export the categorized data to a single Excel sheet
    await exportToSingleExcelSheet(dataByParentKey, outputPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));