import { gql } from '@apollo/client/core';

// GraphQL Types
export interface LoginInput {
  clientMutationId: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  authToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email?: string;
    roles?: {
      nodes: Array<{
        name: string;
      }>;
    };
  };
}

export interface RefreshTokenInput {
  clientMutationId: string;
  jwtRefreshToken: string;
}

export interface RefreshTokenResponse {
  authToken: string;
}

// GraphQL Mutations
export const LOGIN_MUTATION = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      authToken
      refreshToken
      user {
        id
        name
        email
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshAuthToken($input: RefreshJwtAuthTokenInput!) {
    refreshJwtAuthToken(input: $input) {
      authToken
    }
  }
`;

export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    viewer {
      id
      name
      email
      roles {
        nodes {
          name
        }
      }
      avatar {
        url
      }
      url
      description
      slug
    }
  }
`;
