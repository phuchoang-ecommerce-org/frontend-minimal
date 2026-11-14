# Market frontend

## What is it?

A web storefront for the marketplace API. It supports public product discovery, Guest and Member carts, COD checkout, Member order history and cancellation, and Seller cash recording.

## What is it built from?

This app consumes the Java/Spring Boot backend in `../backend` through the approved OpenAPI contract in `../docs-minimal/SolutionArchitecture/api-contract/openapi.yaml`. Next.js handles browser pages, server-side API calls, and same-origin routes. Product, cart, identity, stock, and authorization rules remain in the backend.

## What is it used for?

Guests can browse products, select available variants, and build a cart. Members can sign in, merge their Guest cart, select an owned address, place COD orders, inspect status, and cancel fully unpaid orders. Sellers can view owned portions and record COD cash.

## Tech stack

- Next.js 16 App Router, React 19, TypeScript, pnpm
- Tailwind CSS v4 for storefront styling, Ant Design for controls, and TanStack Query v5 for in-memory interactive cart data
- `openapi-typescript` for generated contract types
- Spring Boot API and PostgreSQL in the separate backend project

## How can we start it?

Prerequisites: Node.js compatible with Next.js 16, pnpm 12, and a running backend API. Follow `../backend/README.md` to start PostgreSQL and the backend with `SPRING_PROFILES_ACTIVE=dev`. To see purchasable products and test login merge, enable the backend's disposable development fixtures using its documented local environment settings.

From this directory:

```sh
pnpm install --frozen-lockfile
export APP_PROFILE=dev
export API_BASE_URL=http://localhost:8080
export SESSION_SECRET="replace-with-a-random-secret-of-at-least-32-characters"
pnpm dev
```

Open <http://localhost:3000>. Keep `SESSION_SECRET` private and stable across server restarts; generate one with `openssl rand -hex 32`. The backend development profile allows `http://localhost:3000` as its cart Origin by default. If using a different frontend origin, set `CART_ALLOWED_ORIGINS` in the backend accordingly.

### One-click development accounts

When `APP_PROFILE=dev`, the login page shows Member, Seller, and Admin buttons. To make them sign in, enable the backend's development fixtures and set these variables in the frontend's ignored `.env.local` file, using the plain passwords that match the BCrypt hashes configured for the backend seed:

```text
DEV_MEMBER_LOGIN=synthetic.member@example.test
DEV_MEMBER_PASSWORD=<local Member fixture password>
DEV_SELLER_LOGIN=synthetic.seller@example.test
DEV_SELLER_PASSWORD=<local Seller fixture password>
DEV_ADMIN_LOGIN=synthetic.admin@example.test
DEV_ADMIN_PASSWORD=<local Admin fixture password>
```

The buttons send only a role to the same-origin frontend route. Credentials stay on the server and are sent to the backend's normal login endpoint. The route accepts requests only in the dev profile on localhost; production requests receive 404. The backend [README](../backend/README.md#development-seed-accounts) lists the seeded account names. Do not commit `.env.local`.

For production, use `APP_PROFILE=prod`, an HTTPS backend URL, a deployment-injected `SESSION_SECRET`, and `pnpm build && pnpm start`. Deploy the frontend over HTTPS so the Secure session cookie works. The backend does not expose a quick-login endpoint; the frontend's local development action uses normal login with server-held fixture credentials.

Verification commands:

```sh
pnpm contract:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run `pnpm contract:generate` when the approved OpenAPI contract changes. The contract path is a sibling project, so it must be present for generation and drift checks.

### Browser tests

The Playwright suite expects a disposable backend development fixture with a Member, two Sellers, two synthetic products, and a Member-owned address. See [Sprint 2 browser run sheet](tests/sprint2-run-sheet.md). Supply `TEST_MEMBER_LOGIN`, `TEST_SELLER_LOGIN`, `TEST_SELLER_B_LOGIN`, and `TEST_MEMBER_PASSWORD` as local environment variables; do not commit credentials. The browser binary can be installed with `pnpm exec playwright install chromium`.
