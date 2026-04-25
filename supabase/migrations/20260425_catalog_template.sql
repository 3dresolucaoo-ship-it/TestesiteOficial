-- Add template column to catalogs table
-- Existing rows default to 'grid' (current behavior)
ALTER TABLE catalogs
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'grid'
    CHECK (template IN ('grid', 'list', 'minimal'));
