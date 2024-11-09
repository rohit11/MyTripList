const fs = require('fs');

// Get the feature flag file path and output file path from environment variables
const featureFlagFile = process.env.FEATURE_FLAG_FILE;
const outputFile = process.env.GITHUB_OUTPUT;

// Function to extract FeatureFlagMapping object
function extractFeatureFlagMapping(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /export const FeatureFlagMapping =\s*{([\s\S]+?)}/;
  const match = content.match(regex);

  if (!match || !match[1]) {
    console.error('FeatureFlagMapping object not found');
    process.exit(1);
  }

  const objectContent = '{' + match[1].trim() + '}';
  return eval('(' + objectContent + ')'); // Convert to a JavaScript object
}

try {
  // Read and parse the feature flags
  const featureFlags = extractFeatureFlagMapping(featureFlagFile);

  // Write the parsed flags to the GitHub Actions output file
  fs.appendFileSync(outputFile, `flags=${JSON.stringify(featureFlags)}\n`, 'utf8');
  console.log('Feature flags extracted and written to output.');
} catch (error) {
  console.error('Error reading feature flags:', error);
  process.exit(1);
}
