###  Claim Submission (GraphQL)
* **Endpoint:** `http://localhost:4000/graphql`
* **Action:** `mutation { submitClaim(...) }`
* **Description:** Point d'entrée pour les nouveaux sinistres. Initialise l'état à `SUBMITTED`.

###  Fraud Detection (REST)
* **Endpoint:** `POST http://localhost:4000/api/fraud/check`
* **Body:** `{ "amount": number }`
* **Response:** `{ "riskLevel": "LOW" | "HIGH" }`
* **Description:** Analyse le risque basé sur le montant. Un risque `HIGH` déclenche une revue manuelle.

###  Compensation Calculation (REST)
* **Endpoint:** `POST http://localhost:4000/api/calculate`
* **Body:** `{ "amountRequested": number }`
* **Response:** `{ "finalAmount": string }`
* **Description:** Calcule le montant final après taxes et franchises.

###  State Machine Update (REST)
* **Endpoint:** `PATCH http://localhost:4000/api/claims/:id/status`
* **Body:** `{ "status": "string" }`
* **Valid States:** `VERIFIED`, `VALIDATED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `PAID`.
* **Description:** Met à jour la base PostgreSQL à chaque étape franchie du workflow.

###  Identity Verification (SOAP)
* **WSDL:** `http://localhost:4001/soap/identity?wsdl`
* **Action:** `verifyIdentity`
* **Body (XML):** `<id:nationalId>string</id:nationalId>`
* **Response:** `{ "isValid": boolean, "verificationCode": "string" }`
* **Description:** Vérifie les informations d'identité via le protocole XML/SOAP.

###  Policy Validation (gRPC)
* **Service:** `PolicyService`
* **Method:** `ValidatePolicy`
* **Request:** `{ "policy_id": string, "claim_type": string, "amount": number }`
* **Response:** `{ "is_valid": boolean, "message": string }`
* **Description:** Validation haute performance de la couverture d'assurance.

###  Policy Status (gRPC)
* **Service:** `PolicyService`
* **Method:** `CheckPolicyStatus`
* **Request:** `{ "policy_id": string }`
* **Response:** `{ "is_active": boolean, "status": string }`
* **Description:** Vérifie si le contrat est toujours en vigueur (ACTIVE).
