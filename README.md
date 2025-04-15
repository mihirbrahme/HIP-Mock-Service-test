# Mock Health Information Provider System

A mock implementation of a health information provider system for certification purposes. This system provides APIs for managing patient health records, consents, and authentication.

## Features

- Patient Management
- Health Record Management
- Consent Management
- Authentication and Authorization
- Logging and Monitoring

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- TypeScript (v4 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mock-health-info-provider
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Development

Run the development server:
```bash
npm run dev
```

## Building

Build the project:
```bash
npm run build
```

## Testing

Run tests:
```bash
npm test
```

## API Documentation

### Authentication
- POST /api/auth/token - Generate authentication token
- POST /api/auth/validate - Validate authentication token
- POST /api/auth/refresh - Refresh authentication token

### Patients
- POST /api/patients - Create a new patient
- GET /api/patients/:id - Get patient by ID
- PUT /api/patients/:id - Update patient
- DELETE /api/patients/:id - Delete patient
- GET /api/patients - List patients

### Health Records
- POST /api/health-records - Create a new health record
- GET /api/health-records/:id - Get health record by ID
- GET /api/health-records/patient/:patientId - Get patient's health records
- PUT /api/health-records/:id - Update health record
- DELETE /api/health-records/:id - Delete health record
- PATCH /api/health-records/:id/status - Change health record status
- GET /api/health-records/:id/history - Get health record history

### Consents
- POST /api/consents - Create a new consent
- GET /api/consents/:id - Get consent by ID
- PUT /api/consents/:id - Update consent
- DELETE /api/consents/:id - Delete consent
- PATCH /api/consents/:id/status - Change consent status

## Project Structure

```
src/
├── controllers/         # Request handlers
├── services/           # Business logic
├── middleware/         # Express middleware
├── routes/            # Route definitions
├── types/             # TypeScript types
├── utils/             # Utility functions
├── app.ts             # Express application
└── index.ts           # Application entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 