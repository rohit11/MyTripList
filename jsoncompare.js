const axios = require('axios');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');

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

// Function to generate a unique, valid worksheet name
function generateWorksheetName(name, existingNames) {
    let sanitizedName = name.replace(/[^a-zA-Z0-9-_ ]/g, '').slice(0, 31); // Remove special characters and limit to 31 chars
    let uniqueName = sanitizedName;
    let counter = 1;

    while (existingNames.has(uniqueName)) {
        uniqueName = `${sanitizedName.slice(0, 28)}_${counter}`;
        counter++;
    }

    existingNames.add(uniqueName);
    return uniqueName;
}

// Function to export data to Excel with separate sheets for each parent key
async function exportToExcel(dataByParentKey, outputPath) {
    const workbook = new ExcelJS.Workbook();
    const existingNames = new Set();

    const newStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } } }; // Green for New
    const notFoundStyle = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } } }; // Red for Not Found

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        const sheetName = generateWorksheetName(parentKey, existingNames);
        const sheet = workbook.addWorksheet(sheetName);

        let currentRow = 1;

        // Add full parent key name as the title at the top
        sheet.getRow(currentRow).values = [`Parent Key: ${parentKey}`];
        sheet.getRow(currentRow).font = { bold: true, size: 14 };
        currentRow += 2;

        // Check if there are any differences
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
                        cell.fill = newStyle;
                        cell.alignment = { wrapText: true }; // Enable text wrapping in cells
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
                        cell.fill = notFoundStyle;
                        cell.alignment = { wrapText: true }; // Enable text wrapping in cells
                    });
                    currentRow++;
                });
            }
        }
    }

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel exported to ${outputPath}`);
}

// Function to export data to PDF in table format
async function exportToPDF(dataByParentKey, outputPath) {
    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(fs.createWriteStream(outputPath));

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        doc.addPage().fontSize(14).text(`Parent Key: ${parentKey}`, { underline: true });
        doc.moveDown();

        if (newEntries.length === 0 && notFoundEntries.length === 0) {
            doc.fontSize(12).text('No differences found');
        } else {
            if (newEntries.length > 0) {
                doc.fontSize(12).text('New Entries', { underline: true }).moveDown();
                const headers = Object.keys(newEntries[0]);

                // Render table headers
                doc.fontSize(10).text(headers.join(' | '));
                doc.moveDown(0.5);

                // Render each row in the table
                newEntries.forEach(entry => {
                    const rowValues = headers.map(header => 
                        entry[header] === true ? 'true' : entry[header] === false ? 'false' : entry[header] || ''
                    );
                    doc.text(rowValues.join(' | ')).moveDown(0.5);
                });
                doc.moveDown();
            }

            if (notFoundEntries.length > 0) {
                doc.fontSize(12).text('Not Found Entries', { underline: true }).moveDown();
                const headers = Object.keys(notFoundEntries[0]);

                // Render table headers
                doc.fontSize(10).text(headers.join(' | '));
                doc.moveDown(0.5);

                // Render each row in the table
                notFoundEntries.forEach(entry => {
                    const rowValues = headers.map(header => 
                        entry[header] === true ? 'true' : entry[header] === false ? 'false' : entry[header] || ''
                    );
                    doc.text(rowValues.join(' | ')).moveDown(0.5);
                });
            }
        }
    }

    doc.end();
    console.log(`PDF exported to ${outputPath}`);
}

// Main function
async function main() {
    const oldUrl = 'https://example.com/old.json'; // Replace with actual URL
    const newUrl = 'https://example.com/new.json'; // Replace with actual URL
    const excelOutputPath = 'json_differences.xlsx';
    const pdfOutputPath = 'json_differences.pdf';

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
    await exportToPDF(dataByParentKey, pdfOutputPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));