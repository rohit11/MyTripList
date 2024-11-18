const fs = require("fs");
const xlsx = require("xlsx");
const https = require("https");

// Excluded keys for entries
const EXCLUDED_KEYS = ["smartling", "lagoon.updatedBy", "lagoon.updatedAt", "id"];

// Helper function to fetch JSON data from a URL
const fetchJson = (lob, env, file) => {
  const url = `https://example.com/${lob}/${env}/${file}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
      res.on("error", (err) => reject(err));
    });
  });
};

// Helper function to remove excluded keys from JSON entries
const filterKeys = (entry) => {
  const filteredEntry = { ...entry };
  EXCLUDED_KEYS.forEach((key) => delete filteredEntry[key]);
  return filteredEntry;
};

// Generate consistent headers from two datasets
const getHeaders = (data1, data2) => {
  const allKeys = new Set();
  data1.forEach((entry) => Object.keys(entry).forEach((key) => allKeys.add(key)));
  data2.forEach((entry) => Object.keys(entry).forEach((key) => allKeys.add(key)));
  return Array.from(allKeys);
};

// Normalize rows to match headers and handle missing keys
const normalizeRows = (data, headers) => {
  return data.map((entry) => {
    const row = {};
    headers.forEach((key) => {
      let value = entry[key];
      if (typeof value === "boolean") {
        value = value.toString(); // Convert true/false to lowercase strings
      }
      row[key] = value || null; // Assign `null` if the key is missing
    });
    return row;
  });
};

// Helper function to generate unique sheet names
const generateSheetName = (() => {
  const usedNames = new Set();
  return (name) => {
    const baseName = name.slice(0, 31); // Limit name to 31 characters
    let uniqueName = baseName;
    let counter = 1;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${baseName.slice(0, 31 - counter.toString().length)}${counter}`;
      counter++;
    }
    usedNames.add(uniqueName);
    return uniqueName;
  };
})();

// Compare two entries field by field to determine equality
const areEntriesEqual = (entry1, entry2) => {
  const filteredEntry1 = filterKeys(entry1);
  const filteredEntry2 = filterKeys(entry2);

  const allKeys = new Set([...Object.keys(filteredEntry1), ...Object.keys(filteredEntry2)]);

  return Array.from(allKeys).every((key) => filteredEntry1[key] === filteredEntry2[key]);
};

// Find similar entries by comparing field by field
const findSimilarEntries = (newData, oldData) => {
  return newData.filter((entry) => {
    const matchingOldEntry = oldData.find((oldEntry) => oldEntry.key === entry.key);
    return matchingOldEntry && areEntriesEqual(entry, matchingOldEntry);
  });
};

// Find entries with differences
const findDifferentEntries = (newData, oldData, lobNew, lobOld) => {
  const differentEntries = [];

  newData.forEach((entry) => {
    const matchingOldEntry = oldData.find((oldEntry) => oldEntry.key === entry.key);
    if (matchingOldEntry && !areEntriesEqual(entry, matchingOldEntry)) {
      differentEntries.push({ source: `LOB: ${lobNew}`, ...entry });
      differentEntries.push({ source: `LOB: ${lobOld}`, ...matchingOldEntry });
    }
  });

  return differentEntries;
};

// Main Excel generation function
const generateExcelFromJson = (workbook, newJson, oldJson, parentKey, lobNew, lobOld) => {
  if (parentKey === "smartling") return; // Ignore smartling parent key

  console.log("Generating sheet for parent key:", parentKey);

  const newEntries = newJson[parentKey] || [];
  const oldEntries = oldJson[parentKey] || [];
  const newFiltered = newEntries.map(filterKeys);
  const oldFiltered = oldEntries.map(filterKeys);

  // Generate consistent headers and normalized rows
  const headers = getHeaders(newFiltered, oldFiltered);
  const normalizedNew = normalizeRows(newFiltered, headers);
  const normalizedOld = normalizeRows(oldFiltered, headers);

  // Generate comparison tables
  const newEntriesNew = normalizedNew.filter((entry) => !oldFiltered.some((old) => old.key === entry.key));
  const newEntriesOld = normalizedOld.filter((entry) => !newFiltered.some((newEntry) => newEntry.key === entry.key));
  const notFoundInNew = normalizedOld.filter((entry) => !newFiltered.some((newEntry) => newEntry.key === entry.key));
  const notFoundInOld = normalizedNew.filter((entry) => !oldFiltered.some((old) => old.key === entry.key));
  const similarEntries = findSimilarEntries(newFiltered, oldFiltered);
  const differentEntries = findDifferentEntries(newFiltered, oldFiltered, lobNew, lobOld);

  

  // Add rows to the Excel
  const rows = [];
  rows.push([`Parent Key: ${parentKey}`]);
  rows.push([]); // Empty row for separation

  const addTable = (tableName, data, headers, isDifferentEntries = false) => {
    if (data.length > 0) {
      rows.push([tableName]); // Add table name as the first row
      rows.push(headers); // Add headers

      if (isDifferentEntries) {
        let previousSource = null;
        data.forEach((entry) => {
          if (entry.source !== previousSource) {
            rows.push([`Source: ${entry.source}`]); // Add source as a row above
            previousSource = entry.source;
          }
          const row = headers.map((key) => entry[key] || null); // Map entry values to headers
          rows.push(row); // Add the data row
        });
      } else {
        data.forEach((entry) => {
          const row = headers.map((key) => entry[key] || null); // Map entry values to headers
          rows.push(row); // Add the data row
        });
      }

      rows.push([]); // Empty row for separation
    }
  };

  // Add all tables
  addTable(`New Entries (${lobNew} -> ${lobOld})`, newEntriesNew, headers);
  addTable(`New Entries (${lobOld} -> ${lobNew})`, newEntriesOld, headers);
  addTable(`Not Found in ${lobNew}`, notFoundInNew, headers);
  addTable(`Not Found in ${lobOld}`, notFoundInOld, headers);
  addTable(`Similar Entries`, similarEntries, headers);
  addTable(`Different Entries`, differentEntries, headers, true);

  // Create worksheet and write to the workbook
  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  xlsx.utils.book_append_sheet(workbook, worksheet, generateSheetName(parentKey));

 
  console.log(`Sheet for "${parentKey}" created.`);
};

// Main function
const main = () => {
  const lobNew = process.env.LOB_NEW;
  const lobOld = process.env.LOB_OLD;
  const envNew = process.env.ENV_NEW;
  const envOld = process.env.ENV_OLD;

  //const newJson = await fetchJson(lobNew, envNew, "new_data.json");
  //const oldJson = await fetchJson(lobOld, envOld, "old_data.json");
  
  const newJson = JSON.parse(fs.readFileSync("new_data.json", "utf8"));
  const oldJson = JSON.parse(fs.readFileSync("old_data.json", "utf8"));


  // Create workbook
  const workbook = xlsx.utils.book_new();
  
  const allParentKeys = new Set([...Object.keys(newJson), ...Object.keys(oldJson)]);

  console.log("All Parent Keys:", Array.from(allParentKeys));

  allParentKeys.forEach((parentKey) => {
    generateExcelFromJson(workbook, newJson, oldJson, parentKey, lobNew, lobOld);
  });

  xlsx.writeFile(workbook, "report.xlsx");
  console.log("Processing complete. Check for created sheets.");
};

main();
