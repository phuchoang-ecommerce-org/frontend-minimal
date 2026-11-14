# Sprint 2 browser rehearsal

Use a disposable PostgreSQL database and the backend development fixture. Seed a second synthetic Seller product with `tests/seed-second-seller.sql` and create a Member-owned address through the backend API. Do not point reset or seed commands at a shared database. Keep credentials and tokens in local environment variables only.

1. Record frontend and backend Git revisions and start both services against the same disposable fixture.
2. Run `pnpm contract:check`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm test` with the fixture account variables documented in the README.
3. Confirm Guest cart merge, a two-Seller COD order, order detail and history, each Seller's own portion and cash action, aggregate Paid status, paid cancellation rejection, and a separate pending cancellation.
4. Record check results, the 12 demo operation outcomes, defects, and omitted routes. Keep backend race and rollback evidence from its own suite beside the browser record.
5. Reset only the disposable fixture and repeat steps 1–4. Freeze the verified revisions after both runs pass.

If the backend or fixture is unavailable, mark the live browser rehearsal blocked; static checks do not establish a completed end-to-end run.
