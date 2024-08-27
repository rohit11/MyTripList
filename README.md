# MyTripList
# Feature Flags Management System

This document provides a comprehensive guide on managing feature flags in your application. The feature flag system allows for dynamic control of feature availability based on application versions, platforms, and other specific conditions.

## Table of Contents

- [Overview](#overview)
- [Feature Flag Table Structure](#feature-flag-table-structure)
- [Business Logic and Priorities](#business-logic-and-priorities)
- [Naming Conventions](#naming-conventions)
- [Use Cases](#use-cases)
- [How to Use This System](#how-to-use-this-system)
- [Best Practices](#best-practices)
- [Conclusion](#conclusion)

## Overview

Feature flags provide a mechanism to control the behavior of application features without deploying new code. This flexibility is crucial for gradual rollouts, A/B testing, and managing features based on different application versions or platforms.

## Feature Flag Table Structure

The feature flags are defined in a table format where each flag has specific conditions for enabling or disabling. This table is maintained in the Lagoon system to centralize feature management.

| Feature Flag Name        | Active | Enable From Minimum Version | Disable From Version iOS | Disable From Version Android |
|--------------------------|--------|-----------------------------|--------------------------|------------------------------|
| feature1                 | false  | 2.0.0                       | 4.0.0                    | -                            |
| feature2                 | true   | 3.0.0                       | -                        | 5.0.0+                       |
| feature3                 | false  | -                           | 4.0.0-5.0.0              | -                            |
| feature4                 | true   | 1.0.0                       | -                        | 4.0.0                        |
| feature5                 | true   | -                           | -                        | -                            |
| feature6                 | false  | -                           | -                        | -                            |
| feature7                 | false  | 1.4.0                       | -                        | -                            |
| feature8_USP             | true   | 1.0.0                       | -                        | 4.0.0                        |
| feature9_UNET            | false  | 1.2.0                       | -                        | -                            |

### Columns Explanation

- **Feature Flag Name:** The unique identifier for each feature flag, used in the code. Population-specific flags are suffixed with `_USP` or `_UNET` to denote different population segments.
- **Active:** The default state of the feature (true for enabled, false for disabled).
- **Enable From Minimum Version:** The minimum version of the app from which the feature should be enabled (applies to both iOS and Android).
- **Disable From Version iOS:** The iOS version or range of versions from which the feature should be disabled.
- **Disable From Version Android:** The Android version or range of versions from which the feature should be disabled.

### Understanding Version Ranges

- **4.0.0-5.0.0:** This indicates that the feature is disabled between versions 4.0.0 and 5.0.0, inclusive. If the app version falls within this range, the feature will be disabled.
- **5.0.0+:** This means that the feature is disabled from version 5.0.0 onwards. Any version greater than or equal to 5.0.0 will have this feature disabled.

### Additional Feature Explanations

- **feature5:**  
  **Condition:** Always enabled (active: true). This feature flag does not have any specific version or platform conditions. It is active by default, meaning it is enabled in all versions and platforms without any additional checks.

- **feature6:**  
  **Condition:** Always disabled (active: false). Like feature5, this feature flag does not have specific version or platform conditions, but it is disabled by default. It remains inactive unless explicitly overridden.

- **feature7:**  
  **Condition:** Disabled by default but becomes enabled starting from version 1.4.0 onwards. This applies to both iOS and Android platforms. If the application version is 1.4.0 or higher, the feature is enabled.

- **feature8_USP:**  
  **Condition:** Enabled by default, starting from version 1.0.0. This feature is specific to the USP population and will be disabled on Android starting from version 4.0.0 onwards.

- **feature9_UNET:**  
  **Condition:** Disabled by default but becomes enabled starting from version 1.2.0. This feature is specific to the UNET population.

## Business Logic and Priorities

### Steps to Determine Feature Flag Status

The system follows these steps, in order of priority, to determine whether a feature should be enabled or disabled:

1. **Override Value Check:**
   - If the feature flag has an override value (e.g., for development or testing purposes), that value takes precedence.

2. **Disable Conditions:**
   - Check if the current app version meets any disable conditions (`Disable From Version iOS` or `Disable From Version Android`). If so, the feature is disabled.

3. **Enable Condition:**
   - Check if the current app version is greater than or equal to the `Enable From Minimum Version`. If so, the feature is enabled.

4. **Active State:**
   - If the feature flag is explicitly marked as inactive (`active: false`), it will be disabled.

5. **Default State:**
   - If none of the above conditions apply, the feature falls back to its default `Active` state as defined in the feature flag table.

### Example Implementation

This is how you can implement the feature flag logic in code (simplified for clarity):

1. **Override Value:** First, check if an override value exists for the feature flag. If so, use that value.
2. **Disable Conditions:** If the app version matches any disable conditions, disable the feature.
3. **Enable Conditions:** If the app version meets the minimum enable condition, enable the feature.
4. **Active State:** If the flag is marked inactive in the table, disable the feature.
5. **Default State:** If no other conditions apply, use the default active state of the feature.

## Naming Conventions

Feature flag names in the configuration should follow a consistent pattern to ensure clarity and prevent errors. Here's the recommended approach:

- **Feature Flag Key in JSON:** Use `SNAKE_CASE` and all uppercase letters (e.g., `ENABLE_VISION_CHIP`).
- **Internal Key Mapping:** Convert to camel case, remove the prefix `ENABLE`, and append `Enabled` to the end (e.g., `isVisionChipEnabled`).
- **Population Suffix:** For population-specific flags, append `_USP` or `_UNET` at the end to denote the specific population.

### Example

- **JSON Key:** `ENABLE_VISION_CHIP`
- **Internal Key:** `isVisionChipEnabled`

- **JSON Key with Population:** `ENABLE_RECENT_DENTAL_VISIT_UNET`
- **Internal Key:** `isRecentDentalVisitEnabled` (applies specifically to the UNET population)

This consistency helps in mapping feature flags from the JSON response to their corresponding internal variables.

## Use Cases

### 1. Feature Enabled from a Minimum Version

**Example:** `feature1`  
- **Condition:** Disabled by default, enabled from version `2.0.0` onwards.
- **Disable on iOS:** Starting from version `4.0.0`.

### 2. Feature Disabled on Android After a Certain Version

**Example:** `feature2`  
- **Condition:** Enabled by default, disabled on Android from version `5.0.0` onwards.

### 3. Feature Disabled in a Specific Version Range on iOS

**Example:** `feature3`  
- **Condition:** Disabled by default.
- **Disable on iOS:** Between versions `4.0.0` and `5.0.0`.

### 4. Feature Enabled with Specific Conditions

**Example:** `feature4`  
- **Condition:** Enabled by default, starting from version `1.0.0`.
- **Disable on Android:** From version `4.0.0` onwards.

### 5. Feature Always Enabled

**Example:** `feature5`  
- **Condition:** Always enabled, no specific conditions or version checks.

### 6. Feature Always Disabled

**Example:** `feature6`  
- **Condition:** Always disabled, no specific conditions or version checks.

### 7. Feature Enabled from Version 1.4.0

**Example:** `feature7`  
- **Condition:** Disabled by default, enabled from version `1.4.0` onwards on both iOS and Android.

### 8. Feature Enabled for a Specific Population

**Example:** `feature8_USP`  
- **Condition:** Enabled by default, specific to the USP population. Disabled on Android from version `4.0.0` onwards.

## How to Use This System

1. **Initialize Feature Flags:**
   - Define the feature flags in your application based on the table structure.
   - Initialize feature flags using `updateFeatureFlagsFromJson` after fetching from the server.

2. **Check Feature Flag Values:**
   - Use `getFeatureFlagValue` to determine if a feature should be enabled or disabled in your codebase.

3. **Override Feature Flags:**
   - Use the `setOverrideFlag` function to locally override feature flag values for development or testing purposes.

4. **Persisting Overrides:**
   - Overrides are persisted using `AsyncStorage` and are only applied in non-production environments (`__DEV__`).

## Best Practices

- **Keep Flags Updated:** Regularly review and update feature flag conditions to reflect the current app state.
- **Use Consistent Naming:** Follow a consistent naming convention for feature flags to ensure clarity.
- **Test Thoroughly:** Always test feature flags in staging before rolling them out in production.
- **Document Changes:** Maintain up-to-date documentation for all feature flags and their conditions.

## Conclusion

In summary, this feature flag management system provides a structured and flexible approach to controlling the availability of features in your application. By leveraging the table structure, clear naming conventions, and a priority-based business logic, developers can easily manage feature rollouts, ensure compatibility across platforms, and adapt to evolving business needs.

The feature flag table maintained in the Lagoon system serves as the single source of truth, ensuring that all stakeholders can understand and manipulate feature states as needed. By following the best practices outlined in this guide, you can effectively manage feature flags in both development and production environments, ensuring a smooth and controlled user experience.
