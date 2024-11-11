# Feature Flags Documentation

## Comparison: release/1.0.1 vs. release/1.0.0 (New, Updated, Deleted Flags)
### New Flags
| release/1.0.1 Value | release/1.0.0 Value | Status |
|----------------------|------------------------|--------|
| `ENABLE_FEATURE_5` | N/A | New 🔵 |
| `ENABLE_FEATURE_4` | N/A | New 🔵 |

### Deleted Flags
| release/1.0.1 Value | release/1.0.0 Value | Status |
|----------------------|------------------------|--------|
| N/A | `ENABLE_FEATURE_3` | Deleted 🔴 |

## Comparison: main vs. release/1.0.1 (New, Updated, Deleted Flags)
## Feature Flags in `release/1.0.1`
| Count | release/1.0.1 Value |
|-------|---------------------|
| 1 | `ENABLE_FEATURE_5` |
| 2 | `ENABLE_FEATURE_1` |
| 3 | `ENABLE_FEATURE_4` |
| 4 | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | `ENABLE_FEATURE_2` |

### Full Comparison: release/1.0.1 vs. release/1.0.0 (Full Comparison)
| release/1.0.1 Value | release/1.0.0 Value | Status |
|----------------------|------------------------|--------|
| `ENABLE_FEATURE_5` | `N/A` | New 🔵 |
| `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| `ENABLE_FEATURE_4` | `N/A` | New 🔵 |
| `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | Unchanged ⚪ |
| N/A | `ENABLE_FEATURE_3` | Deleted 🔴 |

## Feature Flags in `main`
| Count | main Value |
|-------|---------------------|
| 1 | `ENABLE_FEATURE_5` |
| 2 | `ENABLE_FEATURE_1` |
| 3 | `ENABLE_FEATURE_4` |
| 4 | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` |
| 5 | `ENABLE_FEATURE_2` |

### Full Comparison: main vs. release/1.0.1 (Full Comparison)
| main Value | release/1.0.1 Value | Status |
|----------------------|------------------------|--------|
| `ENABLE_FEATURE_5` | `ENABLE_FEATURE_5` | Unchanged ⚪ |
| `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | Unchanged ⚪ |
| `ENABLE_FEATURE_4` | `ENABLE_FEATURE_4` | Unchanged ⚪ |
| `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | Unchanged ⚪ |
| `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | Unchanged ⚪ |

