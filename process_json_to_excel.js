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

const differentEntries = newFiltered.filter((entry) => {
  const oldEntry = oldMap.get(entry.key);
  return oldEntry && JSON.stringify(entry) !== JSON.stringify(oldEntry);
});

// Create an Excel workbook
const workbook = xlsx.utils.book_new();

const addSheet = (data, sheetName) => {
  const sheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
};

// Prepare data for the Excel file
addSheet(newEntriesNew, 'New Entries (New -> Old)');
addSheet(newEntriesOld, 'New Entries (Old -> New)');
addSheet(notFoundInNew, 'Not Found in New');
addSheet(notFoundInOld, 'Not Found in Old');
addSheet(similarEntries, 'Similar Entries');
addSheet(differentEntries, 'Different Entries');

// Write the Excel file
xlsx.writeFile(workbook, 'report.xlsx');

console.log('Excel report generated: report.xlsx');
