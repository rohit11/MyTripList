# Feature Flags Documentation

> **Comparison between `main` and `  release/1.0.0`**

| Count | Key | Release Value (`  release/1.0.0`) | Main Value | Status |
|-------|-----|-------------------------------|------------|--------|
| 1 | isFeaure1Enabled | `ENABLE_FEATURE_1` | `ENABLE_FEATURE_1` | **Unchanged ⚪** |
| 2 | isFeaure3Enabled | `ENABLE_FEATURE_3` | `N/A` | **Updated 🟡** |
| 3 | isFeaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Enabled | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | `ENABLE_Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure3Feaure_3` | **Unchanged ⚪** |
| 4 | isFeaure2Enabled | `ENABLE_FEATURE_2` | `ENABLE_FEATURE_2` | **Unchanged ⚪** |
| 5 | isFeaure4Enabled | `N/A` | `ENABLE_FEATURE_4` | **New 🔵** |
