import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'events', component: () => import('pages/EventList.vue') },
      { path: 'events/:id', component: () => import('pages/EventDetails.vue') },
      { path: 'djs', component: () => import('pages/DJsPage.vue') },
      { path: 'teachers', component: () => import('pages/TeachersPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'debug', component: () => import('pages/DebugPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
