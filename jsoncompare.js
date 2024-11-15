const axios = require('axios');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = require("docx");
const fs = require("fs");

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

// Function to export data to Excel with simplified styling
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

// Function to export data to Word document
async function exportToWord(dataByParentKey, outputPath) {
    const doc = new Document({
        creator: "JSON Diff Tool",
        title: "JSON Differences Report",
        description: "Comparison of JSON data differences",
    });

    for (const [parentKey, data] of Object.entries(dataByParentKey)) {
        const { newEntries, notFoundEntries } = data;

        // Add parent key title
        doc.addSection({
            children: [
                new Paragraph({
                    text: `Parent Key: ${parentKey}`,
                    heading: "Heading1",
                }),
            ],
        });

        if (newEntries.length > 0) {
            doc.addSection({
                children: [
                    new Paragraph("New Entries"),
                    createTable(newEntries),
                ],
            });
        }

        if (notFoundEntries.length > 0) {
            doc.addSection({
                children: [
                    new Paragraph("Not Found Entries"),
                    createTable(notFoundEntries),
                ],
            });
        }
    }

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Word document exported to ${outputPath}`);
}

// Helper function to create a table for Word document
function createTable(entries) {
    const headers = Object.keys(entries[0]);
    const headerRow = new TableRow({
        children: headers.map(header => 
            new TableCell({
                children: [new Paragraph(header)],
                width: { size: 20, type: WidthType.PERCENTAGE },
            })
        ),
    });

    const dataRows = entries.map(entry => 
        new TableRow({
            children: headers.map(header => 
                new TableCell({
                    children: [new Paragraph(entry[header] ? entry[header].toString() : "")],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                })
            ),
        })
    );

    return new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
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

// Main function
async function main() {
    const oldUrl = 'https://example.com/old.json'; // Replace with actual URL
    const newUrl = 'https://example.com/new.json'; // Replace with actual URL
    const excelOutputPath = 'json_differences.xlsx';
    const wordOutputPath = 'json_differences.docx';

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
    await exportToWord(dataByParentKey, wordOutputPath);
}

// Run the main function
main().catch(error => console.error('Error in main function:', error));