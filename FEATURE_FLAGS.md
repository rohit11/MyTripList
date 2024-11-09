# Feature Flags Documentation

## Comparison between `release/1.0.1` and `main`
### New Flags
| Key | release/1.0.1 Value | main Value | Status |
|-----|--------------------|--------------------|--------|
| isFeaure5Enabled | N/A | `ENABLE_FEATURE_5` | **New 🔵** |

### Full Feature Flags Comparison
| Count | Key | release/1.0.1 Value | main Value | Status |
|-------|-----|--------------------|--------------------|--------|
| 1 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | **Unchanged ⚪** |
| 2 | isFeaure4Enabled | `ENABLE_FEATURE_4` | `ENABLE_FEATURE_4` | **Unchanged ⚪** |
| 3 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | **Unchanged ⚪** |
| 4 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | **Unchanged ⚪** |
| 5 | isFeaure5Enabled | `N/A` | `ENABLE_FEATURE_5` | **New 🔵** |
## Comparison between `release/1.0.1` and `release/1.0.0`
### New Flags
| Key | release/1.0.1 Value | release/1.0.0 Value | Status |
|-----|--------------------|--------------------|--------|
| isFeaure3Enabled | N/A | `ENABLE_FEATURE_3` | **New 🔵** |

### Deleted Flags
| Key | release/1.0.1 Value | release/1.0.0 Value | Status |
|-----|--------------------|--------------------|--------|
| isFeaure4Enabled | `ENABLE_FEATURE_4` | N/A | **Deleted 🔴** |

### Full Feature Flags Comparison
| Count | Key | release/1.0.1 Value | release/1.0.0 Value | Status |
|-------|-----|--------------------|--------------------|--------|
| 1 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | **Unchanged ⚪** |
| 2 | isFeaure4Enabled | `ENABLE_FEATURE_4` | `N/A` | **Deleted 🔴** |
| 3 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | **Unchanged ⚪** |
| 4 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | **Unchanged ⚪** |
| 5 | isFeaure3Enabled | `N/A` | `ENABLE_FEATURE_3` | **New 🔵** |
