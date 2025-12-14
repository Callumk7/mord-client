# Task 02: Generate and Run Database Migration

## Status
✅ Complete

## Description
Generate and apply the database migration to create the `warband_state_changes` table.

## Dependencies
- Task 01: Add State Changes Table to Schema

## Commands to Run

### 1. Generate migration
```bash
pnpm db:generate
```

This will create a new migration file in the `drizzle/` directory based on schema changes.

### 2. Review the migration
Check the generated SQL file in `drizzle/` to ensure it looks correct. It should contain:
- `CREATE TABLE warband_state_changes` statement
- Foreign key constraints to `warbands` and `matches` tables
- All the columns defined in the schema

### 3. Apply the migration
```bash
pnpm db:push
```

This will apply the migration to your database.

### 4. Verify in Drizzle Studio
```bash
pnpm db:studio
```

Open Drizzle Studio and verify:
- The `warband_state_changes` table exists
- It has all expected columns
- Foreign key relationships are correct

## Rollback Plan
If something goes wrong:
1. You can manually drop the table: `DROP TABLE warband_state_changes;`
2. Or restore from a backup if you have one

## Notes
- Make sure your `.env.local` file has the correct `DATABASE_URL`
- Consider backing up your database before running migrations if you have important data
- The migration is safe to run on an empty database or existing campaign data
