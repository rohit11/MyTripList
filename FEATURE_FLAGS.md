# Feature Flags Documentation

## Feature Flags in `release/1.0.1`
| Count | Key              | release/1.0.1 Value       | release/1.0.0 Value    |
|-------|------------------|---------------------------|---------------------------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | `N/A` |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` | `N/A` |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` |

## Comparison between `release/1.0.1` and `release/1.0.0`
### New Flags
| Count | Key              | release/1.0.1 Value       | release/1.0.0 Value    | Status |
|-------|------------------|---------------------------|---------------------------|--------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | N/A | New 🔵 |
| 2 | isFeaure4Enabled | `ENABLE_FEATURE_4` | N/A | New 🔵 |

### Deleted Flags
| Count | Key              | release/1.0.1 Value       | release/1.0.0 Value    | Status |
|-------|------------------|---------------------------|---------------------------|--------|
| 1 | isFeaure3Enabled | N/A | `ENABLE_FEATURE_3` | Deleted 🔴 |

### Full Feature Flags Comparison
| Count | Key              | release/1.0.1 Value       | release/1.0.0 Value    | Status |
|-------|------------------|---------------------------|---------------------------|--------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | N/A | New 🔵 |
| 2 | isFeaure4Enabled | `ENABLE_FEATURE_4` | N/A | New 🔵 |
| 3 | isFeaure3Enabled | N/A | `ENABLE_FEATURE_3` | Deleted 🔴 |
| 4 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| 5 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| 6 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | Unchanged ⚪ |
## Feature Flags in `main`
| Count | Key              | main Value       | release/1.0.1 Value    |
|-------|------------------|---------------------------|---------------------------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | `ENABLE_FEATURE_5` |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` | `ENABLE_FEATURE_4` |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` |

## Comparison between `main` and `release/1.0.1`
### Full Feature Flags Comparison
| Count | Key              | main Value       | release/1.0.1 Value    | Status |
|-------|------------------|---------------------------|---------------------------|--------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | `ENABLE_FEATURE_5` | Unchanged ⚪ |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` | `ENABLE_FEATURE_4` | Unchanged ⚪ |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | Unchanged ⚪ |
