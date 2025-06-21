import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import type { App } from 'vue';

// Create the http link
const httpLink = createHttpLink({
  uri: `${process.env.WORDPRESS_API_URL || 'http://localhost:10014'}/graphql`,
});

// Create the auth link
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

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

        // For now, we'll just clear the token and let the user re-authenticate
        // In a full implementation, you would attempt to refresh the token here
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');

        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
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
