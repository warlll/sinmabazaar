-- Fix orders table to allow NULL user_id for guest orders
ALTER TABLE public.orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- Remove old conflicting policies
DROP POLICY IF EXISTS "orders_insert_authenticated_or_guest" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own_or_guest" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own_or_admin" ON public.orders;
DROP POLICY IF EXISTS "Allow guest orders" ON public.orders;
DROP POLICY IF EXISTS "Allow reading all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow updating orders" ON public.orders;
DROP POLICY IF EXISTS "Allow inserting order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow reading order items" ON public.order_items;

-- Create clean policies for orders
-- Allow anyone to insert orders (authenticated or guest)
CREATE POLICY "orders_insert_policy" ON public.orders
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL AND guest_phone IS NOT NULL)
  );

-- Allow users to view their own orders or admins to view all
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Allow admins to update any order
CREATE POLICY "orders_update_policy" ON public.orders
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "order_items_insert_policy" ON public.order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select_policy" ON public.order_items
  FOR SELECT
  USING (true);

CREATE POLICY "order_items_update_policy" ON public.order_items
  FOR UPDATE
  USING (true);
