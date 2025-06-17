<template>
  <q-pull-to-refresh @refresh="loadEvent">
    <q-page class="event-details-page">
      <!-- Hero Banner -->
      <div v-if="event" class="hero-wrapper q-mb-md">
        <q-img
          :src="event.featured_image || defaultImage"
          :alt="`Event banner for ${event.event_name || event.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h3 text-weight-bold text-white">
              {{ event.event_name || event.title
              }}<span v-if="editionLabel" class="text-subtitle2"> – {{ editionLabel }}</span>
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <div class="row items-center">
                <q-icon name="event" size="18px" class="q-mr-xs" />
                {{ formattedDates }}
              </div>
              <div v-if="location" class="row items-center">
                <q-icon name="location_on" size="18px" class="q-mr-xs" />
                {{ location }}
              </div>
              <q-chip v-if="event.event_category" dense color="primary" text-color="white">
                {{ event.event_category }}
              </q-chip>
            </div>
            <!-- Quick Stats Chips -->
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <q-chip
                v-if="event.have_milongas"
                icon="music_note"
                dense
                color="dark"
                text-color="white"
                >Milongas</q-chip
              >
              <q-chip
                v-if="event.meta_box?.have_live_music"
                icon="campaign"
                dense
                color="accent"
                text-color="white"
                >Live Music</q-chip
              >
              <q-chip
                v-if="event.meta_box?.have_lessons"
                icon="school"
                dense
                color="secondary"
                text-color="white"
                >Lessons</q-chip
              >
              <q-chip
                v-if="event.meta_box?.have_show"
                icon="theater_comedy"
                dense
                color="info"
                text-color="white"
                >Shows</q-chip
              >
              <q-chip v-if="event.price" icon="paid" dense color="positive" text-color="white"
                >{{ event.price }} {{ event.currency }}</q-chip
              >
              <q-chip
                v-if="event.number_of_participants"
                icon="groups"
                dense
                color="warning"
                text-color="white"
                >{{ event.number_of_participants }} dancers</q-chip
              >
              <q-chip
                v-if="event.role_balanced"
                icon="balance"
                dense
                color="purple"
                text-color="white"
                >Role Balanced</q-chip
              >
              <q-chip
                v-if="event.invitation_only"
                icon="lock"
                dense
                color="orange"
                text-color="white"
                >Invitation Only</q-chip
              >
            </div>
          </div>
        </q-img>
      </div>

      <!-- Loading / Error -->
      <div v-if="isLoading" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else-if="error" class="q-pa-md">
        <q-banner class="bg-negative text-white">{{ error }}</q-banner>
      </div>

      <!-- Tabbed Info -->
      <template v-if="event">
        <!-- Tab Navigation -->
        <q-tabs v-model="tab" class="text-primary q-mb-md" dense>
          <q-tab name="overview" label="About" icon="info" />
          <q-tab name="registration" label="Registration" icon="how_to_reg" />
          <q-tab name="music" label="Music & Dance" icon="music_note" />
          <q-tab name="venue" label="Venue" icon="location_on" />
          <q-tab name="practical" label="Food & Sleep" icon="restaurant" />
          <q-tab name="contact" label="Contact" icon="link" />
        </q-tabs>
        <q-separator />

        <!-- Tab Content -->
        <q-tab-panels v-model="tab" animated :swipeable="$q.platform.is.mobile">
          <!-- Overview Panel -->
          <q-tab-panel name="overview">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Description (shows first on mobile) -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section v-if="descriptionHtml">
                    <div class="text-h6 q-mb-md">About This Event</div>
                    <div v-html="descriptionHtml" class="event-description"></div>
                  </q-card-section>
                  <q-card-section v-else>
                    <div class="text-h6 q-mb-md">About This Event</div>
                    <div class="text-grey-7">No description available for this event.</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Event Info (shows second on mobile) -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Event Info</div>
                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="event" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Duration</q-item-label>
                          <q-item-label caption>{{ formattedDates }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="location">
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Location</q-item-label>
                          <q-item-label caption>{{ location }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.venue_name">
                        <q-item-section avatar>
                          <q-icon name="store" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Venue</q-item-label>
                          <q-item-label caption>{{ event.venue_name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.number_of_participants">
                        <q-item-section avatar>
                          <q-icon name="groups" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Participants</q-item-label>
                          <q-item-label caption
                            >{{ event.number_of_participants }} dancers</q-item-label
                          >
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.music_hours">
                        <q-item-section avatar>
                          <q-icon name="schedule" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Music Hours</q-item-label>
                          <q-item-label caption>{{ event.music_hours }} hours</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.price">
                        <q-item-section avatar>
                          <q-icon name="paid" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Price</q-item-label>
                          <q-item-label caption
                            >{{ event.price }} {{ event.currency || '' }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>

                      <q-item v-if="editionLabel">
                        <q-item-section avatar>
                          <q-icon name="stars" color="amber" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Edition</q-item-label>
                          <q-item-label caption>{{ editionLabel }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Registration Panel -->
          <q-tab-panel name="registration">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Registration Details -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Registration Details</div>
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_registration ? 'how_to_reg' : 'help_outline'"
                            :color="event.have_registration ? 'positive' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Registration</q-item-label>
                          <q-item-label caption>
                            {{ event.have_registration ? 'Required' : '-' }}
                            <span v-if="event.have_registration && event.have_registration_mode">
                              ({{ event.have_registration_mode }})
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.role_balanced ? 'balance' : 'help_outline'"
                            :color="event.role_balanced ? 'purple' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Role Balanced</q-item-label>
                          <q-item-label caption>
                            {{ event.role_balanced ? 'Yes - Leaders and followers balanced' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.invitation_only ? 'lock' : 'help_outline'"
                            :color="event.invitation_only ? 'orange' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Invitation Only</q-item-label>
                          <q-item-label caption>
                            {{ event.invitation_only ? 'Yes - Exclusive event' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_tickets ? 'confirmation_number' : 'help_outline'"
                            :color="event.have_tickets ? 'blue' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Tickets</q-item-label>
                          <q-item-label caption>
                            {{ event.have_tickets ? 'Yes - Tickets available' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Registration Summary -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Quick Info</div>
                    <q-list dense>
                      <q-item v-if="event.registration_start_date">
                        <q-item-section avatar>
                          <q-icon name="start" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Registration Opens</q-item-label>
                          <q-item-label caption>{{
                            formatDate(event.registration_start_date)
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="paid" :color="event.price ? 'green' : 'grey'" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Price</q-item-label>
                          <q-item-label caption>
                            {{ event.price ? `${event.price} ${event.currency || ''}` : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_registration ? 'check_circle' : 'help_outline'"
                            :color="event.have_registration ? 'positive' : 'grey'"
                            size="sm"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Status</q-item-label>
                          <q-item-label caption>
                            {{ event.have_registration ? 'Registration required' : 'Open access' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.role_balanced">
                        <q-item-section avatar>
                          <q-icon name="balance" color="purple" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Balance</q-item-label>
                          <q-item-label caption>Role balanced event</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.invitation_only">
                        <q-item-section avatar>
                          <q-icon name="lock" color="orange" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Access</q-item-label>
                          <q-item-label caption>Invitation only</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Music & Dance Panel -->
          <q-tab-panel name="music">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Music & Dance Details -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Music & Dance Features</div>
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_milongas ? 'music_note' : 'help_outline'"
                            :color="event.have_milongas ? 'primary' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Milongas</q-item-label>
                          <q-item-label caption>
                            {{
                              event.have_milongas ? 'Yes - Traditional tango social dancing' : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.meta_box?.have_live_music ? 'campaign' : 'help_outline'"
                            :color="event.meta_box?.have_live_music ? 'red' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Live Music</q-item-label>
                          <q-item-label caption>
                            {{
                              event.meta_box?.have_live_music
                                ? 'Yes - Live orchestras or musicians'
                                : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.meta_box?.have_lessons ? 'school' : 'help_outline'"
                            :color="event.meta_box?.have_lessons ? 'blue' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Dance Lessons</q-item-label>
                          <q-item-label caption>
                            {{
                              event.meta_box?.have_lessons
                                ? 'Yes - Classes and workshops available'
                                : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.meta_box?.have_show ? 'theater_comedy' : 'help_outline'"
                            :color="event.meta_box?.have_show ? 'purple' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Shows & Performances</q-item-label>
                          <q-item-label caption>
                            {{
                              event.meta_box?.have_show
                                ? 'Yes - Professional tango performances'
                                : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_folklore ? 'celebration' : 'help_outline'"
                            :color="event.have_folklore ? 'orange' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Folklore</q-item-label>
                          <q-item-label caption>
                            {{
                              event.have_folklore ? 'Yes - Traditional folk dances included' : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_non_tango ? 'music_video' : 'help_outline'"
                            :color="event.have_non_tango ? 'teal' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Non-Tango Music</q-item-label>
                          <q-item-label caption>
                            {{ event.have_non_tango ? 'Yes - Other dance styles included' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_separated_seating ? 'event_seat' : 'help_outline'"
                            :color="event.have_separated_seating ? 'indigo' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Separated Seating</q-item-label>
                          <q-item-label caption>
                            {{
                              event.have_separated_seating
                                ? 'Yes - Traditional milonga seating'
                                : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Music Summary -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Available Features</div>
                    <q-list dense>
                      <q-item v-if="event.music_hours">
                        <q-item-section avatar>
                          <q-icon name="schedule" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Music Hours</q-item-label>
                          <q-item-label caption>{{ event.music_hours }} hours</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Show confirmed features -->
                      <q-item v-if="event.have_milongas">
                        <q-item-section avatar>
                          <q-icon name="music_note" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Milongas</q-item-label>
                          <q-item-label caption>Social dancing</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.meta_box?.have_live_music">
                        <q-item-section avatar>
                          <q-icon name="campaign" color="red" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Live Music</q-item-label>
                          <q-item-label caption>Live performances</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.meta_box?.have_lessons">
                        <q-item-section avatar>
                          <q-icon name="school" color="blue" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Lessons</q-item-label>
                          <q-item-label caption>Classes & workshops</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.meta_box?.have_show">
                        <q-item-section avatar>
                          <q-icon name="theater_comedy" color="purple" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Shows</q-item-label>
                          <q-item-label caption>Performances</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.have_folklore">
                        <q-item-section avatar>
                          <q-icon name="celebration" color="orange" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Folklore</q-item-label>
                          <q-item-label caption>Folk dances</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          !event.have_milongas &&
                          !event.meta_box?.have_live_music &&
                          !event.meta_box?.have_lessons &&
                          !event.meta_box?.have_show &&
                          !event.have_folklore
                        "
                      >
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium text-grey-6"
                            >No confirmed features</q-item-label
                          >
                          <q-item-label caption>Check with organizers</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Venue Panel -->
          <q-tab-panel name="venue">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Venue Details -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Venue Information</div>
                    <q-list>
                      <q-item v-if="event.venue_name">
                        <q-item-section avatar>
                          <q-icon name="business" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Venue Name</q-item-label>
                          <q-item-label caption>{{ event.venue_name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.street">
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Address</q-item-label>
                          <q-item-label caption>{{ event.street }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.venue_features">
                        <q-item-section avatar>
                          <q-icon name="star" color="gold" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Venue Features</q-item-label>
                          <q-item-label caption>{{ event.venue_features }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.type_of_floor">
                        <q-item-section avatar>
                          <q-icon name="layers" color="brown" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Type of Floor</q-item-label>
                          <q-item-label caption>{{ event.type_of_floor }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.lat && event.lon">
                        <q-item-section avatar>
                          <q-icon name="gps_fixed" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Coordinates</q-item-label>
                          <q-item-label caption>{{ event.lat }}, {{ event.lon }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="map"
                            color="primary"
                            @click="openInMaps(event.lat!, event.lon!)"
                            title="Open in Maps"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Location Summary -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Location</div>
                    <q-list dense>
                      <q-item v-if="event.city">
                        <q-item-section avatar>
                          <q-icon name="location_city" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">City</q-item-label>
                          <q-item-label caption>{{ event.city }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.country">
                        <q-item-section avatar>
                          <q-icon name="public" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Country</q-item-label>
                          <q-item-label caption>{{ event.country }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.venue_name">
                        <q-item-section avatar>
                          <q-icon name="business" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Venue</q-item-label>
                          <q-item-label caption>{{ event.venue_name }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.type_of_floor">
                        <q-item-section avatar>
                          <q-icon name="layers" color="brown" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Floor</q-item-label>
                          <q-item-label caption>{{ event.type_of_floor }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.lat && event.lon">
                        <q-item-section avatar>
                          <q-icon name="gps_fixed" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">GPS</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="primary"
                              @click="openInMaps(event.lat!, event.lon!)"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              Open in Maps
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="!event.venue_name && !event.street && !event.type_of_floor">
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium text-grey-6"
                            >No venue details</q-item-label
                          >
                          <q-item-label caption>Check with organizers</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Practical Panel -->
          <q-tab-panel name="practical">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Practical Details -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Practical Information</div>
                    <q-list>
                      <!-- Food Section -->
                      <q-separator spaced />
                      <q-item-label header class="text-primary">Food & Dining</q-item-label>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_food ? 'restaurant' : 'help_outline'"
                            :color="event.have_food ? 'green' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Food Available</q-item-label>
                          <q-item-label caption>
                            {{
                              event.have_food ? 'Yes - Food will be available at the event' : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.food_options">
                        <q-item-section avatar>
                          <q-icon name="fastfood" color="orange" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Food Options</q-item-label>
                          <q-item-label caption>{{ event.food_options }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Accommodation Section -->
                      <q-separator spaced />
                      <q-item-label header class="text-purple">Accommodation</q-item-label>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_sleep ? 'hotel' : 'help_outline'"
                            :color="event.have_sleep ? 'purple' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Accommodation</q-item-label>
                          <q-item-label caption>
                            {{
                              event.have_sleep ? 'Yes - Accommodation information available' : '-'
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.sleeping_options">
                        <q-item-section avatar>
                          <q-icon name="bed" color="indigo" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Sleeping Options</q-item-label>
                          <q-item-label caption>{{ event.sleeping_options }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Services Section -->
                      <q-separator spaced />
                      <q-item-label header class="text-teal">Services</q-item-label>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_services ? 'room_service' : 'help_outline'"
                            :color="event.have_services ? 'teal' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Additional Services</q-item-label>
                          <q-item-label caption>
                            {{ event.have_services ? 'Yes - Additional services available' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.service_options">
                        <q-item-section avatar>
                          <q-icon name="build" color="blue-grey" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Service Options</q-item-label>
                          <q-item-label caption>{{ event.service_options }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon
                            :name="event.have_sales ? 'shopping_cart' : 'help_outline'"
                            :color="event.have_sales ? 'pink' : 'grey'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Sales & Shopping</q-item-label>
                          <q-item-label caption>
                            {{ event.have_sales ? 'Yes - Shopping available at the event' : '-' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Services Summary -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Available Services</div>
                    <q-list dense>
                      <q-item v-if="event.have_food">
                        <q-item-section avatar>
                          <q-icon name="restaurant" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Food</q-item-label>
                          <q-item-label caption>Available at event</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.have_sleep">
                        <q-item-section avatar>
                          <q-icon name="hotel" color="purple" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Accommodation</q-item-label>
                          <q-item-label caption>Information available</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.have_services">
                        <q-item-section avatar>
                          <q-icon name="room_service" color="teal" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Services</q-item-label>
                          <q-item-label caption>Additional services</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.have_sales">
                        <q-item-section avatar>
                          <q-icon name="shopping_cart" color="pink" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Shopping</q-item-label>
                          <q-item-label caption>Sales available</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Details section -->
                      <q-separator
                        spaced
                        v-if="event.food_options || event.sleeping_options || event.service_options"
                      />

                      <q-item v-if="event.food_options">
                        <q-item-section avatar>
                          <q-icon name="fastfood" color="orange" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Food Details</q-item-label>
                          <q-item-label caption>{{ event.food_options }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.sleeping_options">
                        <q-item-section avatar>
                          <q-icon name="bed" color="indigo" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Sleep Details</q-item-label>
                          <q-item-label caption>{{ event.sleeping_options }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.service_options">
                        <q-item-section avatar>
                          <q-icon name="build" color="blue-grey" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Service Details</q-item-label>
                          <q-item-label caption>{{ event.service_options }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          !event.have_food &&
                          !event.have_sleep &&
                          !event.have_services &&
                          !event.have_sales
                        "
                      >
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium text-grey-6"
                            >No services confirmed</q-item-label
                          >
                          <q-item-label caption>Check with organizers</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Contact Panel -->
          <q-tab-panel name="contact">
            <div class="row q-col-gutter-lg">
              <!-- Left Column: Contact Details -->
              <div class="col-12 col-md-8 order-first order-md-first">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Contact Information</div>
                    <q-list>
                      <!-- Direct Contact -->
                      <q-item-label header class="text-primary">Direct Contact</q-item-label>
                      <q-item v-if="event.email">
                        <q-item-section avatar>
                          <q-icon name="email" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Email</q-item-label>
                          <q-item-label caption>{{ event.email }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="open_in_new"
                            color="primary"
                            :href="`mailto:${event.email}`"
                            title="Send email"
                          />
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.website">
                        <q-item-section avatar>
                          <q-icon name="language" color="green" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Website</q-item-label>
                          <q-item-label caption>{{ event.website }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="open_in_new"
                            color="green"
                            :href="event.website"
                            target="_blank"
                            title="Visit website"
                          />
                        </q-item-section>
                      </q-item>

                      <!-- Facebook -->
                      <q-separator
                        spaced
                        v-if="event.facebook_event || event.facebook_page || event.facebook_group"
                      />
                      <q-item-label
                        header
                        class="text-blue"
                        v-if="event.facebook_event || event.facebook_page || event.facebook_group"
                        >Facebook</q-item-label
                      >
                      <q-item v-if="event.facebook_event">
                        <q-item-section avatar>
                          <q-icon name="event" color="blue" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Facebook Event</q-item-label>
                          <q-item-label caption>Official event page</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="open_in_new"
                            color="blue"
                            :href="event.facebook_event"
                            target="_blank"
                            title="View Facebook event"
                          />
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.facebook_page">
                        <q-item-section avatar>
                          <q-icon name="pages" color="blue" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Facebook Page</q-item-label>
                          <q-item-label caption>Organizer's page</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="open_in_new"
                            color="blue"
                            :href="event.facebook_page"
                            target="_blank"
                            title="View Facebook page"
                          />
                        </q-item-section>
                      </q-item>
                      <q-item v-if="event.facebook_group">
                        <q-item-section avatar>
                          <q-icon name="group" color="blue" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Facebook Group</q-item-label>
                          <q-item-label caption>Community group</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn
                            flat
                            round
                            icon="open_in_new"
                            color="blue"
                            :href="event.facebook_group"
                            target="_blank"
                            title="Join Facebook group"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Right Column: Quick Contact -->
              <div class="col-12 col-md-4 order-last order-md-last">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Quick Contact</div>
                    <q-list dense>
                      <q-item v-if="event.email">
                        <q-item-section avatar>
                          <q-icon name="email" color="primary" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Email</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="primary"
                              :href="`mailto:${event.email}`"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              Send email
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.website">
                        <q-item-section avatar>
                          <q-icon name="language" color="green" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">Website</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="green"
                              :href="event.website"
                              target="_blank"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              Visit site
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator
                        spaced
                        v-if="event.facebook_event || event.facebook_page || event.facebook_group"
                      />

                      <q-item v-if="event.facebook_event">
                        <q-item-section avatar>
                          <q-icon name="event" color="blue" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">FB Event</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="blue"
                              :href="event.facebook_event"
                              target="_blank"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              View event
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.facebook_page">
                        <q-item-section avatar>
                          <q-icon name="pages" color="blue" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">FB Page</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="blue"
                              :href="event.facebook_page"
                              target="_blank"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              View page
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="event.facebook_group">
                        <q-item-section avatar>
                          <q-icon name="group" color="blue" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">FB Group</q-item-label>
                          <q-item-label caption>
                            <q-btn
                              flat
                              dense
                              no-caps
                              color="blue"
                              :href="event.facebook_group"
                              target="_blank"
                              class="q-pa-none"
                              style="min-height: auto; min-width: auto"
                            >
                              Join group
                            </q-btn>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        v-if="
                          !event.email &&
                          !event.website &&
                          !event.facebook_event &&
                          !event.facebook_page &&
                          !event.facebook_group
                        "
                      >
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" size="sm" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium text-grey-6"
                            >No contact info</q-item-label
                          >
                          <q-item-label caption>Check the main website</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventDetailsService as eventService } from '../services';
import type { EventDetails } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

defineOptions({ name: 'EventDetails' });

const route = useRoute();
const $q = useQuasar();

const event = ref<EventDetails>({} as EventDetails);
const isLoading = ref(true);
const error = ref<string | null>(null);
const tab = ref<'overview' | 'registration' | 'music' | 'venue' | 'practical' | 'contact'>(
  'overview',
);

const defaultImage = 'https://cdn.quasar.dev/img/parallax1.jpg';

const { formatDate } = useFormatters();

const formattedDates = computed(() => {
  if (!event.value) return '';
  const { start_date, end_date } = event.value;
  return end_date ? `${formatDate(start_date)} - ${formatDate(end_date)}` : formatDate(start_date);
});

const location = computed(() =>
  [event.value?.city, event.value?.country].filter(Boolean).join(', '),
);

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const editionLabel = computed(() => {
  const raw = event.value?.edition;
  if (!raw) return '';
  const num = parseInt(raw, 10);
  return isNaN(num) ? raw : `${getOrdinal(num)} edition`;
});

const descriptionHtml = computed(() => {
  const desc = event.value?.event_description;
  const post = event.value?.post_content;
  if (desc && post) return `${desc}<hr/>${post}`;
  return desc || post || '';
});

const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const loadEvent = async (done?: () => void) => {
  isLoading.value = true;
  error.value = null;
  const eventId = Number(route.params.id);
  if (!eventId) {
    error.value = 'Invalid event ID';
    isLoading.value = false;
    return;
  }

  try {
    event.value = await eventService.getEvent(eventId);
  } catch (err) {
    console.error('Error loading event:', err);
    error.value = 'Failed to load event';
    $q.notify({ type: 'negative', message: error.value, position: 'top' });
  } finally {
    isLoading.value = false;
    if (done) done();
  }
};

onMounted(loadEvent);
</script>

<style scoped lang="scss">
.event-details-page {
  position: relative;

  .hero-wrapper {
    height: clamp(280px, 35vh, 420px);
    border-radius: 8px;
    overflow: hidden;
  }

  .hero-img {
    height: 100%;
  }

  .bg-gradient {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.7) 100%);
  }

  .hero-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .event-description {
    line-height: 1.6;

    :deep(p) {
      margin-bottom: 1rem;
    }

    :deep(h1, h2, h3, h4, h5, h6) {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    :deep(ul, ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :deep(hr) {
      margin: 2rem 0;
      border: none;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  }
}
</style>
