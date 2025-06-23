import { computed, type Ref } from 'vue';
import type { UserProfile } from '../services/userService';

export interface DashboardContentItem {
  id: number;
  title: string;
  slug: string;
  type: string;
  typeLabel: string;
  icon: string;
  color: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  link: string;
  status?: string;
  date?: string;
  modified?: string;
}

export const useDashboard = (profile: Ref<UserProfile | null>) => {
  const publishedContent = computed((): DashboardContentItem[] => {
    if (!profile.value?._embedded) return [];

    const content: DashboardContentItem[] = [];

    // Add published events - handle nested structure
    if (profile.value._embedded['authored:events']?.[0]?._embedded?.events) {
      content.push(
        ...profile.value._embedded['authored:events'][0]._embedded.events.map((event) => ({
          id: event.id,
          title: event.title,
          slug: event.slug,
          type: 'event',
          typeLabel: 'Event',
          icon: 'event',
          color: 'primary',
          link: event.link,
          status: event.status,
          date: event.date,
          modified: event.modified,
          ...(event.city && { city: event.city }),
          ...(event.country && { country: event.country }),
          ...(event.start_date && { start_date: event.start_date }),
          ...(event.end_date && { end_date: event.end_date }),
        })),
      );
    }

    // Add published teachers - handle nested structure
    if (profile.value._embedded['authored:teachers']?.[0]?._embedded?.teachers) {
      content.push(
        ...profile.value._embedded['authored:teachers'][0]._embedded.teachers.map((teacher) => ({
          id: teacher.id,
          title: teacher.title,
          slug: teacher.slug,
          type: 'teacher',
          typeLabel: 'Teacher',
          icon: 'school',
          color: 'secondary',
          link: teacher.link,
          status: teacher.status,
          date: teacher.date,
          modified: teacher.modified,
          ...(teacher.city && { city: teacher.city }),
          ...(teacher.country && { country: teacher.country }),
        })),
      );
    }

    // Add published DJs - handle nested structure
    if (profile.value._embedded['authored:djs']?.[0]?._embedded?.djs) {
      content.push(
        ...profile.value._embedded['authored:djs'][0]._embedded.djs.map((dj) => ({
          id: dj.id,
          title: dj.title,
          slug: dj.slug,
          type: 'dj',
          typeLabel: 'DJ',
          icon: 'music_note',
          color: 'accent',
          link: dj.link,
          status: dj.status,
          date: dj.date,
          modified: dj.modified,
          ...(dj.city && { city: dj.city }),
          ...(dj.country && { country: dj.country }),
        })),
      );
    }

    // Add published event series - handle nested structure
    if (profile.value._embedded['authored:event-series']?.[0]?._embedded?.['event-series']) {
      content.push(
        ...profile.value._embedded['authored:event-series'][0]._embedded['event-series'].map(
          (series) => ({
            id: series.id,
            title: series.title,
            slug: series.slug,
            type: 'event-series',
            typeLabel: 'Event Series',
            icon: 'event_repeat',
            color: 'positive',
            link: series.link,
            status: series.status,
            date: series.date,
            modified: series.modified,
            ...(series.city && { city: series.city }),
            ...(series.country && { country: series.country }),
          }),
        ),
      );
    }

    return content;
  });

  const contentCounts = computed(() => {
    if (!profile.value?.content_counts) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        private: 0,
        scheduled: 0,
      };
    }

    const counts = profile.value.content_counts;
    return {
      total:
        counts.event.published +
        counts.event.draft +
        counts.event.private +
        counts.teacher.published +
        counts.teacher.draft +
        counts.teacher.private +
        counts.dj.published +
        counts.dj.draft +
        counts.dj.private +
        counts.event_series.published +
        counts.event_series.draft +
        counts.event_series.private,
      published:
        counts.event.published +
        counts.teacher.published +
        counts.dj.published +
        counts.event_series.published,
      draft:
        counts.event.draft + counts.teacher.draft + counts.dj.draft + counts.event_series.draft,
      private:
        counts.event.private +
        counts.teacher.private +
        counts.dj.private +
        counts.event_series.private,
      scheduled: 0, // Not available in current API
    };
  });

  return {
    publishedContent,
    contentCounts,
  };
};
