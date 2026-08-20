import { supabase } from './supabaseClient'

export interface ShopSettings {
  shippingCost: number
  freeShippingThreshold: number
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shippingCost: 4.99,
  freeShippingThreshold: 100,
}

interface ShopSettingsRow {
  shipping_cost: number
  free_shipping_threshold: number
}

export async function loadShopSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('shipping_cost, free_shipping_threshold')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data) return DEFAULT_SHOP_SETTINGS
  const row = data as ShopSettingsRow
  return { shippingCost: row.shipping_cost, freeShippingThreshold: row.free_shipping_threshold }
}

export async function updateShopSettings(settings: ShopSettings): Promise<ShopSettings> {
  const { error } = await supabase
    .from('shop_settings')
    .update({
      shipping_cost: settings.shippingCost,
      free_shipping_threshold: settings.freeShippingThreshold,
    })
    .eq('id', 1)
  if (error) throw error
  return loadShopSettings()
}
