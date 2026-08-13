import { supabase } from './supabaseClient'

export interface ShopSettings {
  shippingTime: string
}

const DEFAULT_SETTINGS: ShopSettings = {
  shippingTime: 'Entregas en España en 3-5 días laborables.',
}

export async function loadShopSettings(): Promise<ShopSettings> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('shipping_time')
    .eq('id', true)
    .maybeSingle()
  if (error || !data) return DEFAULT_SETTINGS
  return { shippingTime: data.shipping_time }
}

export async function updateShopSettings(patch: Partial<ShopSettings>): Promise<ShopSettings> {
  const { error } = await supabase
    .from('shop_settings')
    .update({ shipping_time: patch.shippingTime })
    .eq('id', true)
  if (error) throw error
  return loadShopSettings()
}
