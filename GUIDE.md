# Guide pour Personne A - Services à Intégrer dans le Workflow BPMN

## Architecture des Services

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW BPMN                                │
│                         (Ilef)                           │
└─────────────────────────────────────────────────────────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐
│  GraphQL/REST     │  │  SOAP Service     │  │  gRPC Service         │
│  Port 4000        │  │  Port 4001        │  │  Port 4002            │
│  (Sarra)          │  │  (Cyrine)         │  │  (Cyrine)             │
└───────────────────┘  └───────────────────┘  └───────────────────────┘
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     ▼
                          ┌───────────────────┐
                          │   PostgreSQL DB   │
                          │   Port 5432       │
                          └───────────────────┘
```

---

## 1. Service SOAP - Vérification d'Identité (Port 4001)

### Description
Vérifie l'identité du client avant de traiter sa réclamation.

### WSDL
```
http://localhost:4001/soap/identity?wsdl
```

### Opération : VerifyIdentity

**Request XML :**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:id="http://insurance-claim-system.com/identity">
   <soapenv:Body>
      <id:VerifyIdentityRequest>
         <id:nationalId>12345678</id:nationalId>
         <id:fullName>Ahmed Ben Ali</id:fullName>
         <id:dateOfBirth>1985-03-15</id:dateOfBirth>
      </id:VerifyIdentityRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

**Response XML (succès) :**
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <VerifyIdentityResponse>
         <verified>true</verified>
         <message>Identity verified successfully</message>
         <customerId>12345678</customerId>
      </VerifyIdentityResponse>
   </soap:Body>
</soap:Envelope>
```

**Response XML (échec) :**
```xml
<VerifyIdentityResponse>
   <verified>false</verified>
   <message>Identity not found or data mismatch</message>
</VerifyIdentityResponse>
```

### Intégration BPMN
- **Type de tâche** : Service Task
- **Utilisation** : Première étape après réception de la réclamation
- **Gateway** : Si `verified=true` → continuer, sinon → rejeter la réclamation

---

## 2. Service gRPC - Validation de Police (Port 4002)

### Description
Valide que la police d'assurance couvre le type de réclamation et le montant demandé.

### Fichier Proto
Fichier : `policy-service/policy.proto`

### Méthodes Disponibles

#### A) ValidatePolicy
Vérifie si la réclamation est couverte par la police.

**Request :**
```json
{
  "policy_id": "POL-001",
  "claim_type": "medical",
  "amount": 1500.00
}
```

**Response :**
```json
{
  "is_valid": true,
  "policy_id": "POL-001",
  "coverage_type": "medical",
  "max_coverage": 50000.00,
  "remaining_coverage": 48500.00,
  "message": "Claim is within policy coverage"
}
```

#### B) GetPolicyDetails
Récupère les détails complets d'une police.

**Request :**
```json
{
  "policy_id": "POL-001"
}
```

**Response :**
```json
{
  "policy_id": "POL-001",
  "holder_name": "Ahmed Ben Ali",
  "coverage_type": "medical",
  "max_coverage": 50000.00,
  "start_date": "2024-01-01",
  "end_date": "2025-12-31",
  "status": "ACTIVE"
}
```

#### C) CheckPolicyStatus
Vérifie si la police est active.

**Request :**
```json
{
  "policy_id": "POL-001"
}
```

**Response :**
```json
{
  "policy_id": "POL-001",
  "is_active": true,
  "status": "ACTIVE"
}
```

### Intégration BPMN
- **Type de tâche** : Service Task (avec connecteur gRPC)
- **Utilisation** : Après vérification d'identité
- **Gateway** : Si `is_valid=true` → calculer compensation, sinon → rejeter

---

## 3. Services REST/GraphQL (Port 4000) 

### Endpoints REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/fraud/check` | Vérification de fraude |
| POST | `/api/calculate` | Calcul de compensation |
| PATCH | `/api/claims/:id/status` | Mise à jour du statut |

### GraphQL

**Endpoint :** `http://localhost:4000/graphql`

**Créer une réclamation :**
```graphql
mutation {
  submitClaim(
    national_id: "12345678",
    full_name: "Ahmed Ben Ali",
    date_of_birth: "1985-03-15",
    policy_id: "POL-001",
    claim_type: "medical",
    amount: 1500.00,
    description: "Consultation médicale"
  ) {
    claim_id
    status
  }
}
```

**Suivre une réclamation :**
```graphql
query {
  trackClaim(id: "1") {
    claim_id
    status
    amount_requested
  }
}
```

---

## Flux Recommandé pour le Workflow BPMN

```
[Start] 
    │
    ▼
[Soumettre Réclamation] ──► GraphQL submitClaim (Port 4000)
    │
    ▼
[Vérifier Identité] ──► SOAP VerifyIdentity (Port 4001)
    │
    ▼
<Gateway: Identité OK?>
    │ Non ──► [Rejeter - Identité Non Vérifiée] ──► [End]
    │ Oui
    ▼
[Valider Police] ──► gRPC ValidatePolicy (Port 4002)
    │
    ▼
<Gateway: Police Valide?>
    │ Non ──► [Rejeter - Police Non Valide] ──► [End]
    │ Oui
    ▼
[Vérifier Fraude] ──► REST /api/fraud/check (Port 4000)
    │
    ▼
<Gateway: Risque Élevé?>
    │ Oui ──► [Revue Manuelle] ──► <Approuvé?> ──► ...
    │ Non
    ▼
[Calculer Compensation] ──► REST /api/calculate (Port 4000)
    │
    ▼
[Approuver Réclamation] ──► REST PATCH /api/claims/:id/status
    │
    ▼
[End]
```

Workflow pools/partenaires 15 ❓ À faire Ilef BPMN Bonita/Activiti
Gates (OR/AND/XOR)15❓ À faire Ilef Dans le workflow

---

## Données de Test Disponibles

### Identités (pour SOAP)
| national_id | full_name | date_of_birth |
|-------------|-----------|---------------|
| 12345678 | Ahmed Ben Ali | 1985-03-15 |
| 87654321 | Fatma Trabelsi | 1990-07-22 |
| 11223344 | Mohamed Sassi | 1978-11-08 |
| 44332211 | Sana Bouazizi | 1995-01-30 |
| 55667788 | Karim Mejri | 1982-06-14 |
| 99887766 | Amira Khelifi | 1988-09-25 |

### Polices (pour gRPC)
| policy_id | holder_name | coverage_type | max_coverage |
|-----------|-------------|---------------|--------------|
| POL-001 | Ahmed Ben Ali | medical | 50000 |
| POL-002 | Fatma Trabelsi | auto | 30000 |
| POL-003 | Mohamed Sassi | home | 100000 |
| POL-004 | Sana Bouazizi | medical | 75000 |
| POL-005 | Karim Mejri | auto | 25000 |
| POL-006 | Amira Khelifi | life | 200000 |

---

## Lancer les Services

```bash
cd insurance-claim-system
docker-compose up --build -d
```

### Vérifier que tout tourne
```bash
docker-compose ps
```

### URLs de test
- GraphQL Playground: http://localhost:4000/graphql
- SOAP WSDL: http://localhost:4001/soap/identity?wsdl
- Health Check SOAP: http://localhost:4001/health

---

## Contact
- **Cyrine (Person B)** : SOAP + gRPC services
- **Sarra (Person C)** : GraphQL + REST services
- **Ilef (Person A)** : Workflow BPMN
