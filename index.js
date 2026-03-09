const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const pool = require('./db'); 

async function startServer() {
  const app = express();
  app.use(express.json()); 

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  // REST ENDPOINT 1: Fraud Check
  app.post('/api/fraud/check', (req, res) => {
    const { amount } = req.body;
    const riskLevel = amount > 10000 ? "HIGH" : "LOW";
    console.log(`Checking fraud for amount ${amount}: Result = ${riskLevel}`);
    res.json({ riskLevel });
  });

  // REST ENDPOINT 2: Compensation Calculation
  app.post('/api/calculate', (req, res) => {
    const { amountRequested } = req.body;
    const deductible = 0.10; 
    const finalAmount = amountRequested * (1 - deductible);
    res.json({ 
      originalAmount: amountRequested,
      finalAmount: finalAmount.toFixed(2),
      currency: "USD"
    });
  });

  // UPDATE STATUS ENDPOINT 
  app.patch('/api/claims/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await pool.query('UPDATE claims SET status = $1 WHERE claim_id = $2', [status, id]);
      res.json({ message: `Status updated to ${status}` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🛠️  REST Endpoints ready on port ${PORT}`);
  });
}

startServer();