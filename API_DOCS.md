###  Claim Submission (GraphQL)
* **Endpoint:** `http://localhost:4000/graphql`
* **Action:** `mutation { submitClaim(...) }`
* **Description:** Entry point for new claims. Sets initial state to `SUBMITTED`.

###  Fraud Detection (REST)
* **Endpoint:** `POST http://localhost:4000/api/fraud/check`
* **Body:** `{ "amount": number }`
* **Response:** `{ "riskLevel": "LOW" | "HIGH" }`

###  Compensation Calculation (REST)
* **Endpoint:** `POST http://localhost:4000/api/calculate`
* **Body:** `{ "amountRequested": number }`
* **Response:** `{ "finalAmount": string }`

###  State Machine Update (REST)
* **Endpoint:** `PATCH http://localhost:4000/api/claims/:id/status`
* **Body:** `{ "status": "string" }`
* **Valid States:** `VERIFIED`, `VALIDATED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PAID`.