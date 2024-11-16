const fs = require('fs');
const xlsx = require('xlsx');

// Excluded keys
const EXCLUDED_KEYS = ['smartling', 'lagoon.updatedBy', 'lagoon.updatedAt', 'id'];

// Helper function to remove excluded keys from JSON
const filterKeys = (entry) => {
  const filteredEntry = { ...entry };
  EXCLUDED_KEYS.forEach((key) => delete filteredEntry[key]);
  return filteredEntry;
};

// Load JSON files
const newJson = JSON.parse(fs.readFileSync('new.json', 'utf8'))['common-searches'];
const oldJson = JSON.parse(fs.readFileSync('old.json', 'utf8'))['common-searches'];

// Remove excluded keys
const newFiltered = newJson.map(filterKeys);
const oldFiltered = oldJson.map(filterKeys);

// Convert to maps for quick comparison using 'key'
const newMap = new Map(newFiltered.map((entry) => [entry.key, entry]));
const oldMap = new Map(oldFiltered.map((entry) => [entry.key, entry]));

// Generate comparison tables
const newEntriesNew = newFiltered.filter((entry) => !oldMap.has(entry.key));
const newEntriesOld = oldFiltered.filter((entry) => !newMap.has(entry.key));

const notFoundInNew = oldFiltered.filter((entry) => !newMap.has(entry.key));
const notFoundInOld = newFiltered.filter((entry) => !oldMap.has(entry.key));

const similarEntries = newFiltered.filter((entry) => {
  const oldEntry = oldMap.get(entry.key);
  return oldEntry && JSON.stringify(entry) === JSON.stringify(oldEntry);
});

// For Different Entries, include both `new.json` and `old.json` values
const differentEntries = [];
newFiltered.forEach((entry) => {
  const oldEntry = oldMap.get(entry.key);
  if (oldEntry && JSON.stringify(entry) !== JSON.stringify(oldEntry)) {
    differentEntries.push({ source: 'new.json', ...entry });
    differentEntries.push({ source: 'old.json', ...oldEntry });
  }
});

// Prepare data for the Excel file
const rows = [];

// Function to add a table with its header and data
const addTable = (tableName, data) => {
  if (data.length > 0) {
    const headerRow = [tableName]; // Table name row
    const columnRow = Object.keys(data[0]); // Column names row
    rows.push(headerRow);
    rows.push(columnRow);

    data.forEach((entry) => {
      rows.push(Object.values(entry));
    });

    rows.push([]); // Empty row for separation
  }
};

// Add tables to the rows array
addTable('New Entries (New -> Old)', newEntriesNew);
addTable('New Entries (Old -> New)', newEntriesOld);
addTable('Not Found in New', notFoundInNew);
addTable('Not Found in Old', notFoundInOld);
addTable('Similar Entries', similarEntries);
addTable('Different Entries', differentEntries);

// Create a worksheet from the rows
const worksheet = xlsx.utils.aoa_to_sheet(rows);

// Create a workbook and append the worksheet
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, 'common-searches');

// Write the Excel file
xlsx.writeFile(workbook, 'report.xlsx');

console.log('Excel report generated: report.xlsx');
