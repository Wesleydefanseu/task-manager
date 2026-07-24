# Fix Plan: TypeError - Cannot read properties of undefined (reading 'findMany')

## Root Cause
Database URL path mismatch in Prisma adapter initialization. The URL `"file:./prisma/dev.db"` doesn't match the actual database location at `./dev.db`. This caused the Prisma client to point to a non-existent database file, resulting in all models being `undefined`.

## Steps
- [x] 1. Analyze the issue — complete (root cause identified)
- [x] 2. Fix database URL in `src/lib/prisma.ts`: `"file:./prisma/dev.db"` → `"file:./dev.db"`
- [x] 3. Fix database URL in `prisma/seed.ts` (same mismatch)
- [x] 4. Run `npx prisma generate` to ensure client is up to date — already done
- [x] 5. Run `npx prisma migrate deploy` to apply latest migrations (including AutomationRule & Notification tables) — already applied
- [x] 6. Restart the dev server — done
- [x] 7. Test API endpoints — ✅ notifications 200, automation 200, no more TypeError

