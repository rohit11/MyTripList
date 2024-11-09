const fs = require('fs');
const path = require('path');

// Path to the feature flags file
const featureFlagFilePath = path.resolve(__dirname, process.env.FEATURE_FLAG_FILE || 'FeatureFlags.tsx');

// Read the content of the file
const content = fs.readFileSync(featureFlagFilePath, 'utf8');

// Extract FeatureFlagMapping object with regex
const match = content.match(/export const FeatureFlagMapping =\s*{([\s\S]+?)}/);

if (!match || !match[1]) {
  console.error('FeatureFlagMapping object not found in FeatureFlags.tsx');
  process.exit(1);
}

const objectContent = '{' + match[1].trim() + '}';

// Parse the object content
const FeatureFlagMapping = eval('(' + objectContent + ')');

// Output key=value pairs
for (const [key, value] of Object.entries(FeatureFlagMapping)) {
  console.log(`${key}=${value}`);
}
