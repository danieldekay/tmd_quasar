<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Profile Header -->
      <div class="col-12">
        <q-card class="profile-header-card">
          <q-card-section class="row items-center q-pb-none">
            <div class="col-auto">
              <q-avatar size="80px">
                <q-img
                  v-if="profile?.avatar_urls?.['96']"
                  :src="profile.avatar_urls['96']"
                  :alt="profile?.display_name || 'User avatar'"
                />
                <q-icon v-else name="person" size="40px" />
              </q-avatar>
            </div>
            <div class="col q-ml-md">
              <div class="text-h5 q-mb-xs">{{ profile?.display_name || 'Loading...' }}</div>
              <div v-if="profile?.description" class="text-body2 text-grey-7 q-mb-sm">
                {{ profile.description }}
              </div>
              <div class="row q-gutter-sm">
                <template v-if="profile?.roles?.length">
                  <q-chip
                    v-for="role in profile.roles"
                    :key="role"
                    :label="role"
                    color="primary"
                    text-color="white"
                    size="sm"
                  />
                </template>
                <q-chip
                  v-if="isAdmin"
                  label="Admin"
                  color="red"
                  text-color="white"
                  size="sm"
                  icon="admin_panel_settings"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Content Statistics -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Content Statistics</div>
            <div v-if="profile?.content_counts" class="row q-col-gutter-md">
              <div class="col-6 col-sm-3">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-h4 text-primary">
                      {{ profile.content_counts.event.published }}
                    </div>
                    <div class="text-caption">Events</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6 col-sm-3">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-h4 text-secondary">
                      {{ profile.content_counts.teacher.published }}
                    </div>
                    <div class="text-caption">Teachers</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6 col-sm-3">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-h4 text-accent">{{ profile.content_counts.dj.published }}</div>
                    <div class="text-caption">DJs</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6 col-sm-3">
                <q-card flat bordered class="text-center">
                  <q-card-section>
                    <div class="text-h4 text-positive">
                      {{ profile.content_counts.event_series.published }}
                    </div>
                    <div class="text-caption">Event Series</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Profile Details -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Profile Information</div>

            <div v-if="isLoading" class="text-center q-pa-lg">
              <q-spinner-dots size="50px" color="primary" />
              <div class="text-grey-6 q-mt-sm">Loading profile...</div>
            </div>

            <div v-else-if="error" class="text-center q-pa-lg">
              <q-icon name="error" size="50px" color="negative" />
              <div class="text-negative q-mt-sm">{{ error }}</div>
              <q-btn label="Retry" color="primary" @click="loadProfile" class="q-mt-md" />
            </div>

            <div v-else-if="profile" class="profile-details">
              <q-list>
                <q-item v-if="profile.email">
                  <q-item-section avatar>
                    <q-icon name="email" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ profile.email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.url">
                  <q-item-section avatar>
                    <q-icon name="link" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Website</q-item-label>
                    <q-item-label>
                      <a :href="profile.url" target="_blank" rel="noopener noreferrer">
                        {{ profile.url }}
                      </a>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.registered_date">
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Member Since</q-item-label>
                    <q-item-label>{{ formatDate(profile.registered_date) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.username">
                  <q-item-section avatar>
                    <q-icon name="account_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Username</q-item-label>
                    <q-item-label>{{ profile.username }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.meta?.first_name || profile.meta?.last_name">
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Full Name</q-item-label>
                    <q-item-label>
                      {{
                        [profile.meta?.first_name, profile.meta?.last_name]
                          .filter(Boolean)
                          .join(' ')
                      }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.capabilities">
                  <q-item-section avatar>
                    <q-icon name="security" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Capabilities</q-item-label>
                    <q-item-label>
                      <div class="q-gutter-xs">
                        <q-chip
                          v-for="(hasCapability, capability) in profile.capabilities"
                          :key="capability"
                          :label="capability"
                          :color="hasCapability ? 'positive' : 'grey'"
                          size="sm"
                          dense
                        />
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="profile.meta?.nickname">
                  <q-item-section avatar>
                    <q-icon name="badge" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Nickname</q-item-label>
                    <q-item-label>{{ profile.meta.nickname }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>

        <!-- Authored Content -->
        <q-card v-if="profile?.content_counts && hasAuthoredContent" class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Your Content</div>

            <!-- Authored Events -->
            <div v-if="profile.content_counts.event.published > 0" class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="event" color="primary" />
                Events ({{ profile.content_counts.event.published }})
              </div>
              <q-list v-if="profile._embedded?.['authored:events']?.[0]?._embedded?.events" dense>
                <q-item
                  v-for="event in profile._embedded['authored:events'][0]._embedded.events"
                  :key="event.id"
                  clickable
                  @click="viewEvent(event.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ event.title }}</q-item-label>
                    <q-item-label caption>
                      {{ event.start_date ? formatDate(event.start_date) : '' }}
                      {{ event.city && event.country ? ` • ${event.city}, ${event.country}` : '' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Authored Teachers -->
            <div v-if="profile.content_counts.teacher.published > 0" class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="school" color="secondary" />
                Teachers ({{ profile.content_counts.teacher.published }})
              </div>
              <q-list
                v-if="profile._embedded?.['authored:teachers']?.[0]?._embedded?.teachers"
                dense
              >
                <q-item
                  v-for="teacher in profile._embedded['authored:teachers'][0]._embedded.teachers"
                  :key="teacher.id"
                  clickable
                  @click="viewTeacher(teacher.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ teacher.title }}</q-item-label>
                    <q-item-label caption>
                      {{
                        teacher.city && teacher.country ? `${teacher.city}, ${teacher.country}` : ''
                      }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Authored DJs -->
            <div v-if="profile.content_counts.dj.published > 0" class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="music_note" color="accent" />
                DJs ({{ profile.content_counts.dj.published }})
              </div>
              <q-list v-if="profile._embedded?.['authored:djs']?.[0]?._embedded?.djs" dense>
                <q-item
                  v-for="dj in profile._embedded['authored:djs'][0]._embedded.djs"
                  :key="dj.id"
                  clickable
                  @click="viewDJ(dj.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ dj.title }}</q-item-label>
                    <q-item-label caption>
                      {{ dj.city && dj.country ? `${dj.city}, ${dj.country}` : '' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Authored Event Series -->
            <div v-if="profile.content_counts.event_series.published > 0">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="repeat" color="positive" />
                Event Series ({{ profile.content_counts.event_series.published }})
              </div>
              <q-list
                v-if="
                  profile._embedded?.['authored:event-series']?.[0]?._embedded?.['event-series']
                "
                dense
              >
                <q-item
                  v-for="series in profile._embedded['authored:event-series'][0]._embedded[
                    'event-series'
                  ]"
                  :key="series.id"
                  clickable
                  @click="viewEventSeries(series.id)"
                >
                  <q-item-section>
                    <q-item-label>{{ series.title }}</q-item-label>
                    <q-item-label caption>
                      {{ series.city && series.country ? `${series.city}, ${series.country}` : '' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Profile Actions -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Actions</div>

            <div class="q-gutter-y-sm">
              <q-btn
                label="Edit Profile"
                icon="edit"
                color="primary"
                class="full-width"
                :disable="!isAuthenticated"
                @click="editProfile"
              />

              <q-btn
                label="Change Password"
                icon="lock"
                color="secondary"
                class="full-width"
                :disable="!isAuthenticated"
                @click="changePassword"
              />

              <q-btn
                label="Logout"
                icon="logout"
                color="negative"
                class="full-width"
                :disable="!isAuthenticated"
                @click="logout"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Admin Section -->
        <q-card v-if="isAdmin" class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Admin Tools</div>

            <div class="q-gutter-y-sm">
              <q-btn
                label="Debug Page"
                icon="bug_report"
                color="orange"
                class="full-width"
                to="/debug"
              />

              <q-btn
                label="Manage Users"
                icon="people"
                color="purple"
                class="full-width"
                @click="manageUsers"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/authStore';
import { userService, type UserProfile } from '../services/userService';

// Composables
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

// Reactive state
const profile = ref<UserProfile | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);

const hasAuthoredContent = computed(() => {
  if (!profile.value?.content_counts) return false;
  const counts = profile.value.content_counts;
  return (
    counts.event.published > 0 ||
    counts.teacher.published > 0 ||
    counts.dj.published > 0 ||
    counts.event_series.published > 0
  );
});

// Methods
const loadProfile = async () => {
  if (!isAuthenticated.value) {
    error.value = 'You must be logged in to view your profile';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const token = authStore.token;
    if (!token) {
      throw new Error('No authentication token available');
    }

    profile.value = await userService.getCurrentUserProfile(token, {
      _embed: true, // Include authored content
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load profile';
    console.error('Profile loading error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for authentication changes to load the profile
watch(
  isAuthenticated,
  (isAuth) => {
    if (isAuth && !profile.value) {
      void loadProfile();
    } else if (!isAuth) {
      // Clear profile data if user logs out
      profile.value = null;
      error.value = 'You must be logged in to view your profile';
    }
  },
  { immediate: true }, // Run the watcher immediately on component mount
);

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const viewEvent = (id: number) => {
  void router.push(`/events/${id}`);
};

const viewTeacher = (id: number) => {
  void router.push(`/teachers/${id}`);
};

const viewDJ = (id: number) => {
  void router.push(`/djs/${id}`);
};

const viewEventSeries = (id: number) => {
  void router.push(`/event-series/${id}`);
};

const editProfile = () => {
  // Redirect to WordPress admin profile page
  const wordpressUrl = process.env.WORDPRESS_API_URL || 'http://localhost:10014';
  const profileUrl = `${wordpressUrl}/wp-admin/profile.php`;
  window.open(profileUrl, '_blank');
};

const changePassword = () => {
  // Redirect to WordPress admin password change page
  const wordpressUrl = process.env.WORDPRESS_API_URL || 'http://localhost:10014';
  const passwordUrl = `${wordpressUrl}/wp-admin/profile.php#password`;
  window.open(passwordUrl, '_blank');
};

const logout = () => {
  try {
    void authStore.logout();
    $q.notify({
      type: 'positive',
      message: 'Successfully logged out',
    });
    void router.push('/auth/login');
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Logout failed',
    });
  }
};

const manageUsers = () => {
  $q.notify({
    type: 'info',
    message: 'User management functionality coming soon!',
  });
};
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-details .q-item {
  padding: 12px 0;
}

.profile-details .q-item:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}
</style>
