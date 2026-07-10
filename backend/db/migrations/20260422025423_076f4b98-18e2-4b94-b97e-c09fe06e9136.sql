-- Generate unique order_number on insert into pos_orders
DROP TRIGGER IF EXISTS set_pos_order_number ON public.pos_orders;
CREATE TRIGGER set_pos_order_number
BEFORE INSERT ON public.pos_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- Auto-deduct product stock on each pos_order_items insert
DROP TRIGGER IF EXISTS deduct_stock_after_order_item ON public.pos_order_items;
CREATE TRIGGER deduct_stock_after_order_item
AFTER INSERT ON public.pos_order_items
FOR EACH ROW
EXECUTE FUNCTION public.deduct_stock_on_order_item();

