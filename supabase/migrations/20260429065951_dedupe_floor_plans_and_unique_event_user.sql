/*
  # Dedupe floor_plans and enforce uniqueness per (event_id, user_id)

  1. Changes
    - Remove duplicate `floor_plans` rows for the same (event_id, user_id) pair,
      preferring the plan that has the most furniture items; ties broken by most recent.
    - Add a partial unique index on (event_id, user_id) where event_id is not null
      so future inserts cannot create duplicates.

  2. Notes
    - Duplicates caused the designer to fail on reload with PGRST116
      ("JSON object requested, multiple (or no) rows returned"). Data is preserved by
      only deleting the LESS populated duplicate.
*/

WITH ranked AS (
  SELECT
    fp.id,
    fp.event_id,
    fp.user_id,
    (SELECT count(*) FROM furniture_items fi WHERE fi.floor_plan_id = fp.id) AS item_count,
    fp.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY fp.event_id, fp.user_id
      ORDER BY
        (SELECT count(*) FROM furniture_items fi WHERE fi.floor_plan_id = fp.id) DESC,
        fp.created_at DESC
    ) AS rn
  FROM floor_plans fp
  WHERE fp.event_id IS NOT NULL AND fp.user_id IS NOT NULL
)
DELETE FROM floor_plans
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS floor_plans_event_user_unique
  ON floor_plans (event_id, user_id)
  WHERE event_id IS NOT NULL AND user_id IS NOT NULL;
