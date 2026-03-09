const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Claim {
    claim_id: ID!
    status: String!
    policy_id: String
    amount_requested: Float
  }

  type Query {
    trackClaim(id: ID!): Claim
  }

  type Mutation {
    submitClaim(
      policy_id: String!, 
      claim_type: String!, 
      amount: Float!, 
      description: String!
    ): Claim
  }
`;

module.exports = typeDefs;
