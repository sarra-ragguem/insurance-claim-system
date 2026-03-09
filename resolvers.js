const pool = require('./db');

const resolvers = {
  Query: {
    trackClaim: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM claims WHERE claim_id = $1', [id]);
      return result.rows[0];
    },
  },
  Mutation: {
    submitClaim: async (_, { policy_id, claim_type, amount, description }) => {
      const query = `
        INSERT INTO claims (policy_id, claim_type, amount_requested, description, status)
        VALUES ($1, $2, $3, $4, 'SUBMITTED')
        RETURNING *;
      `;
      const values = [policy_id, claim_type, amount, description];
      const result = await pool.query(query, values);
      return result.rows[0];
    },
  },
};

module.exports = resolvers;
