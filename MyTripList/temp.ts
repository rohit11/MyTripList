import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { version as moduleVersion } from '../../../package.json';
import { LagoonTables } from '../../constants';
import { useLagoon } from '../../hooks/useLagoon';
import { FeatureFlagConfigItem } from '../../LagoonItemInterfaces';

// Create a constant mapping of feature flag keys to their corresponding strings
const FeatureFlagMapping = {
    isVisionChipEnabled: 'ENABLE_VISION_CHIP',
    isAnalyticsTrackBackEnabled: 'ENABLE_ANALYTICS_TRACK_BACK',
    isAnalyticsV1Enabled: 'ENABLE_ANALYTICS_V1',
    isTrackScreenLoadEnabled: 'ENABLE_TRACK_SCREEN_LOAD',
    isConsoleLogsEnabled: 'ENABLE_CONSOLE_LOGS',
    isCostExperienceNativeEnabled: 'ENABLE_COST_EXPERIENCE_NATIVE',
    isCountySearchAlertEnabled: 'ENABLE_COUNTY_SEARCH_ALERT',
    isIdentifyNonTieredProviderLocationsEnabled: 'ENABLE_IDENTIFY_NON_TIERED_PROVIDER_LOCATIONS',
    isFirstVisitModalEnabled: 'ENABLE_FIRST_VISIT_MODAL',
    isLowLatencyModeEnabled: 'ENABLE_LLM',
    isMedicalReferralsActiveEnabled: 'ENABLE_MEDICAL_REFERRALS_ACTIVE',
    isMockCompareCardEnabled: 'ENABLE_MOCK_COMPARE_CARD',
    isNewLocationSelectionFlowEnabled: 'ENABLE_NEW_LOCATION_SELECTION_FLOW',
    isPreferredFacilityIdentificationEnabled: 'ENABLE_PREFERRED_FACILITY_IDENTIFICATION',
    isShowEapTileEnabled: 'ENABLE_SHOW_EAP_TILE',
    isUpcomingAvailabilityEnabled: 'ENABLE_UPCOMING_AVAILABILITY',
    isAcoFilterEnabled: 'ENABLE_ACO_FILTER',
    isFilterBitesEnabled: 'ENABLE_FILTER_BITES',
    isShowSelectedLocationAcoProviderEnabled: 'ENABLE_SHOW_SELECTED_LOCATION_ACO_PROVIDER',
    isShowEthnicityEnabled: 'ENABLE_SHOW_ETHNICITY',
    isRecentDentalVisitEnabled: 'ENABLE_RECENT_DENTAL_VISIT',
    isRecentVisionVisitEnabled: 'ENABLE_RECENT_VISION_VISIT',
    isExtendedTypeaheadAnalyticsEnabled: 'ENABLE_EXTENDED_TYPEAHEAD_ANALYTICS',
    isPlanningForCareEnabled: 'ENABLE_PLANNING_FOR_CARE',
    isSuppressBehavioralHealthContentEnabled: 'ENABLE_SUPPRESS_BEHAVIORAL_HEALTH_CONTENT',
    isPreferredFacilitySearchEnabled: 'ENABLE_PREFERRED_FACILITY_SEARCH',
    isBehavioralVirtualPsuedocodesEnabled: 'ENABLE_BEHAVIORAL_VIRTUAL_PSUEDOCODES',
    isPreferredProviderBadgeEnabled: 'ENABLE_PREFERRED_PROVIDER_BADGE',
    isAnalyticsPcpSelectionFlowEnabled: 'ENABLE_ANALYTICS_PCP_SELECTION_FLOW',
    isAnalyticsErrorNullSearchPageEnabled: 'ENABLE_ANALYTICS_ERROR_NULL_SEARCH_PAGE',
    isAnalyticsErrorNullStatePageEnabled: 'ENABLE_ANALYTICS_ERROR_NULL_STATE_PAGE',
    isAnalyticsMixedResultsPageEnabled: 'ENABLE_ANALYTICS_MIXED_RESULTS_PAGE',
    isAnalyticsIntroViewOfPsVideoEnabled: 'ENABLE_ANALYTICS_INTRO_VIEW_OF_PSX_VIDEO',
    isNewPreferredFacilityL2PageEnabled: 'ENABLE_NEW_PREFERRED_FACILITY_L2_PAGE',
    isAutocompleteCaptureResultsEnabled: 'ENABLE_AUTOCOMPLETE_CAPTURE_RESULTS',
    isAnalyticsMapViewEnabled: 'ENABLE_ANALYTICS_MAP_VIEW',
    isAnalyticsFindCareLandingPageEnabled: 'ENABLE_ANALYTICS_FIND_CARE_LANDING_PAGE',
    isDisplayAvailabilityProviderDetailsEnabled: 'ENABLE_DISPLAY_AVAILABILITY_PROVIDER_DETAILS',
    isCosmosEnabled: 'ENABLE_COSMOS',
    isTypeaheadGeneralSearchEnabled: 'ENABLE_TYPEAHEAD_GENERAL_SEARCH',
    isPsxProviderRecommendationsEnabled: 'ENABLE_PSX_PROVIDER_RECOMMENDATIONS',
    isOxfordPlnFlagEnabled: 'ENABLE_OXFORD_PLN_FLAG',
    isAutocompleteRollUpCodeNameSearchEnabled: 'ENABLE_AUTOCOMPLETE_ROLL_UP_CODE_NAME_SEARCH',
    isPcpTerminationDateEnabled: 'ENABLE_PCP_TERMINATION_DATE',
    isShowAcceptsMedicaidEnabled: 'ENABLE_SHOW_ACCEPTS_MEDICAID',
    isAnalyticsListViewPageEnabled: 'ENABLE_ANALYTICS_LIST_VIEW_PAGE',
    isAdditionalResourcesEnabled: 'ENABLE_ADDITIONAL_RESOURCES',
    isProgramsDisplayEnabled: 'ENABLE_PROGRAMS_DISPLAY',
    isPreEffectivePlansEnabled: 'ENABLE_PRE_EFFECTIVE_PLANS',
    isShowIsPreEffectiveIndicatorEnabled: 'ENABLE_SHOW_IS_PRE_EFFECTIVE_INDICATOR',
    isFindEligiblePCPBannerEnabled: 'ENABLE_FIND_ELIGIBLE_PCP_BANNER',
    isLlmEnabled: 'ENABLE_LLM'
} as const;

