# 🔐 Services
## SOAP & gRPC Protocol Specialist

Ce document décrit les services créés par **Cyrine** pour le système de traitement des réclamations d'assurance.

---

## 📋 Vue d'ensemble

| Service | Protocole | Port | Description |
|---------|-----------|------|-------------|
| Identity Verification | **SOAP** | 4001 | Vérification de l'identité du client |
| Policy Validation | **gRPC** | 4002 | Validation de la couverture de la police |

---

## 🔐 Service 1: Identity Verification (SOAP)

### Description
Ce service vérifie l'identité du client en comparant les informations fournies (NationalID, Nom, Date de naissance) avec la base de données d'identités.

### Endpoints
- **WSDL**: `http://localhost:4001/soap/identity?wsdl`
- **Health Check**: `http://localhost:4001/health`

### Opération: `verifyIdentity`

#### Request
```xml
<VerifyIdentityRequest>
    <nationalId>12345678</nationalId>
    <fullName>Ahmed Ben Ali</fullName>
    <dateOfBirth>1990-05-15</dateOfBirth>
</VerifyIdentityRequest>
```

#### Response
```xml
<VerifyIdentityResponse>
    <isValid>true</isValid>
    <verificationCode>VERIFIED_1699999999999</verificationCode>
    <message>Identity successfully verified</message>
    <timestamp>2024-01-15T10:30:00.000Z</timestamp>
</VerifyIdentityResponse>
```

### Codes de vérification
| Code | Description |
|------|-------------|
| `VERIFIED_*` | Identité vérifiée avec succès |
| `ERR_NOT_FOUND` | National ID non trouvé |
| `ERR_NAME_MISMATCH` | Le nom ne correspond pas |
| `ERR_DOB_MISMATCH` | La date de naissance ne correspond pas |

### Identités de test disponibles
| National ID | Nom | Date de naissance |
|-------------|-----|-------------------|
| 12345678 | Ahmed Ben Ali | 1990-05-15 |
| 87654321 | Fatma Trabelsi | 1985-11-20 |
| 11111111 | Mohamed Bouazizi | 1992-03-10 |
| 22222222 | Sarra Mejri | 1995-07-25 |
| 33333333 | Cyrine Gharbi | 1993-01-30 |
| 44444444 | Ilef Mansour | 1991-09-05 |

---

## 📋 Service 2: Policy Validation (gRPC)

### Description
Ce service vérifie si une police d'assurance est valide et couvre un type de réclamation spécifique.

### Connexion
- **Host**: `localhost:4002`
- **Proto file**: `policy.proto`

### Méthodes disponibles

#### 1. `ValidatePolicy`
Valide si une police couvre un type de réclamation.

**Request:**
```protobuf
message PolicyRequest {
    string policy_id = 1;      // Ex: "POL-001"
    string claim_type = 2;     // AUTO, HEALTH, HOME, LIFE, TRAVEL
    double amount_requested = 3;
}
```

**Response:**
```protobuf
message PolicyResponse {
    bool is_covered = 1;           // true si couvert
    bool is_within_limit = 2;      // true si dans les limites
    string policy_status = 3;      // ACTIVE, EXPIRED, SUSPENDED
    double coverage_limit = 4;     // Limite max
    double deductible = 5;         // Franchise calculée
    string message = 6;            // Message explicatif
    string validation_code = 7;    // Code de validation
}
```

#### 2. `GetPolicyDetails`
Récupère les détails complets d'une police.

#### 3. `CheckPolicyStatus`
Vérifie le statut d'une police (active, expirée, etc.)

### Polices de test disponibles
| Policy ID | Holder | Type | Claims couverts | Max Coverage | Status |
|-----------|--------|------|-----------------|--------------|--------|
| POL-001 | Ahmed Ben Ali | COMPREHENSIVE | AUTO, HOME, TRAVEL | 50,000 | ACTIVE |
| POL-002 | Fatma Trabelsi | HEALTH_PREMIUM | HEALTH, LIFE | 100,000 | ACTIVE |
| POL-003 | Mohamed Bouazizi | AUTO_BASIC | AUTO | 20,000 | ACTIVE |
| POL-004 | Sarra Mejri | HOME_PLUS | HOME, TRAVEL | 75,000 | EXPIRED |
| POL-005 | Cyrine Gharbi | FULL_COVERAGE | ALL | 200,000 | ACTIVE |

---

## 🚀 Démarrage

### Avec Docker (Recommandé)
```bash
cd insurance-claim-system
docker-compose up --build -d
```

### Sans Docker (Développement local)

**Terminal 1 - Identity Service:**
```bash
cd identity-service
npm install
npm start
```

**Terminal 2 - Policy Service:**
```bash
cd policy-service
npm install
npm start
```

---

## 🧪 Tests

### Tester le service SOAP
```bash
cd identity-service
npm install
node test-client.js
```

### Tester le service gRPC
```bash
cd policy-service
npm install
node test-client.js
```

---

## 🔗 Intégration avec le Workflow (Pour Person A - Ilef)

### Intégration SOAP (Identity Verification)
Dans Bonita/Activiti, configurer un connecteur SOAP:
- **WSDL URL**: `http://insurance-identity-soap:4001/soap/identity?wsdl`
- **Operation**: `verifyIdentity`
- **Input**: nationalId, fullName, dateOfBirth
- **Output**: isValid (boolean)

### Intégration gRPC (Policy Validation)
Option 1: Appel gRPC direct depuis le workflow
- **Host**: `insurance-policy-grpc:4002`
- **Proto**: Importer `policy.proto`
- **Method**: `ValidatePolicy`

Option 2: Créer un wrapper REST (si le BPMN ne supporte pas gRPC directement)

---

## 📊 Architecture des Services

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSURANCE CLAIM SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Person C       │    │  Person B       │    │  Person A   │ │
│  │  (Sarra)        │    │  (Cyrine)       │    │  (Ilef)     │ │
│  │                 │    │                 │    │             │ │
│  │  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────┐  │ │
│  │  │ GraphQL   │  │    │  │   SOAP    │  │    │  │ BPMN  │  │ │
│  │  │ Port 4000 │◄─┼────┼──┤ Port 4001 │◄─┼────┼──┤ Bonita│  │ │
│  │  └───────────┘  │    │  └───────────┘  │    │  │       │  │ │
│  │                 │    │                 │    │  │       │  │ │
│  │  ┌───────────┐  │    │  ┌───────────┐  │    │  │       │  │ │
│  │  │   REST    │◄─┼────┼──┤   gRPC    │◄─┼────┼──┤       │  │ │
│  │  │ Port 4000 │  │    │  │ Port 4002 │  │    │  └───────┘  │ │
│  │  └───────────┘  │    │  └───────────┘  │    │             │ │
│  │                 │    │                 │    │             │ │
│  │  ┌───────────┐  │    │                 │    │             │ │
│  │  │PostgreSQL │  │    │                 │    │             │ │
│  │  │ Port 5432 │  │    │                 │    │             │ │
│  │  └───────────┘  │    │                 │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

```
insurance-claim-system/
├── docker-compose.yml          # Configuration Docker complète
├── identity-service/           # Service SOAP (Cyrine)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── identity.wsdl           # 📄 À donner à Ilef (Person A)
│   └── test-client.js
├── policy-service/             # Service gRPC (Cyrine)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── policy.proto            # 📄 À donner à Ilef (Person A)
│   └── test-client.js
└── [autres fichiers Sarra...]
```

---