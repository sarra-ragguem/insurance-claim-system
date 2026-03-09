Claim Submission (GraphQL)
URL: http://localhost:4000/graphql

Action: Use mutation submitClaim to start a process.

Fraud Detection (REST)
URL: POST http://localhost:4000/api/fraud/check

Body: {"amount": number}

Response: {"riskLevel": "LOW" | "HIGH"}

Compensation Calculation (REST)
URL: POST http://localhost:4000/api/calculate

Body: {"amountRequested": number}

Response: {"finalAmount": string}