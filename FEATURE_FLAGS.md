# Feature Flags Documentation

## Feature Flags in `release/1.0.1`
| Count | Key              | release/1.0.1 Value       |
|-------|------------------|---------------------------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` |

## Comparison between `release/1.0.0` and `release/1.0.1`
### New Flags
| Count | Key              | release/1.0.1 Value       | Status |
|-------|------------------|---------------------------|--------|
| 6 | isFeaure5Enabled | `ENABLE_FEATURE_5` | New 🔵 |
| 8 | isFeaure4Enabled | `ENABLE_FEATURE_4` | New 🔵 |

### Deleted Flags
| Count | Key              | release/1.0.1 Value       | Status |
|-------|------------------|---------------------------|--------|
| 11 | isFeaure3Enabled | N/A | Deleted 🔴 |

### Full Feature Flags Comparison
| Count | Key              | release/1.0.1 Value       | Status |
|-------|------------------|---------------------------|--------|
| 6 | isFeaure5Enabled | `ENABLE_FEATURE_5` | New 🔵 |
| 8 | isFeaure4Enabled | `ENABLE_FEATURE_4` | New 🔵 |
| 11 | isFeaure3Enabled | N/A | Deleted 🔴 |
| 1 | isFeaure1Enabled | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| 2 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| 3 | isFeaure2Enabled | `ENABLE_FEATURE_2` | Unchanged ⚪ |
## Feature Flags in `main`
| Count | Key              | main Value       |
|-------|------------------|---------------------------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` |

## Comparison between `release/1.0.1` and `main`
### Full Feature Flags Comparison
| Count | Key              | main Value       | Status |
|-------|------------------|---------------------------|--------|
| 1 | isFeaure5Enabled | `ENABLE_FEATURE_5` | Unchanged ⚪ |
| 2 | isFeaure1Enabled | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| 3 | isFeaure4Enabled | `ENABLE_FEATURE_4` | Unchanged ⚪ |
| 4 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| 5 | isFeaure2Enabled | `ENABLE_FEATURE_2` | Unchanged ⚪ |
