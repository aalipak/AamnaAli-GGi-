# GGI Backend Test - AI Chat & Subscription Management System

A TypeScript backend application implementing AI chat functionality with subscription-based usage management, following Clean Architecture and Domain-Driven Design principles.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Subscription Tiers](#subscription-tiers)
- [Error Handling](#error-handling)
- [Database](#database)
- [Code Quality](#code-quality)
- [Project Structure](#project-structure)
- [Technical Stack](#technical-stack)
- [Design Decisions](#design-decisions)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Author](#author)

## Features

### Module 1: AI Chat Module

- Mock OpenAI API responses with simulated delay for realistic behavior
- Persistent storage of chat messages (question, answer, tokens)
- Monthly usage tracking (3 free messages per month per user)
- Automatic reset of free quota on the 1st of each month
- Subscription-based quota management (Basic, Pro, Enterprise)
- Structured error handling for quota-exceeded scenarios

### Module 2: Subscription Bundle Module

- Create subscriptions with three tiers:
  - **Basic** — 10 messages
  - **Pro** — 100 messages
  - **Enterprise** — Unlimited
- Support for monthly and yearly billing cycles
- Automatic renewal functionality (simulated)
- Simulated billing system including randomized payment failures for testing
- Subscription cancellation while preserving full usage history
- Support for multiple active subscriptions per user

## Architecture

The project follows Clean Architecture with Domain-Driven Design (DDD), separating domain logic from infrastructure and delivery layers.

```
src/
├── chat/
│   ├── domain/          # Entities and business logic (ChatMessage, UsageTracker)
│   ├── services/        # Application services (ChatService)
│   ├── repositories/    # Data access layer (ChatRepository)
│   └── controllers/     # HTTP handlers (ChatController)
├── subscription/
│   ├── domain/          # Subscription domain entities
│   ├── services/        # SubscriptionService, Billing logic
│   ├── repositories/    # SubscriptionRepository
│   └── controllers/     # SubscriptionController
├── database/            # Database initialization and migrations
├── app.ts               # Express app configuration and middleware
└── server.ts            # Server entry point
```

## Installation

### Prerequisites

- Node.js v14 or higher
- npm or yarn

### Steps

1. Clone the repository:

```bash
git clone [<your-repo-url>](https://github.com/aalipak/AamnaAli_GGi.git)
cd AamnaAli_GGi
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Running the Application

### Development mode (hot reload)

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

**Server default:** http://localhost:3000

## API Endpoints

### Chat Endpoints

#### Ask a Question

```http
POST /api/chat/ask
Content-Type: application/json

{
  "userId": 1,
  "question": "What is TypeScript?"
}
```

**Successful Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "question": "What is TypeScript?",
    "answer": "That's an interesting question about...",
    "tokens": 45,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Quota-exceeded Response Example:**

```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "No active subscription found. Please subscribe to continue."
}
```

### Subscription Endpoints

#### Create Subscription

```http
POST /api/subscriptions
Content-Type: application/json

{
  "userId": 1,
  "tier": "Pro",
  "billingCycle": "monthly",
  "autoRenew": true
}
```

- **tier values:** Basic, Pro, Enterprise
- **billingCycle values:** monthly, yearly

#### Get User Subscriptions

```http
GET /api/subscriptions/user/:userId
```

#### Cancel Subscription

```http
POST /api/subscriptions/:subscriptionId/cancel
Content-Type: application/json

{
  "userId": 1
}
```

#### Simulate Payment (for testing auto-renewal)

```http
POST /api/subscriptions/:subscriptionId/simulate-payment
```

### Health Check

```http
GET /health
```

Returns 200 OK with basic service status.

## Usage Examples

Create a subscription:

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "tier": "Pro", "billingCycle": "monthly", "autoRenew": true}'
```

Ask a question (free quota used first then subscription):

```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "question": "Explain Clean Architecture"}'
```

List user subscriptions:

```bash
curl http://localhost:3000/api/subscriptions/user/1
```

Cancel a subscription:

```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

## Subscription Tiers

| Tier | Messages (per month) | Monthly Price | Yearly Price |
|------|----------------------|---------------|--------------|
| Basic | 10 | $9.99 | $99.99 |
| Pro | 100 | $29.99 | $299.99 |
| Enterprise | Unlimited | $99.99 | $999.99 |

### Free Tier

All users receive 3 free messages per month. The free quota is automatically reset on the 1st of each month. The system consumes free messages first; when free quota is exhausted, it consumes subscription quota (if active).

## Error Handling

The API returns structured error responses with consistent codes and messages. Example structure:

```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "No active subscription found. Please subscribe to continue."
}
```

**Common error codes:**

- **400 BAD_REQUEST** — Invalid request parameters
- **403 FORBIDDEN** — Quota exceeded or insufficient permission
- **404 NOT_FOUND** — Resource not found
- **500 INTERNAL_ERROR** — Server error

## Database

Uses SQLite by default for simple, serverless persistence (development/testing).

**Tables:**

- **chat_messages** — Stores chat interactions (id, userId, question, answer, tokens, timestamp)
- **monthly_usage** — Tracks free message usage per user per month (userId, yearMonth, usedCount)
- **subscriptions** — Stores subscription records (id, userId, tier, billingCycle, startDate, endDate, active, autoRenew, billingStatus)

**Database file:** database.sqlite (created on first run)

## Code Quality

- TypeScript with strict types
- ESLint + Prettier for linting and formatting
- Layered architecture following Clean Architecture and DDD
- Repository pattern for data access
- DTOs for request/response shapes

**Run linters and formatters:**

```bash
npm run lint
npm run format
```

## Project Structure

```
.
├── src/
│   ├── chat/
│   │   ├── domain/
│   │   │   ├── ChatMessage.ts
│   │   │   └── UsageTracker.ts
│   │   ├── services/
│   │   │   └── ChatService.ts
│   │   ├── repositories/
│   │   │   └── ChatRepository.ts
│   │   └── controllers/
│   │       └── ChatController.ts
│   ├── subscription/
│   │   ├── domain/
│   │   │   └── Subscription.ts
│   │   ├── services/
│   │   │   └── SubscriptionService.ts
│   │   ├── repositories/
│   │   │   └── SubscriptionRepository.ts
│   │   └── controllers/
│   │       └── SubscriptionController.ts
│   ├── database/
│   │   └── init.ts
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## Technical Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** SQLite3 (default)
- **Architecture:** Clean Architecture / Domain-Driven Design
- **Code Quality:** ESLint + Prettier

## Design Decisions

- **Clean Architecture** — separates business logic, application logic, and infrastructure for better maintainability and testability.
- **Domain-Driven Design** — encapsulates business rules in domain entities (e.g., Subscription, UsageTracker).
- **SQLite** — simple and easy for local development and test runs. Easy to migrate to PostgreSQL/other DB later.
- **Mock AI** — realistic mock responses with delays simulate real external API latency during development/testing.
- **Simulated Billing** — random payment failures used to test retry logic and error handling.

## Future Enhancements

- Add authentication and authorization (JWT)
- Integrate a real payment gateway (Stripe/PayPal)
- Implement real cron jobs for subscription renewals
- Add rate limiting and request throttling
- Implement pagination for chat history endpoints
- Add logging and monitoring middleware
- Add unit and integration tests with Jest
- Dockerize the application for containerized deployments
- Provide OpenAPI/Swagger documentation
- Add webhooks for subscription events and payment notifications
- Add an admin dashboard for usage analytics

## License

MIT

## Author

Aamna Ali

## Submission

This project was created as part of the GGI Backend Test assignment, demonstrating proficiency in TypeScript, Clean Architecture, Domain-Driven Design, and REST API development.


