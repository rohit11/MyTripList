const axios = require('axios');
const ExcelJS = require('exceljs');
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

// Retrieve environment and lob from command-line arguments
const environment = process.argv[2] || 'defaultEnvironment';
const lob = process.argv[3] || 'defaultLob';

// URLs based on environment and LOB
const oldUrl = `https://example.com/${environment}/${lob}/old.json`; // Replace with actual URL pattern
const newUrl = `https://example.com/${environment}/${lob}/new.json`; // Replace with actual URL pattern

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

// Function to export data to Excel
async function exportToExcel(dataByParentKey, outputPath) {
    const workbook = new ExcelJS.Workbook();
    const existingNames = new Set();

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        const sheetName = generateWorksheetName(parentKey, existingNames);
        const sheet = workbook.addWorksheet(sheetName);

        let currentRow = 1;

        // Add full parent key name as the title at the top
        sheet.getRow(currentRow).values = [`Parent Key: ${parentKey}`];
        sheet.getRow(currentRow).font = { bold: true, size: 14 };
        currentRow += 2;

        if (newEntries.length === 0 && notFoundEntries.length === 0) {
            sheet.getRow(currentRow).values = ['No differences found'];
            sheet.getRow(currentRow).font = { italic: true };
        } else {
            if (newEntries.length > 0) {
                sheet.getRow(currentRow).values = ['New Entries'];
                sheet.getRow(currentRow).font = { bold: true, size: 12 };
                currentRow++;

                const headers = Object.keys(newEntries[0]);
                sheet.getRow(currentRow).values = headers;
                sheet.getRow(currentRow).font = { bold: true };
                currentRow++;

                newEntries.forEach(entry => {
                    const rowValues = headers.map(header => 
                        entry[header] === true ? 'true' : entry[header] === false ? 'false' : entry[header] || ''
                    );
                    const row = sheet.addRow(rowValues);
                    row.eachCell(cell => {
                        cell.alignment = { wrapText: true };
                    });
                    currentRow++;
                });
                currentRow++;
            }

            if (notFoundEntries.length > 0) {
                sheet.getRow(currentRow).values = ['Not Found Entries'];
                sheet.getRow(currentRow).font = { bold: true, size: 12 };
                currentRow++;

                const headers = Object.keys(notFoundEntries[0]);
                sheet.getRow(currentRow).values = headers;
                sheet.getRow(currentRow).font = { bold: true };
                currentRow++;

                notFoundEntries.forEach(entry => {
                    const rowValues = headers.map(header => 
                        entry[header] === true ? 'true' : entry[header] === false ? 'false' : entry[header] || ''
                    );
                    const row = sheet.addRow(rowValues);
                    row.eachCell(cell => {
                        cell.alignment = { wrapText: true };
                    });
                    currentRow++;
                });
            }
        }
    }

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel exported to ${outputPath}`);
}

// Function to export data to combined CSV
function exportToCsv(dataByParentKey, outputFilePath) {
    const combinedEntries = [];

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        if (newEntries.length > 0) {
            combinedEntries.push({ ParentKey: parentKey, EntryType: "New Entries", ...newEntries[0] });
            newEntries.forEach(entry => combinedEntries.push(entry));
        }

        if (notFoundEntries.length > 0) {
            combinedEntries.push({ ParentKey: parentKey, EntryType: "Not Found Entries", ...notFoundEntries[0] });
            notFoundEntries.forEach(entry => combinedEntries.push(entry));
        }
    }

    const parser = new Parser();
    const csv = parser.parse(combinedEntries);
    fs.writeFileSync(outputFilePath, csv);
    console.log(`CSV exported to ${outputFilePath}`);
}

// Function to generate a unique, valid worksheet name
function generateWorksheetName(name, existingNames) {
    let sanitizedName = name.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 31);
    let uniqueName = sanitizedName;
    let counter = 1;

    while (existingNames.has(uniqueName)) {
        uniqueName = `${sanitizedName.slice(0, 28)}_${counter}`;
        counter++;
    }

    existingNames.add(uniqueName);
    return uniqueName;
}

// Main function
async function main() {
    const excelOutputPath = 'json_differences.xlsx';
    const combinedCsvPath = 'json_combined.csv';

    console.log(`Running with environment: ${environment} and LOB: ${lob}`);

    const oldDataRaw = await fetchJson(oldUrl);
    const newDataRaw = await fetchJson(newUrl);

    const oldData = removeIgnoredKeys(oldDataRaw);
    const newData = removeIgnoredKeys(newDataRaw);

    const dataByParentKey = {};

    for (const key of Object.keys(newData)) {
        if (Array.isArray(newData[key]) && Array.isArray(oldData[key])) {
            dataByParentKey[key] = categorizeEntries(oldData[key], newData[key]);
        }
    }

    await exportToExcel(dataByParentKey, excelOutputPath);
    exportToCsv(dataByParentKey, combinedCsvPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));