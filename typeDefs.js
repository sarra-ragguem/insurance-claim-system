const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Claim {
    claim_id: ID!
    status: String!
    national_id: String
    full_name: String
    date_of_birth: String
    policy_id: String
    claim_type: String
    amount_requested: Float
    description: String
    created_at: String
  }

  type Query {
    trackClaim(id: ID!): Claim
    getAllClaims: [Claim]
  }

  type Mutation {
    submitClaim(
      national_id: String!,
      full_name: String!,
      date_of_birth: String!,
      policy_id: String!, 
      claim_type: String!, 
      amount: Float!, 
      description: String!
    ): Claim
  }
`;

module.exports = typeDefs;
