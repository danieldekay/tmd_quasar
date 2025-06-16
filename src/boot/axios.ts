import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.WORDPRESS_API_URL || 'http://localhost:10014/wp-json/tmd/v3',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
