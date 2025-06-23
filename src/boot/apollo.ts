import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import type { App } from 'vue';
import { getJWTToken } from '../utils/cookies';

const rootWordpressUrl =
  process.env.WORDPRESS_URL ||
  process.env.WORDPRESS_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.tangomarathons.com'
    : 'http://localhost:10014');

// Create the http link
const httpLink = createHttpLink({
  uri: process.env.GRAPHQL_ENDPOINT || `${rootWordpressUrl}/graphql`,
});

// Create the auth link
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from cookies
  const token = getJWTToken();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check if it's an authentication error
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('authentication')) {
        console.warn('GraphQL authentication error, attempting token refresh...');

        // Check if we have a stored token - if so, don't redirect immediately
        // as the auth store might be in the process of restoring authentication
        const storedToken = getJWTToken();
        if (storedToken) {
          console.log('Stored token found, not redirecting - auth restoration may be in progress');
          return;
        }

        // Only redirect if we're not already on the login page and no stored token
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/auth/login') &&
          !window.location.pathname.includes('/auth/unauthorized')
        ) {
          console.log('Redirecting to login due to GraphQL authentication error');
          window.location.href = '/auth/login';
        }
      }
    }
  }

  if (networkError) {
    console.error('Network error:', networkError);
  }
});

// Create the Apollo Client
export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default ({ app }: { app: App }) => {
  // Install the Apollo Client
  app.config.globalProperties.$apollo = apolloClient;
};
