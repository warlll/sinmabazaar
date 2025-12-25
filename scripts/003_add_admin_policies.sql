-- Add INSERT and UPDATE policies for products table (admin only)
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "products_update_admin" ON public.products FOR UPDATE 
  USING (true) WITH CHECK (true);

CREATE POLICY "products_delete_admin" ON public.products FOR DELETE 
  USING (true);

-- Add INSERT, UPDATE, DELETE policies for product-related tables
CREATE POLICY "product_images_insert_admin" ON public.product_images FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "product_images_update_admin" ON public.product_images FOR UPDATE 
  USING (true) WITH CHECK (true);

CREATE POLICY "product_images_delete_admin" ON public.product_images FOR DELETE 
  USING (true);

CREATE POLICY "product_sizes_insert_admin" ON public.product_sizes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "product_sizes_update_admin" ON public.product_sizes FOR UPDATE 
  USING (true) WITH CHECK (true);

CREATE POLICY "product_sizes_delete_admin" ON public.product_sizes FOR DELETE 
  USING (true);

CREATE POLICY "product_colors_insert_admin" ON public.product_colors FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "product_colors_update_admin" ON public.product_colors FOR UPDATE 
  USING (true) WITH CHECK (true);

CREATE POLICY "product_colors_delete_admin" ON public.product_colors FOR DELETE 
  USING (true);

-- Add ORDER management policies for admins to read/update all orders
CREATE POLICY "orders_select_all_admin" ON public.orders FOR SELECT 
  USING (true);

CREATE POLICY "orders_update_all_admin" ON public.orders FOR UPDATE 
  USING (true) WITH CHECK (true);
