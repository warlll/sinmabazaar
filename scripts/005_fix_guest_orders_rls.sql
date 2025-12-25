-- Add RLS policy to allow guest orders (where user_id is null)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert guest orders (user_id is null)
CREATE POLICY "Allow guest orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR user_id IS NULL);

-- Allow admin/authenticated users to read all orders
CREATE POLICY "Allow reading all orders" ON orders
  FOR SELECT
  USING (true);

-- Allow admin to update orders
CREATE POLICY "Allow updating orders" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow inserting order items
CREATE POLICY "Allow inserting order items" ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Allow reading order items
CREATE POLICY "Allow reading order items" ON order_items
  FOR SELECT
  USING (true);
