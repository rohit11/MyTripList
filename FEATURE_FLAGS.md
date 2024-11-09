# Feature Flags Documentation

## Comparison between `release/1.0.0` and `main`
### New Flags
| Key | release/1.0.0 Value | main Value | Status |
|-----|--------------------|--------------------|--------|
| isFeaure5Enabled | N/A | `ENABLE_FEATURE_5` | **New 🔵** |
| isFeaure4Enabled | N/A | `ENABLE_FEATURE_4` | **New 🔵** |

### Deleted Flags
| Key | release/1.0.0 Value | main Value | Status |
|-----|--------------------|--------------------|--------|
| isFeaure3Enabled | `ENABLE_FEATURE_3` | N/A | **Deleted 🔴** |

### Full Feature Flags Comparison
| Count | Key | release/1.0.0 Value | main Value | Status |
|-------|-----|--------------------|--------------------|--------|
| 1 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | **Unchanged ⚪** |
| 2 | isFeaure3Enabled | `ENABLE_FEATURE_3` | `N/A` | **Deleted 🔴** |
| 3 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | **Unchanged ⚪** |
| 4 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | **Unchanged ⚪** |
| 5 | isFeaure5Enabled | `N/A` | `ENABLE_FEATURE_5` | **New 🔵** |
| 6 | isFeaure4Enabled | `N/A` | `ENABLE_FEATURE_4` | **New 🔵** |
