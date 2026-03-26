# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (`gpt-5.2`)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── maf-loyalty/        # MAF Loyalty Engine frontend (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server integration
│   └── integrations-openai-ai-react/   # OpenAI React integration
├── scripts/                # Utility scripts (seed-maf, hello)
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, scripts)
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Applications

### MAF Loyalty Engine (`artifacts/maf-loyalty`)

AI-powered cross-brand loyalty engine for Majid Al Futtaim.

**Features:**
- Executive Dashboard with cross-brand analytics (top brands bar chart, tier distribution)
- Customer Profiles with tier badges (silver/gold/platinum/diamond)
- Customer Detail view with cross-brand spend breakdown, transaction history, AI offers
- AI Offer Generation - click button to generate personalized weekly offers via GPT-5.2
- Offers management with redemption and status filtering
- MAF Brands grid (Carrefour, VOX Cinemas, Ski Dubai, Mall of the Emirates, Géant, Magic Planet, Dreamscape, ENOVA)
- AI Insights page with cross-brand analytics

**Pages:** Dashboard, Customers, Customer Detail, Offers, MAF Brands, AI Insights

### API Server (`artifacts/api-server`)

Express 5 backend serving all loyalty data.

**Routes:**
- `GET/POST /api/customers` - Customer management
- `GET /api/customers/:id` - Customer detail with transactions, offers, brand spend
- `GET /api/brands` - MAF brands list
- `GET/POST /api/transactions` - Transactions
- `GET /api/offers` - Offers with status filter
- `POST /api/offers/:id/redeem` - Redeem an offer
- `POST /api/ai/generate-offers` - AI-generate personalized weekly offers (uses GPT-5.2)
- `GET /api/ai/analytics` - Cross-brand analytics

## Database Schema

- `brands` - MAF brand catalog
- `customers` - Customer profiles with tier and points
- `transactions` - Cross-brand purchase history
- `offers` - AI-generated personalized offers

## Seed Data

Run: `pnpm --filter @workspace/scripts run seed-maf`
Seeds 9 brands, 10 customers, 31 transactions, 4 sample offers.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`

## Packages

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec + Orval codegen config. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate.

### `lib/db` (`@workspace/db`)

Drizzle ORM schema: brands, customers, transactions, offers.
