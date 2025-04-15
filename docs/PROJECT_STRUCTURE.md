# Project Structure

## Root Directory Structure

```
/
├── src/                    # Source code
├── tests/                  # Test files
├── config/                 # Configuration files
├── scripts/                # Utility and deployment scripts
├── docs/                   # Documentation
├── .github/                # GitHub Actions workflows
├── kubernetes/             # Kubernetes manifests
├── docker/                 # Docker configurations
├── .env.example           # Example environment variables
├── package.json           # Node.js dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
└── README.md              # Project documentation
```

## Detailed Structure

### Source Code (`/src`)

```
src/
├── api/                    # API layer
│   ├── routes/            # Route definitions
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Custom middlewares
│   └── validators/        # Request validation
│
├── services/              # Business logic
│   ├── auth/             # Authentication service
│   ├── patient/          # Patient management
│   ├── consent/          # Consent management
│   ├── health-records/   # Health records management
│   └── notification/     # Notification handling
│
├── models/               # Data models
│   ├── database/        # Database models
│   └── dto/             # Data Transfer Objects
│
├── infrastructure/       # Infrastructure layer
│   ├── database/        # Database connections
│   ├── cache/           # Cache implementations
│   ├── messaging/       # Message queue
│   └── external/        # External service clients
│
├── utils/               # Utility functions
│   ├── encryption/      # Encryption utilities
│   ├── validation/      # Common validators
│   └── helpers/         # Helper functions
│
└── config/              # Application configuration
    ├── database.ts
    ├── cache.ts
    └── app.ts
```

### Tests (`/tests`)

```
tests/
├── unit/                # Unit tests
│   ├── services/
│   ├── models/
│   └── utils/
│
├── integration/         # Integration tests
│   ├── api/
│   ├── database/
│   └── external/
│
├── e2e/                # End-to-end tests
│   ├── flows/
│   └── scenarios/
│
└── fixtures/           # Test data
    ├── patients/
    ├── consents/
    └── health-records/
```

### Configuration (`/config`)

```
config/
├── environments/       # Environment-specific configs
│   ├── development.ts
│   ├── staging.ts
│   └── production.ts
│
├── kubernetes/        # Kubernetes configurations
│   ├── development/
│   ├── staging/
│   └── production/
│
└── monitoring/       # Monitoring configurations
    ├── prometheus/
    └── grafana/
```

### Documentation (`/docs`)

```
docs/
├── api/              # API documentation
├── architecture/     # Architecture documents
├── diagrams/        # System diagrams
├── setup/           # Setup guides
└── testing/         # Testing documentation
```

### Kubernetes (`/kubernetes`)

```
kubernetes/
├── base/            # Base configurations
│   ├── deployments/
│   ├── services/
│   └── configmaps/
│
└── overlays/        # Environment overlays
    ├── development/
    ├── staging/
    └── production/
```

### Docker (`/docker`)

```
docker/
├── development/
│   ├── Dockerfile
│   └── docker-compose.yml
├── staging/
│   └── Dockerfile
└── production/
    └── Dockerfile
```

## Key Aspects

### 1. Modular Architecture
- Each service is self-contained
- Clear separation of concerns
- Easy to test and maintain
- Scalable structure

### 2. Configuration Management
- Environment-specific configurations
- Secrets management
- Feature flags
- Logging configurations

### 3. Testing Strategy
- Separate test types
- Fixture management
- Test utilities
- Mock data

### 4. Infrastructure as Code
- Kubernetes manifests
- Docker configurations
- CI/CD pipelines
- Monitoring setup

### 5. Documentation
- API specifications
- Architecture documents
- Setup guides
- Testing documentation

## Development Workflow

1. Source code changes in `/src`
2. Unit tests in `/tests/unit`
3. Integration tests in `/tests/integration`
4. Build Docker images using `/docker`
5. Deploy using Kubernetes manifests in `/kubernetes`
6. Monitor using configurations in `/config/monitoring`

## Best Practices

1. **Code Organization**
   - Follow domain-driven design principles
   - Keep related files together
   - Use clear, consistent naming

2. **Testing**
   - Maintain test hierarchy
   - Organize fixtures logically
   - Separate test utilities

3. **Configuration**
   - Use environment variables
   - Separate sensitive information
   - Environment-specific configs

4. **Documentation**
   - Keep docs close to code
   - Use diagrams for clarity
   - Regular updates 