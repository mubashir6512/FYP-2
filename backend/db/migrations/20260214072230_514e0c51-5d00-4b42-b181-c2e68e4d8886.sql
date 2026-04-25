
-- Products table for dealer inventory
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT NOT NULL DEFAULT 'paint',
  brand TEXT,
  color_hex TEXT,
  unit TEXT NOT NULL DEFAULT 'litre',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can manage own products" ON public.products FOR ALL USING (auth.uid() = dealer_id);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);

CREATE INDEX idx_products_dealer ON public.products(dealer_id);
CREATE INDEX idx_products_category ON public.products(category);

-- POS Orders table
CREATE TABLE public.pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  dealer_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_phone TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can manage own orders" ON public.pos_orders FOR ALL USING (auth.uid() = dealer_id);
CREATE POLICY "Customers can view own orders" ON public.pos_orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all orders" ON public.pos_orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_orders_dealer ON public.pos_orders(dealer_id);
CREATE INDEX idx_orders_customer ON public.pos_orders(customer_id);
CREATE INDEX idx_orders_created ON public.pos_orders(created_at DESC);

-- Order items table
CREATE TABLE public.pos_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.pos_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items follow order access" ON public.pos_order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pos_orders WHERE id = order_id AND (dealer_id = auth.uid() OR customer_id = auth.uid())));
CREATE POLICY "Dealers can insert order items" ON public.pos_order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.pos_orders WHERE id = order_id AND dealer_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.pos_order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'PV-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.pos_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Function to deduct stock on order
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER deduct_stock_after_order_item
  AFTER INSERT ON public.pos_order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_order_item();

-- Updated at trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
