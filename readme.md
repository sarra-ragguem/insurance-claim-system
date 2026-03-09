1. Project Overview
This project implements a microservices-based insurance claim system. This folder contains the "Core Service" which handles:

Claim Submission & Tracking: via GraphQL (20 pts)

Fraud Detection & Rules: via REST JSON (30 pts)

Compensation Calculation: via REST JSON (30 pts)

Database Management: PostgreSQL for State Machine persistence.

2. Architecture & Microservices (50 pts)
The application is containerized using Docker and orchestrated via Docker Compose.

Container 1 (insurance-db): PostgreSQL 15 database.

Container 2 (insurance-app): Node.js Express server handling GraphQL and REST.

3. How to Run (Prerequisites: Docker & Docker Compose)
Open a terminal in the /insurance_system folder.

Run the following command to build and start all services:

Bash
docker-compose up --build -d
The services will be available at:

GraphQL Playground: http://localhost:4000/graphql

REST Fraud Check: http://localhost:4000/api/fraud/check

REST Calculation: http://localhost:4000/api/calculate

Status Update: http://localhost:4000/api/claims/:id/status

4. Database Access
To verify data manually in the PostgreSQL container:

Bash
docker exec -it insurance-db psql -U person_c -d insurance_db -c "SELECT * FROM claims;"
5. API Testing (30 pts)
A Postman collection named Insurance_API_Tests.postman_collection.json is included in this directory.

Import this file into Postman.

Run the "Submit Claim" Mutation.

Use the generated ID to test the "Update Status" and "Track Claim" requests.