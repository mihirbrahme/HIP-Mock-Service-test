# Technical Architecture Document

## Technology Stack

### Backend Services
- **Primary Language**: Node.js (v18.x)
- **Framework**: Express.js (v4.x)
- **API Documentation**: OpenAPI/Swagger 3.0
- **Authentication**: JWT, OAuth2.0

### Databases
- **Primary Database**: PostgreSQL 15
- **Cache Layer**: Redis 7.x
- **Search Engine**: Elasticsearch 8.x (for patient discovery)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **API Gateway**: Kong
- **Service Mesh**: Istio

### Monitoring & Logging
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger

### Testing
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **API Testing**: Postman/Newman
- **Load Testing**: k6

## Service Architecture Details

### 1. API Gateway Service

```mermaid
flowchart TD
    A[External Request] --> B[Kong API Gateway]
    B --> C{Route Handler}
    C --> D[Rate Limiter]
    C --> E[Auth Validator]
    C --> F[Transform]
    
    D --> G[Service Router]
    E --> G
    F --> G
    
    G --> H[Patient Service]
    G --> I[Consent Service]
    G --> J[Health Records]
    G --> K[Auth Service]
```

**Key Components**:
- Route definitions
- Rate limiting configuration
- Authentication middleware
- Request/Response transformation
- Service discovery integration
- Load balancing

### 2. Authentication Service

```mermaid
flowchart TD
    A[Auth Request] --> B[Auth Controller]
    B --> C{Auth Type}
    C -->|JWT| D[JWT Validator]
    C -->|OAuth| E[OAuth Handler]
    
    D --> F[Token Service]
    E --> F
    
    F --> G[(Auth DB)]
    F --> H[Redis Cache]
    
    subgraph "Token Management"
        F
        I[Token Refresh]
        J[Token Blacklist]
    end
```

**Key Components**:
- Token management
- OAuth2.0 implementation
- Role-based access control
- Session management
- Audit logging

### 3. Patient Service

```mermaid
flowchart TD
    A[Patient Request] --> B[Patient Controller]
    B --> C{Operation Type}
    
    C -->|Search| D[Search Service]
    C -->|Register| E[Registration Service]
    C -->|Update| F[Profile Service]
    
    D --> G[Elasticsearch]
    E --> H[(Patient DB)]
    F --> H
    
    subgraph "ABHA Integration"
        I[ABHA Client]
        J[Verification Service]
    end
    
    E --> I
    F --> I
```

**Database Schema**:
```mermaid
erDiagram
    Patient ||--o{ CareContext : has
    Patient {
        uuid id
        string abha_number
        string name
        date dob
        string gender
        json contact
        timestamp created_at
        timestamp updated_at
    }
    CareContext {
        uuid id
        uuid patient_id
        string reference
        string display
        json metadata
        timestamp created_at
    }
```

### 4. Consent Service

```mermaid
flowchart TD
    A[Consent Request] --> B[Consent Controller]
    B --> C{Consent Operation}
    
    C -->|Create| D[Consent Creator]
    C -->|Verify| E[Consent Validator]
    C -->|Revoke| F[Consent Revoker]
    
    D --> G[(Consent DB)]
    E --> G
    F --> G
    
    D --> H[Notification Service]
    F --> H
```

**Database Schema**:
```mermaid
erDiagram
    Consent ||--|{ ConsentArtefact : generates
    Consent {
        uuid id
        uuid patient_id
        string purpose
        string hip_id
        string hiu_id
        timestamp created_at
        string status
    }
    ConsentArtefact {
        uuid id
        uuid consent_id
        json permissions
        timestamp valid_from
        timestamp valid_to
        string signature
    }
```

### 5. Health Records Service

```mermaid
flowchart TD
    A[Record Request] --> B[Records Controller]
    B --> C{Record Type}
    
    C -->|Fetch| D[Record Retriever]
    C -->|Store| E[Record Storage]
    
    D --> F[(Health DB)]
    E --> F
    
    D --> G[FHIR Transformer]
    E --> G
    
    subgraph "Data Processing"
        G
        H[Data Validator]
        I[Schema Enforcer]
    end
```

**Database Schema**:
```mermaid
erDiagram
    HealthRecord ||--|{ Attachment : contains
    HealthRecord {
        uuid id
        uuid patient_id
        uuid care_context_id
        string record_type
        timestamp record_date
        json content
        timestamp created_at
    }
    Attachment {
        uuid id
        uuid record_id
        string mime_type
        string url
        string hash
        timestamp created_at
    }
```

## Infrastructure Architecture

```mermaid
flowchart TD
    A[Load Balancer] --> B[Kubernetes Cluster]
    
    subgraph "Kubernetes Cluster"
        C[Ingress Controller]
        D[Service Mesh]
        
        subgraph "Services"
            E[API Gateway Pods]
            F[Auth Service Pods]
            G[Patient Service Pods]
            H[Consent Service Pods]
            I[Health Records Pods]
        end
        
        subgraph "Data Layer"
            J[(PostgreSQL)]
            K[(Redis)]
            L[Elasticsearch]
        end
        
        subgraph "Monitoring"
            M[Prometheus]
            N[Grafana]
            O[Jaeger]
        end
    end
```

## Security Implementation

```mermaid
flowchart TD
    A[Request] --> B[TLS Termination]
    B --> C[API Gateway]
    C --> D{Security Checks}
    
    D -->|1| E[JWT Validation]
    D -->|2| F[Rate Limiting]
    D -->|3| G[IP Filtering]
    
    E --> H{Service Layer}
    F --> H
    G --> H
    
    H --> I[Encryption]
    I --> J[(Data Store)]
```

## Deployment Strategy

```mermaid
flowchart TD
    A[Source Code] --> B[Build Pipeline]
    B --> C{Environment}
    
    C -->|Dev| D[Dev Cluster]
    C -->|Staging| E[Staging Cluster]
    C -->|Prod| F[Prod Cluster]
    
    subgraph "Deployment Process"
        G[Container Build]
        H[Security Scan]
        I[Deploy]
        J[Health Check]
    end
    
    D --> K[Monitoring]
    E --> K
    F --> K
```

## Integration Points

### External Systems
1. ABDM Gateway
2. Hospital Information System
3. ABHA System
4. Consent Manager

### Internal Systems
1. Service-to-Service Communication
2. Data Synchronization
3. Event Broadcasting

## Performance Considerations

1. **Caching Strategy**
   - API Response Caching
   - Database Query Caching
   - Session Caching

2. **Database Optimization**
   - Connection Pooling
   - Query Optimization
   - Index Management

3. **Scalability**
   - Horizontal Scaling
   - Load Balancing
   - Resource Management 