<template>
  <div class="content-list">
    <q-list>
      <q-item
        v-for="item in content"
        :key="`${item.type}-${item.id}`"
        class="content-item q-mb-sm"
        clickable
        @click="$emit('view', item)"
      >
        <q-item-section avatar>
          <q-avatar :color="item.color" text-color="white" :icon="item.icon" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
          <q-item-label caption>
            <q-chip :color="item.color" text-color="white" dense size="sm" :icon="item.icon">
              {{ item.typeLabel }}
            </q-chip>
            <span v-if="item.city || item.country" class="q-ml-sm">
              {{ formatLocation(item.city, item.country) }}
            </span>
            <span v-if="item.start_date" class="q-ml-sm">
              {{ formatDate(item.start_date) }}
            </span>
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="visibility"
              @click.stop="$emit('view', item)"
              title="View content"
            />
            <q-btn
              flat
              round
              dense
              color="secondary"
              icon="edit"
              @click.stop="$emit('edit', item)"
              title="Edit content"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

interface ContentItem {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  icon: string;
  color: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  link?: string;
}

interface Props {
  content: ContentItem[];
}

defineProps<Props>();

defineEmits<{
  view: [item: ContentItem];
  edit: [item: ContentItem];
}>();

const formatLocation = (city?: string, country?: string): string => {
  if (city && country) {
    const countryName = getCountryName(country);
    return `${city}, ${countryName}`;
  }
  if (city) return city;
  if (country) return getCountryName(country);
  return '';
};
</script>

<style lang="scss" scoped>
.content-list {
  .content-item {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--q-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
