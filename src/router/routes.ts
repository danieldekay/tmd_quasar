import type { RouteRecordRaw } from 'vue-router';
import { requireManageOptions } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'events', component: () => import('pages/EventListRefactored.vue') },
      { path: 'events/:id', component: () => import('pages/EventDetails.vue') },
      { path: 'djs', component: () => import('pages/DJsPage.vue') },
      { path: 'djs/:id', component: () => import('pages/DJDetails.vue') },
      { path: 'teachers', component: () => import('pages/TeachersPageNew.vue') },
      { path: 'teachers/:id', component: () => import('pages/TeacherDetails.vue') },
      { path: 'couples', component: () => import('pages/CouplesPage.vue') },
      { path: 'couples/:id', component: () => import('pages/CoupleDetails.vue') },
      { path: 'event-series', component: () => import('pages/EventSeriesPage.vue') },
      { path: 'event-series/:id', component: () => import('pages/EventSeriesDetails.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      {
        path: 'debug',
        component: () => import('pages/DebugPage.vue'),
        beforeEnter: requireManageOptions,
      },
    ],
  },

  // Authentication routes with AuthLayout
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'unauthorized', component: () => import('pages/UnauthorizedPage.vue') },
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
