<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Tango Marathon Directory </q-toolbar-title>

        <q-btn flat round dense icon="search" />
        <q-btn flat round dense icon="notifications" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <q-item v-for="link in linksList" :key="link.title" clickable v-ripple :to="link.link">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            {{ link.title }}
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header> Event Types </q-item-label>

        <q-item clickable v-ripple to="/events?type=marathon">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section> Marathons </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/events?type=festival">
          <q-item-section avatar>
            <q-icon name="celebration" />
          </q-item-section>
          <q-item-section> Festivals </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/events?type=encuentro">
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section> Encuentros </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface LinkProps {
  title: string;
  icon: string;
  link: string;
}

const linksList: LinkProps[] = [
  {
    title: 'Home',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Events',
    icon: 'event',
    link: '/events',
  },
  {
    title: 'DJs',
    icon: 'music_note',
    link: '/djs',
  },
  {
    title: 'Teachers',
    icon: 'school',
    link: '/teachers',
  },
  {
    title: 'Couples',
    icon: 'favorite',
    link: '/couples',
  },
  {
    title: 'Event Series',
    icon: 'event_repeat',
    link: '/event-series',
  },
  {
    title: 'About',
    icon: 'info',
    link: '/about',
  },
  {
    title: 'Debug',
    icon: 'bug_report',
    link: '/debug',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
