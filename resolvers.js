const pool = require('./db');

const resolvers = {
  Query: {
    trackClaim: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM claims WHERE claim_id = $1', [id]);
      return result.rows[0];
    },
    getAllClaims: async () => {
      const result = await pool.query('SELECT * FROM claims ORDER BY created_at DESC');
      return result.rows;
    },
  },
  Mutation: {
    submitClaim: async (_, { national_id, full_name, date_of_birth, policy_id, claim_type, amount, description }) => {
      const query = `
        INSERT INTO claims (national_id, full_name, date_of_birth, policy_id, claim_type, amount_requested, description, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'SUBMITTED')
        RETURNING *;
      `;
      const values = [national_id, full_name, date_of_birth, policy_id, claim_type, amount, description];
      const result = await pool.query(query, values);
      return result.rows[0];
    },
  },
};

module.exports = resolvers;
