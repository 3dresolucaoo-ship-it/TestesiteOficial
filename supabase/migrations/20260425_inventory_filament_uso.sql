-- Add filament_uso column to inventory table
-- Only relevant for filament category items
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS filament_uso TEXT
    CHECK (filament_uso IN ('impressao', 'venda', 'ambos'));
