export const useFormatters = () => {
  /**
   * Format a date-like value to ISO YYYY-MM-DD (empty string on failure)
   */
  const formatDate = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return '';

    const date = typeof value === 'number' ? new Date(value) : new Date(String(value));
    if (Number.isNaN(date.getTime())) return '';

    const isoDate = date.toISOString().split('T')[0] ?? '';
    return isoDate;
  };

  /**
   * Build a human-readable location from city / country.
   */
  const formatLocation = (city?: string | null, country?: string | null): string => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return '—';
  };

  return {
    formatDate,
    formatLocation,
  };
};
