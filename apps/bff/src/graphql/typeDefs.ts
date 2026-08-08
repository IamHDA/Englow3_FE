export const typeDefs = `#graphql
  type Query {
    health: String!
  }

  type AuthResponse {
    access_token: String
    token_type: String
    expires_in: Int
    refresh_token: String
    error: String
    error_description: String
  }

  type Mutation {
    login(email: String!, password: String!): AuthResponse!
  }
`;

