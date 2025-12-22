-- Seed Data for J4 Internal Manager
-- Run this after schema.sql to populate with real import data

-- Step 1: Insert import
INSERT INTO imports (supplier, total_usd, trm, import_cost_percent, total_cop, status, user_id)
VALUES ('MHC GROUP FREE ZONE CO., LTD', 43181.29, 4100, 40, 43181.29 * 4100 * 1.4, 'en_transito', NULL);

-- Step 2: Check what ID the import got
-- SELECT id FROM imports WHERE supplier = 'MHC GROUP FREE ZONE CO., LTD';

-- Step 3: Insert products (using import ID 7) with quantities
INSERT INTO products (import_id, type, dimensions, thickness, color, weight_per_unit, quantity, unit_cost_cop)
VALUES
  (7, 'acrilico_cast', '1220x2440 mm', 3, 'Cristal 000', NULL, 192, 24.72 * 4100 * 1.4),
  (7, 'acrilico_cast', '1220x2440 mm', 2.5, 'Opal 425', NULL, 104, 22.85 * 4100 * 1.4),
  (7, 'acrilico_cast', '1220x2440 mm', 3, 'Negro 502', NULL, 107, 26.54 * 4100 * 1.4),
  (7, 'espejo', '1220x1830 mm', 2.5, 'Dorado JM1003', NULL, 300, 19.17 * 4100 * 1.4),
  (7, 'espejo', '1220x1830 mm', 2.5, 'Plata JM1001', NULL, 150, 19.17 * 4100 * 1.4),
  (7, 'accesorios', 'Bisagra acrílica L30xW33', NULL, NULL, NULL, 10000, 0.10 * 4100 * 1.4),
  (7, 'accesorios', 'Bisagra acrílica L45xW38', NULL, NULL, NULL, 10000, 0.16 * 4100 * 1.4);

-- Add quantities to products (since they're not distributed yet)
-- This is a workaround - ideally we'd have a quantity field in products
-- For now, we'll show these quantities in the UI

-- Products are created but NOT distributed to inventory initially
-- They can be distributed manually later

-- Insert prices with 35% margin
INSERT INTO prices (product_id, margin_percent, suggested_price)
SELECT id, 35, unit_cost_cop * 1.35 FROM products WHERE import_id = 7;