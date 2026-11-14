# Market frontend

## What is it?

A web storefront for the marketplace API. Sprint 1 supports public product discovery, Guest cart edits, Member login, Guest-to-Member cart merge, and Member cart reads. Checkout and Seller order screens are planned for a later sprint.

## What is it built from?

This app consumes the Java/Spring Boot backend in `../backend` through the approved OpenAPI contract in `../docs-minimal/SolutionArchitecture/api-contract/openapi.yaml`. Next.js handles browser pages, server-side API calls, and same-origin routes. Product, cart, identity, stock, and authorization rules remain in the backend.

## What is it used for?

Guests can browse products, select available variants, and build a cart. Members can sign in and receive their Guest cart, see any rejected lines, and edit the resulting cart. Seller and Admin accounts can log in but have no Sprint 1 management screens.

## Tech stack

- Next.js 16 App Router, React 19, TypeScript, pnpm
- Ant Design for controls and TanStack Query v5 for in-memory interactive cart data
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

For production, use `APP_PROFILE=prod`, an HTTPS backend URL, a deployment-injected `SESSION_SECRET`, and `pnpm build && pnpm start`. Deploy the frontend over HTTPS so the Secure session cookie works. There is no development quick-login route because the current backend does not provide one.

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

The Playwright suite expects the backend's disposable development fixture with one Member, Seller, and the synthetic Java Guide product. To test the two-Seller cart, seed a second synthetic Seller product into that **disposable test database only** using `tests/seed-second-seller.sql` (for example, pipe the file to `psql` in the test database container). Supply `TEST_MEMBER_LOGIN`, `TEST_SELLER_LOGIN`, and `TEST_MEMBER_PASSWORD` as local environment variables when running `pnpm test`; do not commit credentials. The browser binary can be installed with `pnpm exec playwright install chromium`.
