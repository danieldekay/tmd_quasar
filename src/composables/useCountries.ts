/**
 * Comprehensive country code to name mapping
 * Using ISO 3166-1 alpha-2 codes
 */
const COUNTRY_MAP: Record<string, string> = {
  // Major tango countries
  AR: 'Argentina',
  UY: 'Uruguay',
  ES: 'Spain',
  IT: 'Italy',
  FR: 'France',
  DE: 'Germany',
  AT: 'Austria',
  CH: 'Switzerland',
  NL: 'Netherlands',
  BE: 'Belgium',
  GB: 'United Kingdom',
  IE: 'Ireland',
  PT: 'Portugal',
  US: 'United States',
  CA: 'Canada',
  BR: 'Brazil',
  MX: 'Mexico',
  CL: 'Chile',
  PE: 'Peru',
  CO: 'Colombia',
  VE: 'Venezuela',
  EC: 'Ecuador',
  BO: 'Bolivia',
  PY: 'Paraguay',

  // European countries
  NO: 'Norway',
  SE: 'Sweden',
  DK: 'Denmark',
  FI: 'Finland',
  IS: 'Iceland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  HU: 'Hungary',
  SI: 'Slovenia',
  HR: 'Croatia',
  RS: 'Serbia',
  BA: 'Bosnia and Herzegovina',
  ME: 'Montenegro',
  MK: 'North Macedonia',
  AL: 'Albania',
  BG: 'Bulgaria',
  RO: 'Romania',
  MD: 'Moldova',
  UA: 'Ukraine',
  BY: 'Belarus',
  LT: 'Lithuania',
  LV: 'Latvia',
  EE: 'Estonia',
  RU: 'Russia',
  GR: 'Greece',
  CY: 'Cyprus',
  MT: 'Malta',
  TR: 'Turkey',

  // Asia-Pacific
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  ID: 'Indonesia',
  AU: 'Australia',
  NZ: 'New Zealand',
  IN: 'India',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',

  // Africa
  ZA: 'South Africa',
  EG: 'Egypt',
  MA: 'Morocco',
  TN: 'Tunisia',
  KE: 'Kenya',
  NG: 'Nigeria',

  // Additional countries that might appear
  LU: 'Luxembourg',
  LI: 'Liechtenstein',
  AD: 'Andorra',
  MC: 'Monaco',
  SM: 'San Marino',
  VA: 'Vatican City',
  GL: 'Greenland',
  FO: 'Faroe Islands',
};

export interface CountryOption {
  code: string;
  name: string;
}

export const useCountries = () => {
  /**
   * Get country name from ISO code
   */
  const getCountryName = (code: string): string => {
    if (!code) return '';
    return COUNTRY_MAP[code.toUpperCase()] || code;
  };

  /**
   * Get all available countries as options for dropdowns
   * Returns array of {code, name} objects sorted by name
   */
  const getAllCountryOptions = (): CountryOption[] => {
    return Object.entries(COUNTRY_MAP)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  /**
   * Get country options from a set of country codes
   * Useful for filtering dropdown options based on available data
   */
  const getCountryOptionsFromCodes = (codes: Set<string>): CountryOption[] => {
    return Array.from(codes)
      .map((code) => ({
        code,
        name: getCountryName(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  /**
   * Check if a country code is valid
   */
  const isValidCountryCode = (code: string): boolean => {
    return code.toUpperCase() in COUNTRY_MAP;
  };

  /**
   * Get country code from country name (reverse lookup)
   */
  const getCountryCode = (name: string): string | undefined => {
    const entry = Object.entries(COUNTRY_MAP).find(
      ([, countryName]) => countryName.toLowerCase() === name.toLowerCase(),
    );
    return entry?.[0];
  };

  return {
    getCountryName,
    getAllCountryOptions,
    getCountryOptionsFromCodes,
    isValidCountryCode,
    getCountryCode,
  };
};
