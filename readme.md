# Insurance Claim Processing - Core Backend (Sarra's Branch)

This branch contains the **Core Microservices Infrastructure** for the End-to-End Insurance Claim Processing system. It handles data persistence, modern API interactions, and business rule evaluations.

---

## 1. Project Overview 
This service acts as the central hub for the insurance workflow.
* **Claim Submission & Tracking:** Implemented via **GraphQL** 
* **Fraud Detection & Rules:** Implemented via **REST JSON** 
* **Compensation Calculation:** Implemented via **REST JSON** 
* **Database Management:** PostgreSQL implementation of the **State Machine** transitions.

---

## 2. Architecture & Microservices  (50 pts)
The system is fully containerized to ensure cross-platform compatibility and scalability.
* **Container 1 (`insurance-db`):** PostgreSQL 15 database instance.
* **Container 2 (`insurance-app`):** Node.js Express server hosting the GraphQL and REST layers.



---

## 3. Getting Started 
### Prerequisites
* Docker & Docker Compose installed.
* Postman (for API testing).

### How to Run
1. Navigate to the `insurance_system` directory.
2. Build and start the services in detached mode:
   ```bash
   docker-compose up --build -d
### Available Endpoints
| Service | Type | URL |
| :--- | :--- | :--- |
| **GraphQL Playground** | Interface | `http://localhost:4000/graphql` |
| **Fraud Check** | REST POST | `http://localhost:4000/api/fraud/check` |
| **Payout Calculation** | REST POST | `http://localhost:4000/api/calculate` |
| **Status Update** | REST PATCH | `http://localhost:4000/api/claims/:id/status` |

---

## 4. Database Access 
To manually verify that the State Machine is updating correctly, run the following command in your terminal:

```bash
docker exec -it insurance-db psql -U insurance_admin -d insurance_db -c "SELECT * FROM claims;"
```
## 5. API Testing & Documentation 🧪 (30 pts)

Detailed documentation and test cases are provided via the included Postman collection.

### 📝 Instructions:
1.  **Import:** Load the file `API Documentation.json` into Postman.
2.  **Step 1 (Submission):** Run the `Submit Claim` Mutation (GraphQL). This creates the entry in the PostgreSQL database and returns a `claim_id`.
3.  **Step 2 (Processing):** Use that generated ID to test the following:
    * **Status Update (REST):** Simulates the workflow moving the claim through the state machine.
    * **Track Claim (GraphQL):** Verifies the current status and details of the claim.
    * **Fraud/Calculation (REST):** Validates the business logic rules.

---