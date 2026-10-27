# Swazei POS Backend

A multi-tenant Point of Sale (POS) backend built with NestJS, TypeORM, PostgreSQL, JWT authentication, and a mock payment provider.

## 1. Setup and Environment Configuration

### Prerequisites

- Node.js and npm
- PostgreSQL

### Installation

Clone or extract the project, then install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the environment variables:

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=swazei_pos

JWT_SECRET=secret_code
JWT_EXPIRES_IN=1d

MOCK_PAYMENT_MODE=SUCCESS
```

Build and start the application:

```bash
npm run build
npm run start:dev
```

In a separate terminal, initialize the development data:

```bash
npm run seed
```

The API is available at:

`http://localhost:3000/api`

Development seed credentials:

- Email: `admin@gmail.com`
- Password: `Test@123`

Change development credentials and use a secure JWT secret outside local development.

## 2. Database and Schema Decisions

PostgreSQL is used as the relational database, with TypeORM managing entity mapping and database access.

The primary entities are:

- **Merchant:** Represents a tenant or business.
- **Store:** Represents a store belonging to a merchant.
- **User:** Stores authentication details, tenant/store association, role, and active status.
- **Product:** Stores product details, SKU, and price in paise.
- **Inventory:** Tracks stock quantities for products.
- **Sale:** Records transactions, totals, payment status, and idempotency information.
- **SaleItem:** Records the products, quantities, and pricing associated with a sale.

UUIDs are used for entity identifiers. Monetary values are represented as integer paise to avoid floating-point rounding errors.

Relationships and foreign keys maintain referential integrity. Product SKUs should be unique within the appropriate business scope, and inventory quantities must not become negative.

For production, use version-controlled TypeORM migrations rather than relying on automatic schema synchronization.

## 3. Tenant Isolation

The application uses merchant-scoped data access.

After authentication, the JWT identifies the authenticated user and their merchant/store context. Protected endpoints derive the tenant identifier from the authenticated user rather than trusting a merchant ID supplied in the request body.

Database queries for products, inventory, and sales are scoped to the authenticated merchant. Store-level operations should additionally validate store ownership.

Role-based authorization restricts administrative operations, such as creating products and updating inventory, to permitted roles.

Tenant isolation must be applied consistently to reads, updates, deletes, and related-entity lookups. For stronger defense in depth, production deployments can add PostgreSQL row-level security and tenant-aware composite constraints.

## 4. Transaction and Concurrency Strategy

Sale creation uses a database transaction so that related database changes are committed together or rolled back together.

The intended flow is:

1. Validate the requested products and quantities.
2. Lock the relevant inventory rows within the transaction.
3. Verify that sufficient stock is available.
4. Calculate the sale total from trusted database prices.
5. Create the sale and its sale items.
6. Apply inventory deductions after successful payment processing.
7. Commit the transaction.

Row-level locking helps prevent two concurrent sales from consuming the same available stock. Inventory updates should also enforce a non-negative quantity constraint.

Payment processing introduces an important trade-off: external payment calls should not be held inside long-running database transactions in a production implementation. A payment authorization/capture workflow, durable payment state, and reconciliation process are preferable when integrating a real payment provider.

## 5. Idempotency

Sale creation requires an `Idempotency-Key` request header.

Example:

```http
POST /api/sales
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Idempotency-Key: sale-20261027-001
```

The key identifies a sale-creation request so that a retry can return the existing result instead of creating a duplicate sale.

Keys should be scoped to the relevant tenant or store and protected by a database uniqueness constraint. A production implementation should also store a request hash and reject reuse of the same key with a different payload.

Idempotency records and sale creation should be persisted atomically. Payment-provider idempotency should be used as well when supported.


## 6. Important Assumptions and Trade-offs

- The payment provider is mocked for development and testing; it is not a real payment integration.
- JWT authentication and role checks protect the API, but authorization must also be enforced at the data-access layer.
- PostgreSQL transactions and row locks protect inventory consistency during concurrent sales.
- TypeORM schema synchronization is suitable only for local development; production should use migrations.
- Redis configuration alone does not provide caching or queue processing.
- Production readiness requires integration tests, concurrency tests, logging, rate limiting, secret management, database backups, and payment reconciliation.

## 7. Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and obtain a JWT |
| GET | `/api/auth/me` | Get the authenticated user |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create a product |
| GET | `/api/inventory` | View inventory |
| PATCH | `/api/inventory/:productId` | Update inventory |
| POST | `/api/sales` | Create a sale |
| GET | `/api/sales` | List sales |
| GET | `/api/sales/:id` | Get sale details |

Protected endpoints require a valid JWT in the `Authorization: Bearer` header. Product creation and inventory updates require an authorized role.

## 8. Build and Test

Build the application:

```bash
npm run build
```

Run the development server:

```bash
npm run start:dev
```

Run tests, if configured:

```bash
npm test
```

Before submission, verify the implementation against the requirements, especially tenant-scoped queries, database constraints, transaction rollback, concurrent sales, idempotency conflicts, and Redis/queue behavior.