// Extract the keys to create a type
type FeatureFlagKeys = keyof typeof FeatureFlagMapping;

// Create a constant array of keys if needed
const featureFlagKeys: FeatureFlagKeys[] = Object.keys(FeatureFlagMapping) as FeatureFlagKeys[];

console.log(featureFlagKeys); // Logs all the keys from FeatureFlagMapping

// Example: Access a specific value by key
console.log(FeatureFlagMapping.isVisionChipEnabled); // Outputs: ENABLE_VISION_CHIP

function createDefaultFeatureFlags<T>(): T {
    const defaultFlags = {} as Record<keyof T, boolean>;

    // Iterating over all keys of the type and assigning false as the default value
    (Object.keys(defaultFlags) as Array<keyof T>).forEach((key) => {
        defaultFlags[key] = false;
    });

    return defaultFlags as T;
}

const defaultFeatureFlags = createDefaultFeatureFlags<DefaultFeatureFlags>();

const defaultFeatureFlags = {
  isVisionChipEnabled: false,
  isAnalyticsTrackBackEnabled: true,
  isAnalyticsV1Enabled: true,
  isTrackScreenLoadEnabled: true,
  isConsoleLogsEnabled: true,
  isCostExperienceNativeEnabled: true,
  isCountySearchAlertEnabled: true,
  isIdentifyNonTieredUSPProviderLocationsEnabled: true,
  isIdentifyNonTieredUNETProviderLocationsEnabled: true,
  isFirstVisitModalShown: true,
  isLowLatencyModeEnabled: true,
  isMedicalReferralsActive: false,
  isMockCompareCardEnabled: false,
  isNewLocationSelectionFlowEnabled: true,
  isPreferredFacilityIdentificationEnabled: true,
  isShowEapTileEnabled: true,
  isUpcomingAvailabilityEnabled: true,
  isAcoFilterEnabled: false,
  isFilterBitesEnabled: false,
  isShowSelectedLocationAcoProviderEnabled: true,
  isShowEthnicityEnabled: false,
  isRecentDentalVisitEnabled: false,
  isRecentVisionVisitEnabled: false,
  isExtendedTypeaheadAnalyticsEnabled: true,
  isPlanningForCareEnabled: false,
  isSuppressBehavioralHealthContentEnabled: true,
  isPreferredFacilitySearchEnabled: true,
  isBehavioralVirtualPsuedocodesEnabled: true,
  isPreferredProviderBadgeEnabled: true,
  isAnalyticsPcpSelectionFlowEnabled: false,
  isAnalyticsErrorNullSearchPageEnabled: false,
  isAnalyticsErrorNullStatePageEnabled: true,
  isAnalyticsMixedResultsPageEnabled: true,
  isAnalyticsIntroViewOfPsxVideoEnabled: true,
  isNewPreferredFacilityL2PageEnabled: true,
  isAutocompleteCaptureResultsEnabled: true,
  isAnalyticsMapViewEnabled: true,
  isAnalyticsFindCareLandingPageEnabled: true,
  isDisplayAvailabilityProviderDetailsEnabled: true,
  isCosmosEnabled: true,
  isTypeaheadGeneralSearchEnabled: true,
  isPsxProviderRecommendationsEnabled: true,
  isOxfordPlnFlagEnabled: true,
  isAutocompleteRollUpCodeNameSearchEnabled: true,
  isPcpTerminationDateEnabled: false,
  isShowAcceptsMedicaidEnabled: true,
  isAnalyticsListViewPageEnabled: true,
  isAdditionalResourcesEnabled: true,
  isProgramsDisplayEnabled: true,
  isPreEffectivePlansEnabled: true,
  isShowIsPreEffectiveIndicatorEnabled: true,
  isFindEligiblePCPBannerEnabled: true,
  isLlmEnabled: true
} as const;

