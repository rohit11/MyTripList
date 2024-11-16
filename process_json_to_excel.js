const fs = require('fs');
const https = require('https');
const xlsx = require('xlsx');

// Excluded keys for entries
const EXCLUDED_KEYS = ['smartling', 'lagoon.updatedBy', 'lagoon.updatedAt', 'id'];

// Excluded parent keys
const EXCLUDED_PARENT_KEYS = ['smartling'];

// Parameters from environment (passed from YAML)
const LOB_NEW = process.env.LOB_NEW || 'default-new-lob';
const LOB_OLD = process.env.LOB_OLD || 'default-old-lob';
const ENV_NEW = process.env.ENV_NEW || 'default-new-env';
const ENV_OLD = process.env.ENV_OLD || 'default-old-env';

// URLs for downloading JSON files
const newJsonUrl = `https://example.com/${LOB_NEW}/${ENV_NEW}/new.json`;
const oldJsonUrl = `https://example.com/${LOB_OLD}/${ENV_OLD}/old.json`;

// Helper function to fetch JSON data from a URL
const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', (err) => reject(err));
    });
  });
};

// Helper function to remove excluded keys from JSON entries
const filterKeys = (entry) => {
  const filteredEntry = { ...entry };
  EXCLUDED_KEYS.forEach((key) => delete filteredEntry[key]);
  return filteredEntry;
};

// Helper function to truncate or make sheet names unique
const sheetNames = new Set();
const getUniqueSheetName = (name) => {
  let baseName = name.slice(0, 28); // Truncate to 28 characters if necessary
  let counter = 1;

  let uniqueName = baseName;
  while (sheetNames.has(uniqueName)) {
    uniqueName = `${baseName.slice(0, 28 - counter.toString().length)}${counter}`;
    counter++;
  }

  sheetNames.add(uniqueName); // Mark this name as used
  return uniqueName;
};

// Main processing function
const processJsonData = async () => {
  // Load local JSON files (fallback)
  let newJsonLocal = {};
  let oldJsonLocal = {};
  try {
    newJsonLocal = JSON.parse(fs.readFileSync('new.json', 'utf8'));
    oldJsonLocal = JSON.parse(fs.readFileSync('old.json', 'utf8'));
  } catch (error) {
    console.log('Local JSON files not found or could not be read.');
  }

  // Fetch JSON files from URLs
  let newJsonRemote = {};
  let oldJsonRemote = {};
  try {
    console.log(`Fetching new JSON from ${newJsonUrl}`);
    newJsonRemote = await fetchJson(newJsonUrl);
    console.log('Fetched new JSON successfully.');
  } catch (error) {
    console.log('Failed to fetch new JSON:', error.message);
  }
  try {
    console.log(`Fetching old JSON from ${oldJsonUrl}`);
    oldJsonRemote = await fetchJson(oldJsonUrl);
    console.log('Fetched old JSON successfully.');
  } catch (error) {
    console.log('Failed to fetch old JSON:', error.message);
  }

  // Merge remote and local JSON data
  const newJson = { ...newJsonLocal, ...newJsonRemote };
  const oldJson = { ...oldJsonLocal, ...oldJsonRemote };

  // Create a workbook for Excel
  const workbook = xlsx.utils.book_new();

  // Get all unique parent keys from both JSON files, excluding the ignored parent keys
  const parentKeys = new Set(
    [...Object.keys(newJson), ...Object.keys(oldJson)].filter(
      (key) => !EXCLUDED_PARENT_KEYS.includes(key)
    )
  );

  // Process each parent key
  parentKeys.forEach((parentKey) => {
    // Extract data for the current parent key (handle missing keys as empty arrays)
    const newEntries = newJson[parentKey] || [];
    const oldEntries = oldJson[parentKey] || [];

    // Remove excluded keys
    const newFiltered = newEntries.map(filterKeys);
    const oldFiltered = oldEntries.map(filterKeys);

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
        differentEntries.push({ source: `LOB: ${LOB_NEW}`, ...entry });
        differentEntries.push({ source: `LOB: ${LOB_OLD}`, ...oldEntry });
      }
    });

    // Prepare data for the Excel file
    const rows = [];

    // Add parent key as the first row
    rows.push([`Parent Key: ${parentKey}`]);
    rows.push([]); // Empty row for separation

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
    addTable(`New Entries (${LOB_NEW} -> ${LOB_OLD})`, newEntriesNew);
    addTable(`New Entries (${LOB_OLD} -> ${LOB_NEW})`, newEntriesOld);
    addTable(`Not Found in ${LOB_NEW}`, notFoundInNew);
    addTable(`Not Found in ${LOB_OLD}`, notFoundInOld);
    addTable(`Similar Entries`, similarEntries);
    addTable(`Different Entries`, differentEntries);

    // Generate a unique and valid sheet name
    const sheetName = getUniqueSheetName(parentKey);

    // Create a worksheet for the current parent key
    const worksheet = xlsx.utils.aoa_to_sheet(rows);
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Write the Excel file
  xlsx.writeFile(workbook, 'report.xlsx');

  console.log('Excel report generated: report.xlsx');
};

// Run the process
processJsonData().catch((err) => console.error(err));


/*const fs = require('fs');
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
const newJson = JSON.parse(fs.readFileSync('new_data.json', 'utf8'))['common-searches'];
const oldJson = JSON.parse(fs.readFileSync('old_data.json', 'utf8'))['common-searches'];

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

console.log('Excel report generated: report.xlsx');*/
