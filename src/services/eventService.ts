import { eventDetailsService } from './eventDetailsService';
import { eventListService } from './eventListService';

/**
 * Legacy aggregate service combining the specialised list/detail services.
 * Components are encouraged to import `eventListService` or `eventDetailsService` directly,
 * but `eventService` remains available for backward compatibility.
 */
export const eventService = {
  ...eventListService,
  ...eventDetailsService,
};

export { eventListService, eventDetailsService };
