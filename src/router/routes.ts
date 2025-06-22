import type { RouteRecordRaw } from 'vue-router';
import { requireManageOptions, requireAuth, redirectIfAuthenticated } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue'), beforeEnter: requireAuth },
      { path: 'events', component: () => import('pages/EventList.vue'), beforeEnter: requireAuth },
      {
        path: 'events/:id',
        component: () => import('pages/EventDetails.vue'),
        beforeEnter: requireAuth,
      },
      { path: 'djs', component: () => import('pages/DJsPage.vue'), beforeEnter: requireAuth },
      { path: 'djs/:id', component: () => import('pages/DJDetails.vue'), beforeEnter: requireAuth },
      {
        path: 'teachers',
        component: () => import('pages/TeachersPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'teachers/:id',
        component: () => import('pages/TeacherDetails.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'couples',
        component: () => import('pages/CouplesPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'couples/:id',
        component: () => import('pages/CoupleDetails.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'event-series',
        component: () => import('pages/EventSeriesPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'event-series/:id',
        component: () => import('pages/EventSeriesDetails.vue'),
        beforeEnter: requireAuth,
      },
      { path: 'about', component: () => import('pages/AboutPage.vue'), beforeEnter: requireAuth },
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        beforeEnter: requireAuth,
      },
      {
        path: 'favorites',
        component: () => import('pages/FavoritesPage.vue'),
        beforeEnter: requireAuth,
      },
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
      {
        path: 'login',
        component: () => import('pages/LoginPage.vue'),
        beforeEnter: redirectIfAuthenticated,
      },
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
