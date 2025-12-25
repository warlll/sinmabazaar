-- Add support for guest orders (without user authentication)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_state TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_notes TEXT;

-- Update RLS policy to allow guest orders
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_authenticated_or_guest" ON public.orders FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Update select policy to allow guests and admins
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own_or_guest" ON public.orders FOR SELECT
  USING (
    (auth.uid() = user_id) OR (user_id IS NULL)
  );

-- Allow updating orders for admins (user_id is NULL for guest orders)
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own_or_admin" ON public.orders FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);
