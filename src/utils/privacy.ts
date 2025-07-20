/**
 * Privacy compliance utilities for GDPR, CCPA, and other privacy regulations
 */

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: string;
}

export interface PersonalData {
  type: 'user_profile' | 'interaction' | 'preference' | 'session';
  data: Record<string, unknown>;
  purposes: string[];
  retention_period?: number; // in days
  collected_at: number;
}

const CONSENT_STORAGE_KEY = 'tmd_user_consent';
const PERSONAL_DATA_KEY = 'tmd_personal_data';
const CURRENT_CONSENT_VERSION = '1.0';

/**
 * Default consent preferences (only necessary cookies allowed)
 */
const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now(),
  version: CURRENT_CONSENT_VERSION,
};

/**
 * Get user's consent preferences
 */
export const getConsentPreferences = (): ConsentPreferences => {
  if (typeof localStorage === 'undefined') return DEFAULT_CONSENT;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return DEFAULT_CONSENT;

    const consent = JSON.parse(stored) as ConsentPreferences;
    
    // Check if consent is outdated (older than 12 months)
    const twelveMonthsAgo = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000);
    if (consent.timestamp < twelveMonthsAgo) {
      return DEFAULT_CONSENT;
    }

    // Check if consent version is outdated
    if (consent.version !== CURRENT_CONSENT_VERSION) {
      return DEFAULT_CONSENT;
    }

    return consent;
  } catch (error) {
    console.warn('Failed to load consent preferences:', error);
    return DEFAULT_CONSENT;
  }
};

/**
 * Save user's consent preferences
 */
export const saveConsentPreferences = (preferences: Partial<ConsentPreferences>): void => {
  if (typeof localStorage === 'undefined') return;

  const consent: ConsentPreferences = {
    ...getConsentPreferences(),
    ...preferences,
    necessary: true, // Always required
    timestamp: Date.now(),
    version: CURRENT_CONSENT_VERSION,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error('Failed to save consent preferences:', error);
  }
};

/**
 * Check if user has given consent for a specific purpose
 */
export const hasConsent = (purpose: keyof ConsentPreferences): boolean => {
  if (purpose === 'necessary') return true; // Always allowed
  
  const consent = getConsentPreferences();
  return consent[purpose] === true;
};

/**
 * Log collection of personal data (for audit trail)
 */
export const logPersonalDataCollection = (data: Omit<PersonalData, 'collected_at'>): void => {
  if (!hasConsent('necessary')) return; // Only log if necessary consent given

  const entry: PersonalData = {
    ...data,
    collected_at: Date.now(),
  };

  try {
    if (typeof sessionStorage !== 'undefined') {
      const existingLog = sessionStorage.getItem(PERSONAL_DATA_KEY);
      const log = existingLog ? JSON.parse(existingLog) : [];
      
      // Keep only last 100 entries to prevent storage bloat
      log.push(entry);
      if (log.length > 100) {
        log.splice(0, log.length - 100);
      }
      
      sessionStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(log));
    }
  } catch (error) {
    console.warn('Failed to log personal data collection:', error);
  }
};

/**
 * Get collected personal data log
 */
export const getPersonalDataLog = (): PersonalData[] => {
  if (typeof sessionStorage === 'undefined') return [];

  try {
    const stored = sessionStorage.getItem(PERSONAL_DATA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load personal data log:', error);
    return [];
  }
};

/**
 * Clear all personal data (for data deletion requests)
 */
export const clearPersonalData = async (): Promise<void> => {
  try {
    // Clear consent preferences
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    }

    // Clear personal data log
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(PERSONAL_DATA_KEY);
    }

    // Clear authentication tokens
    const { clearJWTTokens } = await import('./cookies');
    clearJWTTokens();

    // Clear CSRF tokens
    const { clearCSRFToken } = await import('./csrf');
    clearCSRFToken();

    console.log('Personal data cleared successfully');
  } catch (error) {
    console.error('Failed to clear personal data:', error);
  }
};

/**
 * Check if user needs to provide consent (first visit or consent expired)
 */
export const needsConsentBanner = (): boolean => {
  const consent = getConsentPreferences();
  const twelveMonthsAgo = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000);
  
  return (
    consent.timestamp === DEFAULT_CONSENT.timestamp || // First visit
    consent.timestamp < twelveMonthsAgo || // Expired
    consent.version !== CURRENT_CONSENT_VERSION // Outdated version
  );
};

/**
 * Generate data processing disclosure text
 */
export const getDataProcessingDisclosure = (): string => {
  return `
    We process your personal data for the following purposes:
    - Authentication and account management (necessary)
    - Improving our services (analytics, with consent)
    - Personalizing your experience (preferences, with consent)
    - Marketing communications (marketing, with consent)
    
    Your data is stored securely and will be deleted in accordance with our retention policy.
    You can withdraw consent at any time by clearing your browser data or contacting us.
  `.trim();
};

/**
 * Anonymize personal data for analytics
 */
export const anonymizeForAnalytics = (data: Record<string, unknown>): Record<string, unknown> => {
  const anonymized = { ...data };
  
  // Remove or hash sensitive fields
  const sensitiveFields = ['email', 'username', 'name', 'ip', 'user_id', 'id'];
  
  sensitiveFields.forEach(field => {
    if (field in anonymized) {
      delete anonymized[field];
    }
  });

  // Add anonymized session identifier
  anonymized.session_hash = crypto.getRandomValues(new Uint32Array(1))[0]?.toString(16);
  
  return anonymized;
};