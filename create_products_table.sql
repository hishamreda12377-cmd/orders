-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  pack TEXT DEFAULT 'العلبة 24 قطعة',
  images TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON products;
CREATE POLICY "anon_all" ON products
  FOR ALL USING (true) WITH CHECK (true);
