import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import type { App } from 'vue';

// Create the http link
const httpLink = createHttpLink({
  uri: `${process.env.WORDPRESS_API_URL || 'http://localhost:10014'}/graphql`,
});

// Create the auth link
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth_token');

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create the Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
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