type FeatureFlags = typeof defaultFeatureFlags;

const FeatureFlagContext = createContext<{
  flags: FeatureFlags;
  setOverrideFlag: (key: keyof FeatureFlags, value: boolean) => void;
  updateFeatureFlagsFromJson: (flagsJson: FeatureFlagConfigItem[], population?: string | null | undefined) => void;
}>({
  flags: defaultFeatureFlags,
  setOverrideFlag: async () => await Promise.resolve(),
  updateFeatureFlagsFromJson: () => {},
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

const generateFeatureFlagKey = (key: string): keyof FeatureFlags => {
  const camelCaseKey = key.replace(/^ENABLE_?/, '').replace(/_(.)/g, (_, letter) => letter.toUpperCase());
  return `is${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}Enabled` as keyof FeatureFlags;
};

const OVERRIDE_STORAGE_KEY = 'featureFlagOverrides';

const loadOverrides = async (): Promise<Partial<FeatureFlags>> => {
  try {
    const overridesJson = await AsyncStorage.getItem(OVERRIDE_STORAGE_KEY);
    return overridesJson ? JSON.parse(overridesJson) : {};
  } catch (e) {
    console.error('Failed to load feature flag overrides:', e);
    return {};
  }
};

const saveOverrides = async (overrides: Partial<FeatureFlags>): Promise<void> => {
  if (!__DEV__) return;
  try {
    await AsyncStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save feature flag overrides:', e);
  }
};

export const FeatureFlagProvider = ({ children, lob, population }: { children: ReactNode, lob: string, population?: string | null | undefined }): JSX.Element => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);
  const [overrides, setOverrides] = useState<Partial<FeatureFlags>>({});
  const lagoonConfig = useLagoon(LagoonTables.POC_FEATURE_FLAGS);
  const flagRef = useRef(flags);

  useEffect(() => {
    flagRef.current = flags;
  }, [flags]);

  const setOverrideFlag = async (key: keyof FeatureFlags, value: boolean): Promise<void> => {
    if (!__DEV__) return;
    const newOverrides = { ...overrides, [key]: value };
    setOverrides(newOverrides);
    setFlags((prevFlags) => {
      const newFlags = { ...prevFlags, [key]: value };
      flagRef.current = newFlags;
      return newFlags;
    });
    await saveOverrides(newOverrides);
  };

  const updateFeatureFlagsFromJson = (flagsJson: FeatureFlagConfigItem[], population?: string | null | undefined): void => {
    if (!flagsJson || !Array.isArray(flagsJson)) return;

    const updatedFlags: FeatureFlags = { ...defaultFeatureFlags };
    const populationUpperCase = population?.toUpperCase() || null;

    flagsJson.forEach((flag: FeatureFlagConfigItem) => {
      const internalKey = generateFeatureFlagKey(flag.key);
      if (populationUpperCase && flag.key.endsWith(`_${populationUpperCase}`)) {
        const baseKey = flag.key.replace(`_${populationUpperCase}`, '');
        const baseInternalKey = generateFeatureFlagKey(baseKey);
        if (baseInternalKey in updatedFlags) {
          updatedFlags[baseInternalKey] = flag.active ?? getFeatureFlagValue(baseInternalKey, flagsJson);
        }
      } else if (internalKey in updatedFlags) {
        updatedFlags[internalKey] = flag.active ?? getFeatureFlagValue(internalKey, flagsJson);
      }
    });

    if (JSON.stringify(flagRef.current) !== JSON.stringify(updatedFlags)) {
      flagRef.current = updatedFlags;
      setFlags(updatedFlags);
    }
  };

  useEffect(() => {
    const initializeFlags = async (): Promise<void> => {
      const savedOverrides = await loadOverrides();
      setOverrides(savedOverrides);
      setFlags((prevFlags) => ({ ...prevFlags, ...savedOverrides }));
    };

    initializeFlags();
  }, []);

  useEffect(() => {
    if (lagoonConfig && lob) {
      const lagoonConfigData = lagoonConfig();
      updateFeatureFlagsFromJson(lagoonConfigData, population);
    }
  }, [lagoonConfig, lob, population]);

  const contextValue = useMemo(() => ({
    flags,
    setOverrideFlag,
    updateFeatureFlagsFromJson,
  }), [flags]);

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

const getFeatureFlagValue = (
  featureKey: keyof FeatureFlags,
  featureFlagsJson?: FeatureFlagConfigItem[],
  overrides: Partial<FeatureFlags> = {}
): boolean => {
  const currentVersion = moduleVersion;

  if (__DEV__ && overrides[featureKey] !== undefined) {
    return overrides[featureKey]!;
  }

  if (!featureFlagsJson) {
    return defaultFeatureFlags[featureKey];
  }

  const flagConfig = featureFlagsJson.find(flag => generateFeatureFlagKey(flag.key) === featureKey);

  if (!flagConfig) {
    return defaultFeatureFlags[featureKey];
  }

  const platform = Platform.OS;
  if (platform === 'ios' && shouldDisableFeature(currentVersion, flagConfig.disableFromVersionIOS)) {
    return false;
  }
  if (platform === 'android' && shouldDisableFeature(currentVersion, flagConfig.disableFromVersionAndroid)) {
    return false;
  }

  if (isVersionGreaterOrEqual(currentVersion, flagConfig.enableMinimumVersion)) {
    return true;
  }

  if (flagConfig.active !== undefined) {
    return flagConfig.active;
  }

  return defaultFeatureFlags[featureKey];
};

const isVersionGreaterOrEqual = (currentVersion: string, targetVersion?: string): boolean => {
  if (!targetVersion || !currentVersion) return false;

  const current = extractVersion(currentVersion).split('.').map(Number);
  const target = extractVersion(targetVersion).split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, target.length); i++) {
    const currentPart = !isNaN(current[i]) ? current[i] : 0;
    const targetPart = !isNaN(target[i]) ? target[i] : 0;

    if (currentPart > targetPart) return true;
    if (currentPart < targetPart) return false;
  }
  return true;
};

const extractVersion = (version: string): string => {
  if (!version || version.trim() === '') return '';
  const match = version.match(/^\d+\.\d+\.\d+/);
  return match ? match[0] : '';
};

const shouldDisableFeature = (currentVersion: string, disableVersion?: string): boolean => {
  if (!disableVersion) return false;

  if (disableVersion.includes('-')) {
    return isVersionInRange(currentVersion, disableVersion);
  } else if (disableVersion.endsWith('+')) {
    return isVersionGreaterOrEqual(currentVersion, disableVersion.replace('+', ''));
  } else {
    return currentVersion === disableVersion;
  }
};

const isVersionInRange = (currentVersion: string, range: string): boolean => {
  const [startVersion, endVersion] = range.split('-');
  const isGreaterOrEqualStart = isVersionGreaterOrEqual(currentVersion, startVersion);
  const isLessOrEqualEnd = !endVersion || isVersionGreaterOrEqual(endVersion, currentVersion);

  return isGreaterOrEqualStart && isLessOrEqualEnd;
};
