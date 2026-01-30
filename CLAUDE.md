# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
язык общения и комментарии в коде на русском языке

## Project Overview

This is a **Transport Management System** (logistics/transportation management) built for the Russian market. The system manages freight/transport orders, carrier and client relationships, route planning, document generation, and billing for a logistics company.

## Tech Stack

- **Backend**: Node.js with TypeScript, Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with access/refresh tokens
- **Real-time**: Socket.io for live updates
- **File Storage**: Cloud.ru S3 (AWS SDK v3 compatible)
- **External APIs**:
  - DaData (Russian address validation)
  - OpenRouteService (route optimization)
  - Nodemailer (email)

## Development Commands

```bash
# Development with hot-reload
npm run dev

# Development with debug inspector on port 4321
npm run dev:debug

# Run tests
npm test

# Lint code
npm run lint

# Build TypeScript
npm run build
```

## Architecture

The project follows **Clean Architecture** with clear separation of concerns:

### Core Layers

1. **API Layer** (`src/api/`)
   - Route definitions with Zod validation schemas
   - Middleware chain: `jwtAuth` → `queryValidator/bodyValidator` → controller
   - Export patterns: `export default router`

2. **Controller Layer** (`src/controllers/`)
   - Handle HTTP requests/responses
   - Permission checks via `PermissionService.check()`
   - Error handling: `res.status(e.statusCode || 500).json(e.message)`

3. **Service Layer** (`src/services/`)
   - Business logic implementation
   - Orchestrate between repositories
   - Export single class instance per service

4. **Repository Layer** (`src/repositories/`)
   - Data access with MongoDB aggregation pipelines
   - Complex queries built as pipeline fragments
   - Domain events via `ts-bus`

5. **Domain Layer** (`src/domain/`)
   - Business entities with validation
   - Domain events
   - DTOs for data transfer

6. **Models** (`src/models/`)
   - Mongoose schemas
   - Database entity definitions

### Key Patterns

- **Path Alias**: `@/*` maps to `./src/*` (configured in tsconfig.json)
- **Validation**: AJV (not Zod) for request/response validation
- **Authentication**: JWT middleware extracts `userId` and `companyId` from token
- **Permissions**: Operation-based checks (e.g., `'order:daysForWrite'`, `'order:writeFinalPrices'`)
- **Error Handling**: Custom error types with `statusCode` property
- **Real-time Updates**: Socket.io rooms for entity-based notifications

## Database

- **Name**: `transport_dev`
- **URL**: `mongodb://localhost:27017/transport_dev`
- **ODM**: Mongoose with `strictQuery: false`

Key entities:

- **Order**: Transportation orders with status workflow
- **Truck/Driver/Crew**: Vehicle and staff management
- **Carrier/Partner**: External companies
- **Address/Region/City/Zone**: Geographic hierarchy
- **PaymentInvoice**: Financial billing
- **DocTemplate**: Document generation templates

## Socket.IO Real-time Features

- Configuration in `src/socket/index.ts`
- Authentication middleware for socket connections
- Entity-based rooms for targeted updates
- Handlers for: orders, downtimes, schedule notes, mass updates, S3 storage

## External Services

### Cloud.ru S3

- Endpoint: `https://s3.cloud.ru`
- Region: `ru-central-1`
- Used for file storage and document uploads

### DaData API

- Russian address validation and geocoding
- API key and secret in `.env`

### OpenRouteService

- Route optimization and distance calculation
- Used for transport route planning

## Testing

- Framework: Jest with ts-jest
- Test files: `*.test.ts` pattern
- Mock libraries: node-mocks-http, mockdate
- Example test structure in `src/utils/isSubsequence.test.ts`

## Code Style

- **ESLint**: TypeScript strict mode disabled, Prettier integration
- **Prettier**: 2-space tabs, single quotes, no semicolons, trailing commas (es5)
- **Imports**: Absolute paths with `@/` alias
- **File naming**: kebab-case for files, PascalCase for classes

## Environment

Required `.env` variables:

```
NODE_ENV=test
DB_URL=mongodb://localhost:27017/transport_dev
PORT=3040
JWT_SECRET=...
ACCESS_JWT_SECRET=...
REFRESH_JWT_SECRET=...
DADATA_API_KEY=...
DADATA_SECRET_KEY=...
ORS_API_KEY=...
S3_*=...
```

## Common Operations

### Creating a New API Endpoint

1. Create route file in `src/api/[entity]/index.ts`
2. Add validation schemas in `schemes.ts` (using AJV format)
3. Add controller methods in `src/controllers/[entity].controller.ts`
4. Implement business logic in `src/services/[entity].service.ts`
5. Add data access in `src/repositories/[entity]/` if needed
6. Register router in `src/app.ts`

### Adding Socket Event Handler

1. Create handler file in `src/socket/[handler].ts`
2. Export function: `export const [handlerName]Handler = (io, socket) => { ... }`
3. Import and register in `src/socket/index.ts`

### Database Queries

- Use aggregation pipelines for complex queries
- Build reusable pipeline fragments in `repositories/[entity]/pipelines/`
- Follow the pattern: matcher → lookups → projections → sort → limit

## Important Notes

- All API routes require JWT authentication
- Russian language is used throughout the codebase
- `@ts-nocheck` is used in many files (legacy code)
- Strict TypeScript is enabled but some files bypass type checking
- MongoDB aggregation is preferred over complex Mongoose queries
- Real-time updates should emit to entity-specific rooms
