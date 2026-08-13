-- Lets the admin clean up test orders directly from the Pedidos tab.
create policy "orders_delete_admin" on public.orders
  for delete using (auth.jwt() ->> 'email' = 'ricaurtejuanc@gmail.com');
