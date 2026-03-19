Ce projet implémente un système complet de gestion des sinistres d'assurance basé sur une architecture microservices. Il automatise le flux allant de la soumission du client jusqu'au paiement final, en intégrant des technologies hétérogènes (GraphQL, SOAP, gRPC, REST) et une orchestration BPMN.




##  Architecture Globale

Le système est découpé en services autonomes communiquant via un réseau virtuel Docker. Chaque service est responsable d'une étape spécifique du métier.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │    PORT 4000     │  │    PORT 4001     │  │    PORT 4002     │  │
│  │  GraphQL + REST  │  │   SOAP Service   │  │   gRPC Service   │  │
│  │ (Core & Rules)   │  │    (Identity)    │  │     (Policy)     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│          │                    │                     │               │
│          ▼                    ▼                     ▼               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │    PORT 4003-4007│  │    PORT 5432     │  │   BPMN ENGINE    │  │
│  │ Business Services│  │  PostgreSQL DB   │  │ (Bonita/Activiti)│  │
│  │   (REST JSON)    │  │  (State Machine) │  │  (Orchestrator)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

```

##  Résumé des Services

| Service | Protocole | Port | Rôle Principal |
|:---|:---|:---|:---|
| **Claim Management** | GraphQL | 4000 | Soumission et suivi des dossiers par le client. |
| **Business Rules** | REST | 4000 | Détection de fraude et calcul de compensation. |
| **Identity Svc** | SOAP | 4001 | Vérification KYC (Know Your Customer). |
| **Policy Svc** | gRPC | 4002 | Validation de la couverture et des plafonds. |
| **Flow Services** | REST | 4003-7| Gestion documentaire, Expertises et Notifications. |
| **Persistence** | SQL | 5432 | Base PostgreSQL (State Machine centralisée). |



##  Démarrage Rapide

### Prérequis
* Docker & Docker Compose installés.
* Postman (v10+ recommandé pour le support gRPC).

### Installation et Lancement
Pour démarrer l'ensemble de l'infrastructure en une seule commande :
```bash
docker compose up --build -d
```


##  Stratégie de Validation & Testing

L'intégralité du système a été validée via **Postman** pour garantir l'interopérabilité des protocoles entre les différents services.

Une collection unique regroupe l'ensemble des requêtes pour valider le flux :
* **GraphQL** : Tests des mutations de soumission et des queries de suivi (Port 4000).
* **REST** : Validation des règles métier (Fraude/Calcul) et mise à jour des statuts (Port 4000).
* **SOAP** : Vérification de l'identité via l'enveloppe XML (Port 4001).

Pour tester le service de police haute performance :
1. Créez une nouvelle requête de type **gRPC** dans Postman.
2. Utilisez l'URL : `http://localhost:4002/`.
3. Sous l'onglet **Service Definition**, importez manuellement le fichier `policy.proto` situé dans le dossier `/policy-service`.
4. Sélectionnez la méthode souhaitée (ex: `ValidatePolicy`) et cliquez sur **Invoke**.

##  Fichiers Clés
* `API_DOCS.md` : Documentation détaillée des endpoints et payloads.
* `docker-compose.yml` : Orchestration complète des microservices.
* `/policy-service/policy.proto` : Définition gRPC pour l'import Postman.
* `/identity-service/identity.wsdl` : Contrat SOAP pour le connecteur BPMN.

